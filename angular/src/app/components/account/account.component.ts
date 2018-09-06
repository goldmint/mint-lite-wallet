import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CommonService} from "../../services/common.service";
import {Wallet} from "../../interfaces/wallet";
import {StorageData} from "../../interfaces/storage-data";

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
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.getStorageData();

    this.commonService.chooseAccount$.subscribe(() => {
      this.getStorageData();
    });
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
