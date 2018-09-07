import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Wallet} from "../../../interfaces/wallet";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-export-account',
  templateUrl: './export-account.component.html',
  styleUrls: ['./export-account.component.scss']
})
export class ExportAccountComponent implements OnInit {

  public wallets: Wallet[];
  public selectAccount: number = null;

  private identify: string;
  private chrome = window['chrome'];

  constructor(
    private ref: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.wallets = result.wallets;
      this.identify = result.identify;
      this.ref.detectChanges();
    });
  }

  export() {
    let wallet = this.wallets[this.selectAccount];
    let privateDecryptedKey;
    try {
      privateDecryptedKey = CryptoJS.AES.decrypt(wallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
    } catch (e) {
      alert('Error');
      return;
    };
    const data = {
      "publicKey": wallet.publicKey,
      "privateKey": privateDecryptedKey
    };
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), this.identify).toString();
    this.downloadFile(encryptedData, wallet.name);
  }

  downloadFile(data: string, accountName: string) {
    const account = accountName.toLowerCase();
    let blob = new Blob(['\ufeff' + data], {type: 'text/plane;charset=utf-8;'});
    let link = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      link.setAttribute('target', '_blank');
    }
    link.setAttribute('href', url);
    link.setAttribute('download', `encrypted_${account}_data.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
