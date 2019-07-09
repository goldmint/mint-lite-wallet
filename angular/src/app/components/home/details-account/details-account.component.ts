import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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

  @ViewChild('passwordRef') passwordRef;

  public storageData: StorageData;
  public currentWallet: Wallet;
  public view = ['public', 'private'];
  public currentView = this.view[0];
  public privateKey: string = null;
  public password: string = '';
  public incorrectPass: boolean = false;

  private chrome = window['chrome'];
  private sub1: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private commonService: CommonService
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
    this.currentView = this.view[1];
    setTimeout(() => {
      this.passwordRef.nativeElement.focus();
      this.ref.detectChanges();
    }, 0);
  }

  confirm() {
    try {
      let result = CryptoJS.AES.decrypt(this.currentWallet.privateKey, this.password).toString(CryptoJS.enc.Utf8);
      this.privateKey = (result && result.length > 50) ? result : '';
      this.incorrectPass = false;
    } catch (e) {
      this.incorrectPass = true;
    }
    this.ref.detectChanges();
  }

  back() {
    this.privateKey = null;
    this.password = '';
    this.incorrectPass = false;
    this.currentView = this.view[0];
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }
}
