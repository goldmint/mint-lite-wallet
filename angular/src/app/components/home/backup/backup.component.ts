import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {CommonService} from "../../../services/common.service";
import {MessageBoxService} from "../../../services/message-box.service";
import {GenerateWalletService} from "../../../services/generate-wallet.service";
import {Backup} from "../../../models/backup";
import {Nonce} from "../../../models/nonce";

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

  public switchModel: {
    type: 'backup'|'restore'
  };
  public currentTub: string;
  public isInvalidFile: boolean = false;
  public selectedFile: any = null;
  public restorePassword: string = '';
  public backupPassword: string = '';
  public wallets: Wallet[] = [];
  public accountName: string = '';
  public incorrectBackupPass: boolean = false;
  public incorrectRestorePass: boolean = false;

  private identify: string;
  private keyStoreFile: string[];
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private commonService: CommonService,
    private ref: ChangeDetectorRef,
    private messageBox: MessageBoxService
  ) { }

  ngOnInit() {
    this.currentTub = 'backup';
    this.switchModel = {
      type: 'backup'
    };

    this.chrome.storage.local.get(null, (result) => {
      this.chrome.runtime.getBackgroundPage(page => {
        this.identify = page.sessionStorage.identify;
      });
      this.wallets = result.wallets;
      this.ref.detectChanges();
    });
  }

  onChangeFile(event) {
    this.selectedFile = event.target.files.length > 0 ? event.target.files[0] : null;
  }

  addAccount(wallets: Wallet[]) {
    this.chromeStorage.save('wallets', wallets);
    this.chromeStorage.save('currentWallet', wallets.length - 1);
    this.commonService.chooseAccount$.next(true);
    this.router.navigate(['/home/account']);
  }

  backup() {
    if (this.backupPassword !== this.identify) {
      this.incorrectBackupPass = true;
      this.ref.detectChanges();
      return;
    }

    let wallets = [];
    this.wallets.forEach(wallet => {
      try {
        const key = CryptoJS.AES.decrypt(wallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
        wallets.push({name: wallet.name, key: key});
      } catch(e) {
        this.messageBox.alert('Something went wrong');
        return;
      }
    });
    let data = new Backup();
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(wallets), this.identify).toString();
    data.data = encryptedData;
    this.downloadFile(JSON.stringify(data));
    this.router.navigate(['/home/account']);
  }

  downloadFile(data: string) {
    let blob = new Blob(['\ufeff' + data], {type: 'application/json;charset=utf-8;'});
    let link = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      link.setAttribute('target', '_blank');
    }
    link.setAttribute('href', url);
    link.setAttribute('download', `sumus-wallet-backup.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  restore() {
    this.isInvalidFile = this.incorrectRestorePass = false;
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

          let wallets = this.wallets.slice();
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
            let isMatch = false;

            this.wallets.forEach(wallet => {
              wallet.publicKey === publicKey && (isMatch = true);
            });

            if (!isMatch) {
              const encryptedKey = CryptoJS.AES.encrypt(restoreKey, this.identify).toString();
              const data = {
                id: wallets.length + 1,
                name: accountName,
                publicKey: publicKey,
                privateKey: encryptedKey
              };
              wallets.push(data);
            }
          });
          this.addAccount(wallets);
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
    this.isInvalidFile = this.incorrectRestorePass = this.incorrectBackupPass = false;
    this.restorePassword = this.backupPassword = '';
    this.selectedFile = null;
  }
}
