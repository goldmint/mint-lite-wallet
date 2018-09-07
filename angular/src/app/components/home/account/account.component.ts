import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StorageData} from "../../../interfaces/storage-data";
import {Wallet} from "../../../interfaces/wallet";
import {CommonService} from "../../../services/common.service";
import {ApiService} from "../../../services/api.service";
import {combineLatest} from "rxjs/index";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  public storageData: StorageData;
  public currentWallet: Wallet;
  public publicKey: string;

  private chrome = window['chrome'];

  constructor(
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private apiService: ApiService
  ) { }

  ngOnInit() {
    // this.getStorageData();

    this.commonService.chooseAccount$.subscribe(() => {
      this.getStorageData();
    });

    this.getBalanceAndTx('cCwdg3yMwyJXZvADQXBjiiiPt7vUmbTvoSwmooUkAcSGqh8J3');
  }

  getBalanceAndTx(publicKey: string) {
    const combined = this.apiService.getTxByAddress(publicKey, 0, 10, "date").pipe(combineLatest(
      this.apiService.getWalletBalance(publicKey)
    ));
    combined.subscribe((data: any) => {});
  }

  getStorageData() {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.currentWallet = this.storageData.wallets[this.storageData.currentWallet];
      this.showPublicKey();
      this.ref.detectChanges();
    });
  }

  showPublicKey() {
    this.publicKey = this.currentWallet.publicKey.slice(0, 6) + '....' + this.currentWallet.publicKey.slice(-4)
  }
}
