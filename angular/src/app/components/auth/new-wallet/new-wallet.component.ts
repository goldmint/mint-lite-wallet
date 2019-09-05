import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import {CommonService} from "../../../services/common.service";
import {Wallet} from "../../../interfaces/wallet";
import {ActivatedRoute, Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {Nonce} from "../../../models/nonce";
import {combineLatest} from "rxjs";
import {environment} from "../../../../environments/environment";
import {ApiService} from "../../../services/api.service";

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {

  public accountName: string = 'Account 1';
  public newPassword: string = '';
  public restorePassword: string = '';
  public wallets: Wallet[] = [];
  public currentTub: string;
  public switchModel: {
    type: 'create' | 'restore'
  };
  public isInvalidFile: boolean = false;
  public incorrectRestorePass: boolean = false;
  public selectedFile: any = null;
  public loading: boolean = false;
  public isPolicyAccepted: boolean = false;

  private chrome = window['chrome'];
  private keyStoreFile: string[];
  private networkUrl = environment.networkUrl;

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private commonService: CommonService,
    private apiService: ApiService
  ) {
  }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.isPolicyAccepted = result.isPolicyAccepted;
      this.ref.detectChanges();
    });

    this.switchModel = {
      type: 'create'
    };
  }

  acceptPolicy() {
    this.isPolicyAccepted = true;
    this.chrome.storage.local.set({['isPolicyAccepted']: this.isPolicyAccepted}, () => { });
    this.ref.detectChanges();
  }

  detect() {
    this.ref.detectChanges();
  }

  onChangeFile(event) {
    this.selectedFile = event.target.files.length > 0 ? event.target.files[0] : null;
  }

  addAccountToStorage() {
    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
    this.router.navigate(['/home/account']);
  }

  create() {
    const keys = this.generateWallet.createWallet(this.newPassword);
    this.addAccount(keys.publicKey, keys.encryptedKey, this.accountName);
  }

  addAccount(publicKey: string, privateKey: string, name: string) {
    const data = {
      id: 1,
      name: name,
      publicKey: publicKey,
      privateKey: privateKey
    };
    this.wallets.push(data);

    this.chrome.runtime.sendMessage({identify: this.newPassword});
    this.commonService.isLoggedIn = true;
    this.addAccountToStorage();
  }

  restore() {
    this.isInvalidFile = false;

    if (this.selectedFile.size > 0 && this.selectedFile.type === "application/json") {
      var reader = new FileReader();
      reader.onload = ((reader: any) => {
        return () => {
          const contents = JSON.parse(reader.result);
          try {
            const decrypted  = CryptoJS.AES.decrypt(contents.data, this.restorePassword).toString(CryptoJS.enc.Utf8);
            this.keyStoreFile = JSON.parse(decrypted);
          } catch(e) {
            this.incorrectRestorePass = true;
            this.ref.detectChanges();
            return;
          }

          this.keyStoreFile.forEach(restoreData => {
            let restoreKey, accountName;

            if (contents.version === 1) {
              restoreKey = restoreData;
              accountName = 'Account ' + (this.wallets.length + 1);
            } else if (contents.version === 2) {
              restoreKey = restoreData['key'];
              accountName = restoreData['name'];
            }

            const publicKey = this.generateWallet.getPublicKeyFromPrivate(restoreKey);
            const encryptedKey = CryptoJS.AES.encrypt(restoreKey, this.restorePassword).toString();

            const data = {
              id: this.wallets.length + 1,
              name: accountName,
              publicKey: publicKey,
              privateKey: encryptedKey
            };
            this.wallets.push(data);
          });

          this.chrome.runtime.sendMessage({identify: this.restorePassword});
          this.commonService.isLoggedIn = true;
          this.addAccountToStorage();
        }
      })(reader);
      reader.readAsText(this.selectedFile);
    } else {
      this.isInvalidFile = true;
      this.ref.detectChanges();
    }
  }

  changeTab(tab: string) {
    if (tab !== this.currentTub) {
      this.currentTub = tab;
      this.resetField();
    }
  }

  resetField() {
    this.isInvalidFile = this.incorrectRestorePass = false;
    this.restorePassword = this.newPassword = '';
    this.selectedFile = null;
  }

}
