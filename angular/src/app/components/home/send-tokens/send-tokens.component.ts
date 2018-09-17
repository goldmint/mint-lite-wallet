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
  public detailsLink: string = environment.detailsTxInfoLink;

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
    private chromeStorage: ChromeStorageService,
  ) { }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.sendData.token = params.id ? params.id : 'gold';
      this.ref.detectChanges();
    });

    this.sub2 = this.commonService.chooseAccount$.subscribe(() => {
      this.getCurrentWallet();
    });

    this.getCurrentWallet();
  }

  getCurrentWallet() {
    this.loading = true;
    this.chrome.storage.local.get(null, (result) => {

      this.chrome.runtime.getBackgroundPage(page => {
        this.identify = page.sessionStorage.identify;
      });

      this.currentWallet = result.wallets[result.currentWallet];
      this.allWallets = result.wallets;
      this.sendData.from = this.currentWallet.publicKey;

      if (this.currentWallet.tx) {
        const time = new Date().getTime();
        if (time < this.currentWallet.tx.endTime) {
          this.currentPage = this.page[2];
          this.checkTransactionStatus(this.currentWallet.tx.hash, this.currentWallet.tx.endTime);

          this.interval = setInterval(() => {
            this.checkTransactionStatus(this.currentWallet.tx.hash, this.currentWallet.tx.endTime);
          }, 30000);

          this.ref.detectChanges();
        } else {
          delete this.allWallets[this.currentWalletIndex].tx;
          this.chromeStorage.save('wallets', this.allWallets);
        }
      }

      this.apiService.getWalletBalance(this.currentWallet.publicKey).subscribe(data => {
        this.balance.gold = data['data'].goldAmount;
        this.balance.mnt = data['data'].mintAmount;

        this.checkAddressMatch();
        this.loading = false;
        this.ref.detectChanges();
      });
      this.ref.detectChanges();
    });
  }

  checkAmount() {
    if (this.sendData.amount === 0 || this.sendData.amount > this.balance[this.sendData.token]) {
      this.invalidBalance = true;
    } else {
      this.invalidBalance = false;
    }
    this.ref.detectChanges();
  }

  checkAddressMatch() {
    this.isAddressMatch = this.sendData.from === this.sendData.to;
    this.ref.detectChanges();
  }

  copyText(val: string){
    this.commonService.copyText(val);
  }

  checkTransactionStatus(hash: string, timeEnd: number) {
    const time = new Date().getTime();

    if (time < timeEnd) {
      this.apiService.getTransactionInfo(hash).subscribe(info => {
        if (info['data']['status'] === 1) { // pending
          this.currentPage !== this.page[2] && (this.currentPage = this.page[2]);
        } else if(info['data']['status'] === 2) { // success
          this.clearTxQueue();
          this.txId = hash;
          this.currentPage = this.page[4];
        } else if (info['data']['status'] === 3) { // failed
          this.clearTxQueue();
          this.currentPage = this.page[3];
        }

        this.ref.detectChanges();
      });
    } else {
      // failed
      this.currentPage = this.page[3];
      this.clearTxQueue();
      this.ref.detectChanges();
    }
  }

  clearTxQueue() {
    delete this.allWallets[this.currentWalletIndex].tx;
    this.chromeStorage.save('wallets', this.allWallets);
    clearInterval(this.interval);
  }


  confirmTransfer() {
    this.currentPage = this.page[2];
    this.ref.detectChanges();

    let privateKey;
    try {
      privateKey = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      this.messageBox.alert('Something went wrong');
      this.ref.detectChanges();
      return;
    }

    const result = this.sumusTransactionService.makeTransferAssetTransaction(
      privateKey, this.sendData.to, this.sendData.token.toUpperCase(), this.sendData.amount
    );

    this.apiService.postWalletTransaction(result.txData, 'TransferAssetsTransaction').subscribe(() => {
      const timeEnd = (new Date().getTime() + this.timeTxFailed)
      this.allWallets[this.currentWalletIndex].tx.hash = result.txHash;
      this.allWallets[this.currentWalletIndex].tx.endTime = timeEnd;

      this.chromeStorage.save('wallets', this.allWallets);
      this.currentPage = this.page[2];

      this.interval = setInterval(() => {
        this.checkTransactionStatus(result.txHash, timeEnd);
      }, 30000);

      this.ref.detectChanges();
    }, () => {
      // failed
      this.currentPage = this.page[3];
      this.ref.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
    this.sub2 && this.sub2.unsubscribe();
    clearInterval(this.interval);
  }
}
