import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {StorageData} from "../../../interfaces/storage-data";
import {Wallet} from "../../../interfaces/wallet";
import * as CryptoJS from 'crypto-js';
import {ChromeStorageService} from "../../../services/chrome-storage.service";

@Component({
  selector: 'app-details-account',
  templateUrl: './details-account.component.html',
  styleUrls: ['./details-account.component.scss']
})
export class DetailsAccountComponent implements OnInit {

  public storageData: StorageData;
  public currentWallet: Wallet;
  public view = ['public', 'private'];
  public currentView = this.view[0];
  public privateKey: string = null;
  public password: string = '';

  private chrome = window['chrome'];

  constructor(private ref: ChangeDetectorRef) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.currentWallet = this.storageData.wallets[this.storageData.currentWallet];
      this.ref.detectChanges();
    });
  }

  showPrivateKey() {
    try {
      this.privateKey = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.password).toString(CryptoJS.enc.Utf8);
    } catch (e) { }
    this.ref.detectChanges();
  }

  back() {
    this.privateKey = null;
    this.password = '';
    this.currentView = this.view[0];
    this.ref.detectChanges();
  }

}
