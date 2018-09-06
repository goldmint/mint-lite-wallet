import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {GenerateWalletService} from "../../services/generate-wallet.service";
import {Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../interfaces/wallet";

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit {

  public loading: boolean = false;
  public accountName: string;
  public wallets: Wallet[];

  private identify: string;
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.wallets = result.wallets;
      this.identify = result.identify;

      this.accountName = 'Account ' + (this.wallets.length + 1);
      this.ref.detectChanges();
    });
  }

  submit() {
    // const keys = this.generateWallet.createWallet(this.identify);

    const encryptedKey = CryptoJS.AES.encrypt('hello', this.identify).toString();
    const data = {
      id: this.wallets.length + 1,
      name: this.accountName,
      publicKey: '0x7546d7012da51d09f5021cf6a9bc0d0124a1253m',
      privateKey: encryptedKey
    };
    this.wallets.push(data);

    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
    this.router.navigate(['/home/account']);
  }
}