import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import * as CryptoJS from 'crypto-js';
import { Wallet } from "../../../interfaces/wallet";
import { ChromeStorageService } from "../../../services/chrome-storage.service";
import { GenerateWalletService } from "../../../services/generate-wallet.service";
import { Subscription } from "rxjs/index";
import { CommonService } from "../../../services/common.service";
import { Nonce } from "../../../models/nonce";

@Component({
  selector: 'app-import-account',
  templateUrl: './import-account.component.html',
  styleUrls: ['./import-account.component.scss']
})
export class ImportAccountComponent implements OnInit, OnDestroy {

  public switchModel: {
    type: 'seed' | 'private'
  };
  public accountName: string = '';
  public seedPhrase: string = '';
  public invalidSeedPhrase: boolean = false;
  public extraWord: string = '';
  public privateKey: string = '';

  private chrome = window['chrome'];
  private wallets: Wallet[] = [];
  private identify: string = '';
  private sub1: Subscription;

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

    this.switchModel.type = "seed";
  }

  detect() {
    this.ref.detectChanges();
  }

  create() {
    // const keys = this.generateWallet.generateAddress(this.identify);
    // this.addAccount(keys.publicKey, keys.encPrivateKey, this.accountName);
  }

  async checkSeedPhrase() {
    this.invalidSeedPhrase = await !this.generateWallet.validateSeedPhrase(this.seedPhrase);
    this.ref.detectChanges();
  }

  async importPhrase() {
    let g = await this.generateWallet.recoverPrivateKey(this.seedPhrase, this.extraWord);
    this.addToStorage(g.privateKey);
    this.router.navigate(['/home/account']);
  }

  importKey() {
    this.addToStorage(this.privateKey);
    this.router.navigate(['/home/account']);
  }

  private async addToStorage(privateKey:string) {

    // ensure doesn't exist yet
    const publicKey = await this.generateWallet.getPublicKeyFromPrivate(privateKey);
    let isMatch = false;
    this.wallets.forEach(wallet => {
      wallet.publicKey === publicKey && (isMatch = true);
    });
    if (isMatch) {
      return;
    }

    // encrypt
    const encryptedKey = CryptoJS.AES.encrypt(privateKey, this.identify).toString();
    const data = {
      id: this.wallets.length + 1,
      name: 'Account ' + (this.wallets.length + 1),
      publicKey: publicKey,
      privateKey: encryptedKey
    };
    this.wallets.push(data);

    // store
    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);

    this.chrome.storage.local.set({ ['backedUp']: false }, () => { });
    this.chrome.storage.local.set({ ['backupOfferStamp']: (new Date().getTime() / 1000) }, () => { });

    // select it
    this.commonService.chooseAccount$.next(true);
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }

}
