import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {ApiService} from "../../../services/api.service";
import {SumusTransactionService} from "../../../services/sumus-transaction.service";
import {Tx, Wallet} from "../../../interfaces/wallet";
import {environment} from "../../../../environments/environment";
import * as CryptoJS from 'crypto-js';
import {UnconfirmedTx} from "../../../interfaces/unconfirmed-tx";

@Component({
  selector: 'app-confirm-transaction',
  templateUrl: './confirm-transaction.component.html',
  styleUrls: ['./confirm-transaction.component.scss']
})
export class ConfirmTransactionComponent implements OnInit {

  public page = ['confirm', 'failure'];
  public currentPage = this.page[0];

  public allWallets: Wallet[] = [];
  public currentWallet: Wallet;
  public currentWalletIndex: number;
  public loading: boolean = false;
  public nonce: number;
  public fee: number = 0;
  public unconfirmedTx: UnconfirmedTx[];
  public currentTx: UnconfirmedTx;
  public network: string;
  public errorMessage: string = '';

  private chrome = window['chrome'];
  private identify: string;
  private timeTxFailed = environment.timeTxFailed;
  private retrySendTxCount: number = 0;

  constructor(
    private apiService: ApiService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private sumusTransactionService: SumusTransactionService,
    private chromeStorage: ChromeStorageService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.unconfirmedTx = result.unconfirmedTx;
      this.allWallets = result.wallets;
      this.network = result.currentNetwork;
      this.getTxData();
    });

    this.chrome.runtime.getBackgroundPage(page => {
      this.identify = page.sessionStorage.identify;
    });
  }

  getTxData() {
    if (!this.unconfirmedTx.length) {
      this.zone.run(() => {
        this.router.navigate(['/home/account']);
      });
      return;
    }

    this.currentPage = this.page[0];
    this.loading = true;
    this.currentTx = this.unconfirmedTx[0];

    this.allWallets.forEach((item, index) => {
      if (item.publicKey === this.currentTx.from) {
        this.currentWallet = item;
        this.currentWalletIndex = index;
      }
    });

    this.apiService.getWalletBalance(this.currentTx.from).subscribe(data => {
      this.fee = this.sumusTransactionService.feeCalculate(this.currentTx.amount, this.currentTx.token)
      this.nonce = +data['res'].approved_nonce + 1;

      this.loading = false;
      this.ref.detectChanges();
    }, () => {
      this.failedTx();
    });
    this.ref.detectChanges();
  }

  cancelTransfer(sendResult) {
    this.chrome.storage.local.get(null, (result) => {
      this.unconfirmedTx = result.unconfirmedTx;

      this.unconfirmedTx = this.unconfirmedTx.filter(item => {
        return item.id !== this.currentTx.id;
      });

      this.chrome.storage.local.set({['unconfirmedTx']: this.unconfirmedTx}, () => {
        sendResult && this.chrome.runtime.sendMessage({sendTxResult: { hash: null, id: this.currentTx.id, tabId: this.currentTx.tabId }});
        this.loading = false;
        this.getTxData();
        this.ref.detectChanges();
      });
    });
  }

  confirmTransfer() {
    this.loading = true;
    let privateKey;
    try {
      privateKey = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      this.failedTx();
      return;
    }

    const result = this.sumusTransactionService.makeTransferAssetTransaction(
      privateKey, this.currentTx.to, this.currentTx.token.toUpperCase(), this.currentTx.amount, this.nonce
    );

    this.apiService.getBlockChainStatus().subscribe((data: any) => {
      this.errorMessage = '';
      if (!data || !data.res || !data.res.blockchain_state || !data.res.blockchain_state.block_count) {
        this.failedTx();
        return;
      };
      const blockCount = data.res.blockchain_state.block_count;

      this.apiService.postWalletTransaction(result.txData, result.txName).subscribe(() => {
        const timeEnd = (new Date().getTime() + this.timeTxFailed);

        let tx: Tx | any = {};
        tx.data = {
          data: null,
          name: null
        };

        tx.hash = result.txDigest;
        tx.endTime = timeEnd;
        tx.amount = this.currentTx.amount;
        tx.token = this.currentTx.token.toUpperCase();
        tx.network = this.network;
        tx.data.data = result.txData;
        tx.data.name = result.txName;
        tx.nonce = this.nonce;
        tx.blockId = blockCount ? (+blockCount - 1) : null;

        if (this.allWallets[this.currentWalletIndex].tx) {
          this.allWallets[this.currentWalletIndex].tx.push(tx);
        } else {
          this.allWallets[this.currentWalletIndex].tx = [tx];
        }

        this.chrome.storage.local.set({['wallets']: this.allWallets}, () => {
          this.chrome.runtime.sendMessage({sendTxResult: { hash: result.txDigest, id: this.currentTx.id, tabId: this.currentTx.tabId }});
        });

        this.cancelTransfer(false);
        this.ref.detectChanges();

      }, (error) => {
        let skip = false;
        if (error && error.error && error.error.res) {
          const res = error.error.res;
          if (!res.code) {
            this.errorMessage = 'Service is unavailable. Please retry later';
          } else if (res.code == 42 || res.code == 43) {
            this.errorMessage = 'Transaction pool overflow';
          } else if (res.code && res.wallet_inconsistency) {
            this.errorMessage = 'Not enough funds';
          } else if (res.code && res.nonce_ahead) {
            this.errorMessage = 'Transaction is out of range';
          } else if (res.code && res.nonce_behind) {
            // resend tx
            this.nonce++;
            setTimeout(() => {
              if (this.retrySendTxCount >= 10) {
                this.failedTx();
                return;
              }
              this.retrySendTxCount++;
              this.confirmTransfer();
            }, 200);
            skip = true;
          }
        }
        !skip && this.failedTx();
      });

    }, () => {
      this.failedTx();
    });
    this.ref.detectChanges();
  }

  done() {
    this.getTxData();
  }

  failedTx() {
    this.currentPage = this.page[1];

    this.chrome.storage.local.get(null, (result) => {
      this.unconfirmedTx = result.unconfirmedTx;

      this.unconfirmedTx = this.unconfirmedTx.filter(item => {
        return item.id !== this.currentTx.id;
      });

      this.chrome.storage.local.set({['unconfirmedTx']: this.unconfirmedTx}, () => {
        this.chrome.runtime.sendMessage({sendTxResult: { hash: null, id: this.currentTx.id, tabId: this.currentTx.tabId }});
        this.loading = false;
        this.ref.detectChanges();
      });
    });
  }

}
