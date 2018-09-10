import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import {Subscription} from "rxjs/index";

@Component({
  selector: 'app-new-account',
  templateUrl: './new-account.component.html',
  styleUrls: ['./new-account.component.scss']
})
export class NewAccountComponent implements OnInit, OnDestroy {

  public loading: boolean = false;
  public accountName: string = '';
  public wallets: Wallet[];
  public switchModel: {
    type: 'create'|'import'
  };
  public selectOptionList = ['key', 'json']
  public selectOption: string = 'key';
  public privateKey: string;
  public selectedFile: any = null;
  public password: string = '';
  public isInvalidFile: boolean = false;

  private keyStoreFile: any;
  private identify: string;
  private sub1: Subscription;
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.sub1 = this.route.params.subscribe(params => {
      this.switchModel = {
        type: params.id
      };
    });

    this.chrome.storage.local.get(null, (result) => {
      this.wallets = result.wallets;
      this.identify = result.identify;

      this.accountName = 'Account ' + (this.wallets.length + 1);
      this.ref.detectChanges();
    });
  }

  onChangeFile(event) {
    this.selectedFile = event.target.files.length > 0 ? event.target.files[0] : null;
  }

  create() {
    // const keys = this.generateWallet.createWallet(this.identify);
    this.addAccount('AcdEdTdwy6PkqVuC1Q3DGtZrsSn68uaoqVUnELP594QHrtNNk', 'Hello', this.accountName);
  }

  addAccount(publicKey: string, privateKey: string, name: string) {
    const encryptedKey = CryptoJS.AES.encrypt(privateKey, this.identify).toString();
    const data = {
      id: this.wallets.length + 1,
      name: name,
      publicKey: publicKey,
      privateKey: encryptedKey
    };
    this.wallets.push(data);

    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
    this.router.navigate(['/home/account']);
  }

  importKey() {

  }

  importFile() {
    this.isInvalidFile = false;

    if (this.selectedFile.size > 0 && this.selectedFile.type === "text/plain") {
      var reader = new FileReader();
      reader.onload = (reader => {
        return () => {
          const contents = reader.result;
          try {
            const decrypted  = CryptoJS.AES.decrypt(contents, this.password).toString(CryptoJS.enc.Utf8);
            this.keyStoreFile = JSON.parse(decrypted);
          } catch(e) {
            this.isInvalidFile = true;
            this.ref.detectChanges();
            return;
          }

          this.wallets.forEach((item, i) => {
            if (item.publicKey === this.keyStoreFile.publicKey) {
              this.chromeStorage.save('currentWallet', i);
              this.router.navigate(['/home/account']);
              return
            }
          });

          this.addAccount(this.keyStoreFile.publicKey, this.keyStoreFile.privateKey, this.accountName);
        }
      })(reader);
      reader.readAsText(this.selectedFile);
    } else {
      this.isInvalidFile = true;
      this.ref.detectChanges();
    }
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }
}