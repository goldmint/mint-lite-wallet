import {AfterViewInit, ChangeDetectorRef, Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {CommonService} from "../../../services/common.service";
import {UnconfirmedTx} from "../../../interfaces/unconfirmed-tx";
import {StorageData} from "../../../interfaces/storage-data";
import {ApiService} from "../../../services/api.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('passwordRef') passwordRef;

  public userPassword: string;
  public invalidPass: boolean = false;
  public unconfirmedTx: UnconfirmedTx[];

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
    private apiService: ApiService
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.result = result;
      this.wallets = result.wallets;
      this.unconfirmedTx = result.unconfirmedTx ? result.unconfirmedTx : [];
      this.ref.detectChanges();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.passwordRef.nativeElement.focus();
    }, 0);
  }

  submit() {
    let decrypted;
    try {
      decrypted = CryptoJS.AES.decrypt(this.wallets[0].privateKey, this.userPassword).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      this.invalidPass = true;
      return;
    }
    if (decrypted) {
      this.commonService.isLoggedIn = true;
      this.chrome.runtime.sendMessage({identify: this.userPassword});
      this.zone.run(() => {
        this.unconfirmedTx.length ? this.router.navigate(['/confirm-transaction']) : this.router.navigate(['/home/account']);
      });
    } else {
      this.invalidPass = true;
    }
    this.ref.detectChanges();
  }

  clear() {
    this.chromeStorage.clear();
  }
}
