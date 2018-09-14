import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StorageData} from "../../../interfaces/storage-data";
import {Wallet} from "../../../interfaces/wallet";
import {CommonService} from "../../../services/common.service";
import {ApiService} from "../../../services/api.service";
import {combineLatest} from "rxjs/internal/operators";
import {TransactionList} from "../../../interfaces/transaction-list";
import {environment} from "../../../../environments/environment";
import {Subscription} from "rxjs/index";
import {ChromeStorageService} from "../../../services/chrome-storage.service";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit, OnDestroy {

  public detailsLink: string = environment.detailsTxInfoLink;
  public webWalletLink = environment.webWallet;
  public storageData: StorageData;
  public currentWallet: Wallet;
  public balance = {
    mnt: 0,
    gold: 0
  };
  public isDataLoaded: boolean = false;
  public loading: boolean = false;
  public transactionList: TransactionList[] = [];
  public isEditing: boolean = false;
  public accountName: string;

  private chrome = window['chrome'];
  private sub1: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private apiService: ApiService,
    private chromeStorage: ChromeStorageService
  ) { }

  ngOnInit() {
    this.getStorageData(true);

    this.sub1 = this.commonService.chooseAccount$.subscribe((res: boolean) => {
      this.getStorageData(res);
      this.isEditing = false;
      this.ref.detectChanges();
    });
  }

  getBalanceAndTx(publicKey: string) {
    this.loading = true;
    const combined = this.apiService.getTxByAddress(publicKey, 0, 4, "date").pipe(combineLatest(
      this.apiService.getWalletBalance(publicKey)
    ));
    combined.subscribe((data: any) => {
      this.transactionList = data[0]['data'].items.map(item => {
        item.timeStamp = new Date(item.timeStamp.toString() + 'Z');
        return item;
      });

      this.balance.mnt = data[1]['data'].mintAmount;
      this.balance.gold = data[1]['data'].goldAmount;

      this.isDataLoaded = true;
      this.loading = false;
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
  }
}
