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

  public loading: boolean = false;
  public accountName: string = '';
  public newPassword: string = '';
  public wallets: Wallet[] = [];
  public switchModel: {
    type: 'create'|'import'
  };
  public privateKey: string;
  public isInvalidFile: boolean = false;
  public isEmptyWallet: boolean = false;


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
      // add account
      if (result.wallets) {
        this.chrome.runtime.getBackgroundPage(page => {
          this.identify = page.sessionStorage.identify;
          !this.identify && this.router.navigate(['/login']);
        });

        this.wallets = result.wallets;
        this.accountName = 'Account ' + (this.wallets.length + 1);
      } else { // new account
        this.accountName = 'Account 1';
        this.isEmptyWallet = true;
      }
      this.ref.detectChanges();
    });
  }

  detect() {
    this.ref.detectChanges();
  }

  create() {
    this.identify = this.isEmptyWallet ? this.newPassword : this.identify;
    const keys = this.generateWallet.createWallet(this.identify);
    this.addAccount(keys.publicKey, keys.encryptedKey, this.accountName);
    // this.addAccount('27SDWfMkZogDPpf4ouBq1413VBJhBHHREpwuns3qaaqtiAGEfs', 'Hello', this.accountName); // TODO for test
  }

  addAccount(publicKey: string, privateKey: string, name: string) {
    // const encryptedKey = CryptoJS.AES.encrypt(privateKey, this.identify).toString(); // TODO for test
    const data = {
      id: this.wallets.length + 1,
      name: name,
      publicKey: publicKey,
      privateKey: privateKey
    };
    this.wallets.push(data);

    this.isEmptyWallet && this.chrome.runtime.sendMessage({identify: this.newPassword});

    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
    this.commonService.chooseAccount$.next(true);
    this.router.navigate(['/home/account']);
  }

  importKey() { }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }
}