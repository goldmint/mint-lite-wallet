import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import * as CryptoJS from 'crypto-js';
import {Wallet} from "../../../interfaces/wallet";
import {ChromeStorageService} from "../../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {CommonService} from "../../../services/common.service";
import {MessageBoxService} from "../../../services/message-box.service";

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

  public switchModel: {
    type: 'backup'|'restore'
  };
  public isInvalidFile: boolean = false;
  public selectedFile: any = null;
  public restorePassword: string = '';
  public backupPassword: string = '';
  public wallets: Wallet[] = [];
  public accountName: string = '';
  private identify: string;
  public incorrectBackupPass: boolean = false;
  public incorrectRestorePass: boolean = false;

  private keyStoreFile: any;
  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private router: Router,
    private commonService: CommonService,
    private ref: ChangeDetectorRef,
    private messageBox: MessageBoxService
  ) { }

  ngOnInit() {
    this.switchModel = {
      type: 'backup'
    };

    // this.accountName = 'Account ' + (this.wallets.length + 1);
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

  restore() {
    this.isInvalidFile = false;
    if (this.restorePassword !== this.identify) {
      this.incorrectRestorePass = true;
      this.ref.detectChanges();
      return;
    }

    if (this.selectedFile.size > 0 && this.selectedFile.type === "text/plain") {
      var reader = new FileReader();
      reader.onload = (reader => {
        return () => {
          const contents = reader.result;
          try {
            const decrypted  = CryptoJS.AES.decrypt(contents, this.restorePassword).toString(CryptoJS.enc.Utf8);
            this.keyStoreFile = JSON.parse(decrypted);
          } catch(e) {
            this.isInvalidFile = true;
            this.ref.detectChanges();
            return;
          }

          this.wallets.forEach((item, i) => {
            if (item.publicKey === this.keyStoreFile.publicKey) {
              this.chromeStorage.save('currentWallet', i);
              this.commonService.chooseAccount$.next(true);
              this.router.navigate(['/home/account']);
              return;
            }
          });
          const encryptedKey = CryptoJS.AES.encrypt(this.keyStoreFile.privateKey, this.restorePassword).toString();
          this.addAccount(this.keyStoreFile.publicKey, encryptedKey, this.accountName);
        }
      })(reader);
      reader.readAsText(this.selectedFile);
    } else {
      this.isInvalidFile = true;
      this.ref.detectChanges();
    }
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

    // TODO must be last call
    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);
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
        const key  = CryptoJS.AES.decrypt(wallet.privateKey, this.identify).toString(CryptoJS.enc.Utf8);
        wallets.push(key);
      } catch(e) {
        this.messageBox.alert('Something went wrong');
        return;
      }
    });

    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(wallets), this.identify).toString();
    this.downloadFile(encryptedData);
  }

  downloadFile(data: string) {
    let blob = new Blob(['\ufeff' + data], {type: 'text/plane;charset=utf-8;'});
    let link = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {
      link.setAttribute('target', '_blank');
    }
    link.setAttribute('href', url);
    link.setAttribute('download', `wallet-backup.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
