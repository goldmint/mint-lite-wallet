import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {StorageData} from "../../../interfaces/storage-data";
import {Wallet} from "../../../interfaces/wallet";
import * as CryptoJS from 'crypto-js';
import {Subscription} from "rxjs/index";
import {CommonService} from "../../../services/common.service";
import {MessageBoxService} from "../../../services/message-box.service";

@Component({
  selector: 'app-details-account',
  templateUrl: './details-account.component.html',
  styleUrls: ['./details-account.component.scss']
})
export class DetailsAccountComponent implements OnInit, OnDestroy {

  public storageData: StorageData;
  public currentWallet: Wallet;
  public view = ['public', 'private'];
  public currentView = this.view[0];
  public privateKey: string = null;
  public password: string = '';

  private chrome = window['chrome'];
  private sub1: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private messageBox: MessageBoxService
    ) { }

  ngOnInit() {
    this.getStorageData();

    this.sub1 = this.commonService.chooseAccount$.subscribe(() => {
      this.getStorageData();
    });
  }

  getStorageData() {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.currentWallet = this.storageData.wallets[this.storageData.currentWallet];
      this.ref.detectChanges();
    });
  }

  showPrivateKey() {
    try {
      this.privateKey = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.password).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      this.messageBox.alert('Something went wrong');
    }
    this.ref.detectChanges();
  }

  back() {
    this.privateKey = null;
    this.password = '';
    this.currentView = this.view[0];
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }
}
