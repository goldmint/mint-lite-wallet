import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {ApiService} from "../../../services/api.service";
import {SumusTransactionService} from "../../../services/sumus-transaction.service";
import {Wallet} from "../../../interfaces/wallet";
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

  private chrome = window['chrome'];
  private identify: string;
  private timeTxFailed = environment.timeTxFailed;

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
      this.nonce = +data['res'].approved_nonce;

      // if (this.currentWallet.nonce < this.nonce) {
      //   this.allWallets[this.currentWalletIndex].nonce = this.nonce;
      //   this.chromeStorage.save('wallets', this.allWallets);
      // } else {
      //   this.nonce = this.currentWallet.nonce;
      // }

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

    this.apiService.postWalletTransaction(result.txData, 'TransferAssetsTransaction').subscribe((data) => {
      const timeEnd = (new Date().getTime() + this.timeTxFailed);

      this.allWallets[this.currentWalletIndex].tx = {
        hash: null,
        endTime: null,
        amount: null,
        token: null
      };
      this.allWallets[this.currentWalletIndex].tx.hash = result.txHash;
      this.allWallets[this.currentWalletIndex].tx.endTime = timeEnd;
      this.allWallets[this.currentWalletIndex].tx.amount = this.currentTx.amount;
      this.allWallets[this.currentWalletIndex].tx.token = this.currentTx.token.toUpperCase();

      this.allWallets[this.currentWalletIndex].nonce = this.nonce+1;

      this.chrome.storage.local.set({['wallets']: this.allWallets}, () => {
        this.chrome.runtime.sendMessage({sendTxResult: { hash: result.txHash, id: this.currentTx.id, tabId: this.currentTx.tabId }});
      });

      this.cancelTransfer(false);
      this.ref.detectChanges();
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
