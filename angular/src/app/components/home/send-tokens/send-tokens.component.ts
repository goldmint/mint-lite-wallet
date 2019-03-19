import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {SendData} from "../../../models/send-data";
import {Subscription} from "rxjs/index";
import {ActivatedRoute, Router} from "@angular/router";
import {CommonService} from "../../../services/common.service";
import {ApiService} from "../../../services/api.service";
import {AccountBalance} from "../../../models/account-balance";
import {environment} from "../../../../environments/environment";
import {SumusTransactionService} from "../../../services/sumus-transaction.service";
import {Wallet} from "../../../interfaces/wallet";
import {MessageBoxService} from "../../../services/message-box.service";
import * as CryptoJS from 'crypto-js';
import {ChromeStorageService} from "../../../services/chrome-storage.service";

@Component({
  selector: 'app-send-tokens',
  templateUrl: './send-tokens.component.html',
  styleUrls: ['./send-tokens.component.scss']
})
export class SendTokensComponent implements OnInit, OnDestroy {

  public page = ['send', 'confirm', 'post', 'failure', 'success'];
  public currentPage = this.page[0];

  public sendData = new SendData;
  public allWallets: Wallet[] = [];
  public currentWallet: Wallet;
  public currentWalletIndex: number;
  public loading: boolean = false;
  public invalidBalance: boolean = true;
  public isAddressMatch: boolean = false;
  public balance = new AccountBalance();
  public txId = '';
  public detailsLink: string = '';
  public nonce: number;
  public fee: number = 0;
  public accountName: string;
  public isEmissionWallet: boolean = false;
  public network: string;

  private sub1: Subscription;
  private sub2: Subscription;
  private chrome = window['chrome'];
  private identify: string;
  private timeTxFailed = environment.timeTxFailed;
  private interval: any;

  constructor(
    private apiService: ApiService,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private sumusTransactionService: SumusTransactionService,
    private messageBox: MessageBoxService,
    private chromeStorage: ChromeStorageService
  ) { }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.sendData.token = params.id ? params.id : 'gold';
      this.ref.detectChanges();
    });

    this.sub2 = this.commonService.chooseAccount$.subscribe(() => {
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
      this.network = result.currentNetwork;
      this.detailsLink = environment.detailsTxInfoLink[this.network];

      // if (this.currentWallet.tx) {
      //   clearInterval(this.interval);
      //   this.checkTransactionStatus(this.currentWallet.tx.hash);
      //
      //   this.interval = setInterval(() => {
      //     this.currentWallet.tx && this.checkTransactionStatus(this.currentWallet.tx.hash);
      //   }, 5000);
      // }

      this.apiService.getWalletBalance(this.currentWallet.publicKey).subscribe(data => {
        this.balance.mnt = data['res'].balance.mint;
        this.balance.gold = data['res'].balance.gold;
        this.isEmissionWallet = data['res'].tags.indexOf('EmissionWallet') >= 0;

        this.checkAddressMatch();
        this.checkAmount();
        this.loading = false;
        this.ref.detectChanges();
      });
      this.ref.detectChanges();
    });
  }

  checkAmount() {
    this.fee = this.sumusTransactionService.feeCalculate(this.sendData.amount, this.sendData.token);
    let balance = this.balance[this.sendData.token] - this.fee;

    if (!this.isEmissionWallet && (this.sendData.amount === 0 || this.sendData.amount > balance)) {
      this.invalidBalance = true;
    } else {
      this.invalidBalance = false;
    }
    this.ref.detectChanges();
  }

  changeValue(event) {
    event.target.value = this.substrValue(event.target.value);
    this.sendData.amount = +event.target.value;
    event.target.setSelectionRange(event.target.value.length, event.target.value.length);

    this.fee = this.sumusTransactionService.feeCalculate(this.sendData.amount, this.sendData.token);
    let balance = this.balance[this.sendData.token] - this.fee;

    if (!this.isEmissionWallet && (this.sendData.amount === 0 || this.sendData.amount > balance)) {
      this.invalidBalance = true;
    } else {
      this.invalidBalance = false;
    }
    this.ref.detectChanges();
  }

  substrValue(value: number|string) {
    return value.toString()
      .replace(',', '.')
      .replace(/([^\d.])|(^\.)/g, '')
      .replace(/^(\d{1,6})\d*(?:(\.\d{0,6})[\d.]*)?/, '$1$2')
      .replace(/^0+(\d)/, '$1');
  }

  checkAddressMatch() {
    this.isAddressMatch = this.sendData.from === this.sendData.to;
    this.ref.detectChanges();
  }

  copyText(val: string){
    this.commonService.copyText(val);
  }

  checkTransactionStatus(hash: string) {
    this.chrome.storage.local.get(null, (result) => {
      let wallet = result.wallets[result.currentWallet];

      if (wallet.tx) {
        this.currentPage !== this.page[2] && (this.currentPage = this.page[2]);
      } else {
        this.clearTxQueue();
        this.txId = hash;
        this.currentPage = this.page[0];
      }
      this.ref.detectChanges();
    });
  }

  clearTxQueue() {
    clearInterval(this.interval);
  }

  sendTransaction() {
    this.loading = true;
    this.apiService.getWalletBalance(this.currentWallet.publicKey).subscribe(data => {
      this.fee = this.sumusTransactionService.feeCalculate(this.sendData.amount, this.sendData.token);
      this.nonce = +data['res'].approved_nonce;

      if (this.currentWallet.nonce < this.nonce) {
        this.allWallets[this.currentWalletIndex].nonce = this.nonce;
        this.chromeStorage.save('wallets', this.allWallets);
      } else {
        this.nonce = this.currentWallet.nonce;
      }

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

    const result = this.sumusTransactionService.makeTransferAssetTransaction(
      privateKey, this.sendData.to, this.sendData.token.toUpperCase(), this.sendData.amount, this.nonce+1
    );

    this.apiService.postWalletTransaction(result.txData, result.txName).subscribe(() => {
        const timeEnd = (new Date().getTime() + this.timeTxFailed);

        this.allWallets[this.currentWalletIndex].tx = {
          hash: null,
          endTime: null,
          amount: null,
          token: null,
          network: null
        };
        this.allWallets[this.currentWalletIndex].tx.hash = result.txDigest;
        this.allWallets[this.currentWalletIndex].tx.endTime = timeEnd;
        this.allWallets[this.currentWalletIndex].tx.amount = this.sendData.amount;
        this.allWallets[this.currentWalletIndex].tx.token = this.sendData.token.toUpperCase();
        this.allWallets[this.currentWalletIndex].tx.network = this.network;

        this.allWallets[this.currentWalletIndex].nonce = this.nonce+1;

        this.chrome.storage.local.set({['wallets']: this.allWallets}, () => {
          this.chrome.runtime.sendMessage({newTransaction: true});
        });

        this.txId = result.txDigest;
        this.loading = false;
        this.currentPage = this.page[4];
      this.ref.detectChanges();
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
    this.sub2 && this.sub2.unsubscribe();
    clearInterval(this.interval);
  }
}
