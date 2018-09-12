import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {CommonService} from "../../../services/common.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  public userPassword: string;
  public invalidPass: boolean = false;

  private wallets: Wallet[];
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private ref: ChangeDetectorRef,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.wallets = result.wallets;
      this.ref.detectChanges();
    });
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
      this.commonService.isLoggedIn = true
      this.chrome.runtime.sendMessage({identify: this.userPassword});
      this.router.navigate(['/home/account']);
    } else {
      this.invalidPass = true;
    }
    this.ref.detectChanges();
  }

  clear() {
    this.chromeStorage.clear();
  }
}