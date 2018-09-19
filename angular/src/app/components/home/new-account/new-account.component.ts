import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import {Subscription} from "rxjs/index";
import {CommonService} from "../../../services/common.service";

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit, OnDestroy {

  public accountName: string = '';
  public wallets: Wallet[] = [];
  public switchModel: {
    type: 'create'|'import'
  };
  public privateKey: string;
  public isInvalidFile: boolean = false;

  private identify: string;
  private sub1: Subscription;
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.switchModel = {
        type: params.id
      };
    });

    this.chrome.storage.local.get(null, (result) => {
      if (result.wallets) {
        this.chrome.runtime.getBackgroundPage(page => {
          this.identify = page.sessionStorage.identify;
        });

        this.wallets = result.wallets;
        this.accountName = 'Account ' + (this.wallets.length + 1);
      }
      this.ref.detectChanges();
    });
  }

  detect() {
    this.ref.detectChanges();
  }

  addAccountToStorage() {
    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
    this.commonService.chooseAccount$.next(true);
    this.router.navigate(['/home/account']);
  }

  create() {
    const keys = this.generateWallet.createWallet(this.identify);
    this.addAccount(keys.publicKey, keys.encryptedKey, this.accountName);
  }

  addAccount(publicKey: string, privateKey: string, name: string) {
    const data = {
      id: this.wallets.length + 1,
      name: name,
      nonce: 0,
      publicKey: publicKey,
      privateKey: privateKey
    };
    this.wallets.push(data);

    this.addAccountToStorage();
  }

  importKey() {
    const publicKey = this.generateWallet.getPublicKeyFromPrivate(this.privateKey);
    let isMatch = false;
    this.wallets.forEach(wallet => {
      wallet.publicKey === publicKey && (isMatch = true);
    });

    if (!isMatch) {
      const encryptedKey = CryptoJS.AES.encrypt(this.privateKey, this.identify).toString();
      const data = {
        id: this.wallets.length + 1,
        name: 'Account ' + (this.wallets.length + 1),
        nonce: 0,
        publicKey: publicKey,
        privateKey: encryptedKey
      };
      this.wallets.push(data);

      this.addAccountToStorage();
    } else {
      this.router.navigate(['/home/account']);
    }
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }
}