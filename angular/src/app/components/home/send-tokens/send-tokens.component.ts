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
  public nonce: number;

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

      this.currentWalletIndex = result.currentWallet;
      this.currentWallet = result.wallets[result.currentWallet];
      this.allWallets = result.wallets;
      this.sendData.from = this.currentWallet.publicKey;

      if (this.currentWallet.tx) {
        const time = new Date().getTime();
        if (time < this.currentWallet.tx.endTime) {
          // this.currentPage = this.page[2];
          this.checkTransactionStatus(this.currentWallet.tx.hash, this.currentWallet.tx.endTime);

          this.interval = setInterval(() => {
            this.checkTransactionStatus(this.currentWallet.tx.hash, this.currentWallet.tx.endTime);
          }, 10000);

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

  changeValue(event) {
    event.target.value = this.substrValue(event.target.value);
    this.sendData.amount = +event.target.value;
    event.target.setSelectionRange(event.target.value.length, event.target.value.length);

    if (this.sendData.amount === 0 || this.sendData.amount > this.balance[this.sendData.token]) {
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

  checkTransactionStatus(hash: string, timeEnd: number) {
    const time = new Date().getTime();

    if (time < timeEnd) {
      this.apiService.getTransactionInfo(hash).subscribe(info => {
        const status = info['data']['status'];

        if (status === 3) { // pending
          this.currentPage !== this.page[2] && (this.currentPage = this.page[2]);
        } else if(status === 2) { // success
          this.clearTxQueue();
          this.txId = hash;
          this.currentPage = this.page[0];
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

  sendTransaction() {
    this.loading = true;
    this.apiService.getWalletNonce(this.currentWallet.publicKey).subscribe(data => {
      if (data['res'].result == 0) {
        this.nonce = +data['res'].params.last_transaction_id;
        this.currentPage = this.page[1];
        this.loading = false;
      } else {
        this.failedTx();
      }
      this.ref.detectChanges();
    }, () => {
      // failed
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
      privateKey, this.sendData.to, this.sendData.token.toUpperCase(), this.sendData.amount, this.nonce
    );

    this.apiService.postWalletTransaction(result.txData, 'TransferAssetsTransaction').subscribe((data) => {
      if (data['res'].result == 0) {
        const timeEnd = (new Date().getTime() + this.timeTxFailed);

        this.allWallets[this.currentWalletIndex].tx = {
          hash: null,
          endTime: null
        };
        this.allWallets[this.currentWalletIndex].tx.hash = result.txHash;
        this.allWallets[this.currentWalletIndex].tx.endTime = timeEnd;

        this.chromeStorage.save('wallets', this.allWallets);
        this.txId = result.txHash;
        this.loading = false;
        this.currentPage = this.page[4];
      } else {
        this.failedTx();
      }
      this.ref.detectChanges();
    }, () => {
      // failed
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
