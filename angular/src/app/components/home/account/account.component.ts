import {AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StorageData} from "../../../interfaces/storage-data";
import {Wallet} from "../../../interfaces/wallet";
import {CommonService} from "../../../services/common.service";
import {ApiService} from "../../../services/api.service";
import {environment} from "../../../../environments/environment";
import {Subscription} from "rxjs/index";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {combineLatest} from 'rxjs';
import SimpleScrollbar from 'simple-scrollbar';
import { BigNumber } from 'bignumber.js';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, AfterViewInit, OnDestroy {

  public detailsLink: string = environment.detailsTxInfoLink;
  public webWalletLink: string = environment.webWallet;
  public storageData: StorageData;
  public currentWallet: Wallet;
  public balance = {
    mnt: 0,
    gold: 0
  };
  usdBalance = {
    mnt: "0",
    gold: "0"
  };
  public usdRate = {
    mnt: 0,
    gold: 0
  };
  public isDataLoaded: boolean = false;
  public loading: boolean = false;
  public transactionList = [];
  public isEditing: boolean = false;
  public accountName: string;
  public banner: any = null;
  public currentNetwork: string;
  public isServiceUnavailable: boolean;
  public isWalletApproved: boolean;

  private chrome = window['chrome'];
  private sub1: Subscription;
  private sub2: Subscription;
  private interval = null;

  constructor(
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private apiService: ApiService,
    private chromeStorage: ChromeStorageService
  ) { }

  ngOnInit() {
    this.currentNetwork = this.apiService.currentNetwork;
    this.getStorageData(true);

    this.sub1 = this.commonService.chooseAccount$.subscribe((res: boolean) => {
      clearInterval(this.interval);
      this.interval = null;

      this.getStorageData(res);
      this.isEditing = false;
      this.ref.detectChanges();
    });

    this.sub2 = this.apiService.getCurrentNetwork.subscribe((network: any) => {
      const currentNetwork = network || 'main';
      this.currentNetwork = currentNetwork;
      this.ref.detectChanges();
    });

    this.apiService.getBanner().subscribe(data => {
      this.banner = data;
    });
  }

  ngAfterViewInit() {
    const element = document.querySelector('.trs-container');
    element && SimpleScrollbar.initEl(element);
    this.ref.detectChanges();
  }

  setUpdateDataInterval() {
    this.interval = setInterval(() => {
      this.getStorageData(true);
    }, 15000);
  }

  getBalanceAndTx(publicKey: string) {
    this.loading = true;
    combineLatest(
      this.apiService.getTransactionList(publicKey),
      this.apiService.getWalletBalance(publicKey),
      this.apiService.getMntpRate(),
      this.apiService.getGoldRate()
    ).subscribe((data: any) => {
      clearInterval(this.interval);
      let txs = data[0].res.list;
      if (txs) {
        this.transactionList = txs.filter(tx => {
          return tx.transaction.name === "transfer_asset";
        });
        this.transactionList = this.transactionList.slice(0, 14);
      }

      this.balance.mnt = data[1].res.balance.mint;
      this.balance.gold = data[1].res.balance.gold;
      this.usdRate.mnt = (data[2] && data[2].result) ? data[2].result.usd : 0;
      this.usdRate.gold = (data[3] && data[3].result) ? data[3].result.usd : 0;

      this.usdBalance = {
        mnt: new BigNumber(this.balance.mnt).multipliedBy(this.usdRate.mnt).decimalPlaces(2).toString(10),
        gold: new BigNumber(this.balance.gold).multipliedBy(this.usdRate.gold).decimalPlaces(2).toString(10)
      }

      this.isWalletApproved = data[1].res.tags && data[1].res.tags.indexOf('approved') >= 0;

      this.setUpdateDataInterval();

      this.isDataLoaded = true;
      this.loading = false;
      this.isServiceUnavailable = false;
      this.ref.detectChanges();
    }, () => {
      this.isServiceUnavailable = true;
      this.ref.detectChanges();
    });
  }

  getStorageData(loadBalance: boolean) {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.currentWallet = this.storageData.wallets[this.storageData.currentWallet];
      loadBalance && this.getBalanceAndTx(this.currentWallet.publicKey);
      this.ref.detectChanges();
    });
  }

  copyText(val: string){
    this.commonService.copyText(val);
  }

  openInTab() {
    this.chrome.tabs.create({'url': this.chrome.extension.getURL('index.html')}, () => {});
  }

  editAccountName() {
    this.accountName = this.currentWallet.name;
    this.isEditing = true;
  }

  saveAccountName() {
    if (this.accountName.trim() == "") {
      return;
    }
    let wallets = this.storageData.wallets;
    wallets[this.storageData.currentWallet].name = this.accountName.trim();

    this.chromeStorage.save('wallets', wallets);
    this.commonService.chooseAccount$.next(false);
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
    this.sub2 && this.sub2.unsubscribe();
    clearInterval(this.interval);
  }
}
