import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { SendData } from "../../../models/send-data";
import { Subscription } from "rxjs/index";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "../../../services/common.service";
import { ApiService } from "../../../services/api.service";
import { AccountBalance } from "../../../models/account-balance";
import { environment } from "../../../../environments/environment";
import { SumusTransactionService } from "../../../services/sumus-transaction.service";
import { Tx, Wallet } from "../../../interfaces/wallet";
import * as CryptoJS from 'crypto-js';
import { BigNumber } from 'bignumber.js';

@Component({
  selector: 'app-send-tokens',
  templateUrl: './send-tokens.component.html',
  styleUrls: ['./send-tokens.component.scss']
})
export class SendTokensComponent implements OnInit, OnDestroy {

  public page = ['send', 'confirm', 'post', 'failure', 'success'];
  public currentPage = this.page[0];

  public sendData = new SendData();
  public allWallets: Wallet[] = [];
  public currentWallet: Wallet;
  public currentWalletIndex: number;
  public loading: boolean = false;
  public invalidBalance: boolean = true;
  public isAddressMatch: boolean = false;
  public balance = new AccountBalance();
  public txId = '';
  public detailsLink: string = environment.detailsTxInfoLink;
  public nonce: number;
  public fee: string = '0';
  public accountName: string;
  public isEmissionWallet: boolean = false;
  public isWalletApproved: boolean;
  public network: string;
  public errorMessage: string = '';
  public tokenAmount: string = null;
  public tokenResult: string;

  private sub1: Subscription;
  private chrome = window['chrome'];
  private identify: string;
  private timeTxFailed = environment.timeTxFailed;
  private interval: any;
  private retrySendTxCount: number = 0;

  constructor(
    private apiService: ApiService,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private sumusTransactionService: SumusTransactionService
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const address = this.route.snapshot.paramMap.get('address');
    if (this.route.snapshot.paramMap.get('amount')) {
      const amount = this.route.snapshot.paramMap.get('amount');
      this.tokenAmount = this.substrValue(amount);
      this.sendData.amount = this.substrValue(amount);
    }

    this.sendData.token = id ? id : 'gold';
    if (address) {
      this.sendData.to = address;
      this.chrome.storage.local.remove('openSendTokenPage', () => { });
    }

    this.sub1 = this.commonService.chooseAccount$.subscribe(() => {
      this.currentPage === this.page[0] && this.getCurrentWallet();
    });

    this.getCurrentWallet();
  }

  getCurrentWallet() {
    this.loading = true;
    this.chrome.storage.local.get(null, (result) => {

      this.chrome.runtime.getBackgroundPage(page => {
        this.identify = page.sessionStorage.identify;
      });

      this.currentWalletIndex = result.currentWallet;
      this.currentWallet = result.wallets[result.currentWallet];
      this.allWallets = result.wallets;
      this.sendData.from = this.currentWallet.publicKey;
      this.accountName = this.currentWallet.name;
      this.network = result.currentNetwork || 'main';

      this.apiService.getWalletBalance(this.currentWallet.publicKey).subscribe(data => {
        this.balance.mnt = data['res'].balance.mint;
        this.balance.gold = data['res'].balance.gold;
        this.isEmissionWallet = data['res'].tags.indexOf('EmissionWallet') >= 0;
        this.isWalletApproved = data['res'].tags.indexOf('approved') >= 0;

        this.checkAddressMatch();
        this.checkAmount();
        this.loading = false;
        this.ref.detectChanges();
      });
      this.ref.detectChanges();
    });
  }

  checkAmount() {
    this.fee = this.sumusTransactionService.feeCalculate(this.balance.mnt, this.sendData.amount.toString(), this.sendData.token);
    const tokenBalance = this.balance[this.sendData.token];
    const balance = (+tokenBalance - +this.fee) > 0 ? new BigNumber(tokenBalance).minus(this.fee) : new BigNumber(0);

    if (!this.isEmissionWallet && (!+this.sendData.amount || balance.isLessThan(new BigNumber(this.sendData.amount)))) {
      this.invalidBalance = true;
    } else {
      this.invalidBalance = false;
    }
    this.ref.detectChanges();
  }

  changeToken() {
    this.tokenAmount = "";
    this.sendData.amount = "";
    this.checkAmount();
  }

  changeValue(event) {
    event.target.value = this.substrValue(event.target.value);
    this.sendData.amount = event.target.value;

    this.fee = this.sumusTransactionService.feeCalculate(this.balance.mnt, this.sendData.amount, this.sendData.token);
    const tokenBalance = this.balance[this.sendData.token];
    const balance = (+tokenBalance - +this.fee) > 0 ? new BigNumber(tokenBalance).minus(this.fee) : new BigNumber(0);

    if (!this.isEmissionWallet && (!+this.sendData.amount || balance.isLessThan(new BigNumber(this.sendData.amount)))) {
      this.invalidBalance = true;
    } else {
      this.invalidBalance = false;
    }
    this.ref.detectChanges();
  }

  setAllValue() {
    const tokenBalance = this.balance[this.sendData.token];
    this.fee = this.sumusTransactionService.feeCalculate(this.balance.mnt, tokenBalance, this.sendData.token);
    const allValue = (+tokenBalance - +this.fee) > 0 ? new BigNumber(tokenBalance).minus(this.fee) : new BigNumber(0);
    const valueStr = this.substrValue(allValue.toString(10));

    this.tokenAmount = valueStr;
    this.sendData.amount = valueStr;
    this.checkAmount();
    this.ref.detectChanges();
  }

  commonSubstrValue(value: string) {
    return this.commonService.substrValue(value);
  }

  substrValue(value: number | string) {
    return value.toString()
      .replace(',', '.')
      .replace(/([^\d.])|(^\.)/g, '')
      .replace(/^(\d{1,6})\d*(?:(\.\d{0,18})[\d.]*)?/, '$1$2')
      .replace(/^0+(\d)/, '$1');
  }

  checkAddressMatch() {
    this.isAddressMatch = this.sendData.from === this.sendData.to;
    this.ref.detectChanges();
  }

  copyText(val: string) {
    this.commonService.copyText(val);
  }

  clearTxQueue() {
    clearInterval(this.interval);
  }

  sendTransaction() {
    this.loading = true;
    this.apiService.getWalletBalance(this.currentWallet.publicKey).subscribe(data => {
      this.fee = this.sumusTransactionService.feeCalculate(this.balance.mnt, this.sendData.amount, this.sendData.token);
      this.tokenResult = new BigNumber(this.sendData.amount).toString(10);
      this.nonce = +data['res'].approved_nonce + 1;

      this.currentPage = this.page[1];
      this.loading = false;
      this.ref.detectChanges();
    }, () => {
      this.failedTx();
    });
    this.ref.detectChanges();
  }

  confirmTransfer() {
    this.currentPage = this.page[2];
    this.loading = true;

    let privateKey;
    try {
      privateKey = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      this.failedTx();
      return;
    }

    const amount = new BigNumber(this.sendData.amount).toString(10);
    const result = this.sumusTransactionService.makeTransferAssetTransaction(
      privateKey, this.sendData.to, this.sendData.token.toUpperCase(), amount, this.nonce
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
        tx.amount = this.sendData.amount;
        tx.token = this.sendData.token.toUpperCase();
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

        this.chrome.storage.local.set({ ['wallets']: this.allWallets }, () => {
          this.chrome.runtime.sendMessage({ newTransaction: true });
        });

        this.txId = result.txDigest;
        this.loading = false;
        this.currentPage = this.page[4];
        this.ref.detectChanges();

      }, (error) => {
        debugger;
        let skip = false;
        if (error && error.error && error.error.res) {
          const res = error.error.res;
          if (!res.code) {
            this.errorMessage = 'Service is unavailable. Please retry later';
          } else if (res.code == 42 || res.code == 43) {
            this.errorMessage = 'Transaction pool overflow'
          } else if (res.code && res.wallet_inconsistency) {
            this.errorMessage = 'Not enough funds or destination is unable to receive tokens'
          } else if (res.code && res.nonce_ahead) {
            this.errorMessage = 'Transaction is out of range'
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

  failedTx() {
    this.currentPage = this.page[3];
    this.loading = false;
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
    clearInterval(this.interval);
  }
}
