import { AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ChromeStorageService } from "../../../services/chrome-storage.service";
import { Router } from "@angular/router";
import { GenerateWalletService } from "../../../services/generate-wallet.service";
import * as CryptoJS from 'crypto-js';
import { Wallet } from "../../../interfaces/wallet";
import { CommonService } from "../../../services/common.service";
import { UnconfirmedTx } from "../../../interfaces/unconfirmed-tx";
import { StorageData } from "../../../interfaces/storage-data";
import { ApiService } from "../../../services/api.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('passwordRef') passwordRef;

  public currentPage: {
    type: 'login' | 'backup'
  };

  public userPassword: string;
  public invalidPass: boolean = false;
  public unconfirmedTx: UnconfirmedTx[];
  public isPolicyAccepted: boolean = false;

  private wallets: Wallet[];
  private result: StorageData;
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private zone: NgZone,
    private apiService: ApiService,
    private generateWalletService: GenerateWalletService
  ) { }

  ngOnInit() {
    this.currentPage = { type: "login" };

    this.chrome.storage.local.get(null, (result: StorageData) => {
      this.result = result;
      this.wallets = result.wallets;
      this.unconfirmedTx = result.unconfirmedTx ? result.unconfirmedTx : [];
      this.isPolicyAccepted = result.isPolicyAccepted;
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => this.passwordRef.nativeElement.focus(), 0);
  }

  async submit() {
    let decrypted;
    try {
      decrypted = await this.generateWalletService.getPrivateKey(this.wallets[0].publicKey, this.userPassword);
    } catch (e) {
      this.invalidPass = true;
      return;
    }
    if (decrypted) {
      this.commonService.isLoggedIn = true;
      this.chrome.runtime.sendMessage({ identify: this.userPassword });
      this.zone.run(() => {
        if (this.unconfirmedTx.length) {
          this.router.navigate(['/confirm-transaction']);
        } else {
          if (this.needToBackup()) {
            this.currentPage = { type: "backup" };
            this.ref.detectChanges();
          } else {
            this.router.navigate(['/home/account']);
          }
        }
      });
    } else {
      this.invalidPass = true;
    }
    this.ref.detectChanges();
  }

  acceptPolicy() {
    this.isPolicyAccepted = true;
    this.chrome.storage.local.set({ ['isPolicyAccepted']: this.isPolicyAccepted }, () => { });
    setTimeout(() => this.passwordRef.nativeElement.focus(), 0);
    this.ref.detectChanges();
  }

  backupNow() {
    this.chrome.storage.local.set({ ['backupOfferStamp']: (new Date().getTime() / 1000) }, () => { });
    this.router.navigate(['/home/backup']);
  }

  backupLater() {
    this.chrome.storage.local.set({ ['backupOfferStamp']: (new Date().getTime() / 1000) }, () => { });
    this.router.navigate(['/home/account']);
  }

  private needToBackup(): boolean {
    return !this.result.backedUp && (new Date().getTime() / 1000 - (this.result.backupOfferStamp || 0)) >= 2 * 24 * 60 * 60;
  }

  clear() {
    this.chromeStorage.clear();
  }
}
