import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.scss']
})
export class CreateWalletComponent implements OnInit {

  public userPassword: string = '';
  public accountName: string = 'Account 1';

  constructor(
    private chromeStorage: ChromeStorageService,
    private router: Router,
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {}

  submit() {
    // const keys = this.generateWallet.createWallet(this.userPassword);

    const encryptedKey = CryptoJS.AES.encrypt('hello', this.userPassword).toString();
    const data = {
      id: 1,
      name: this.accountName,
      publicKey: '0x7546d7012da51d09f5021cf6a9bc0d0124a1253f',
      privateKey: encryptedKey
    };

    this.chromeStorage.save('identify', this.userPassword);
    this.chromeStorage.save('currentWallet', 0);
    this.chromeStorage.save('wallets', [data]);
    this.router.navigate(['/home/account']);
    this.ref.detectChanges();
  }

  clear() {
    this.chromeStorage.clear();
  }

}
