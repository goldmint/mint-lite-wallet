import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {CommonService} from "../../services/common.service";
import {StorageData} from "../../interfaces/storage-data";
import {Subscription} from "rxjs/index";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public isOpenSettingModal: boolean = false;
  public storageData: StorageData;
  public selectedAccount: number;

  private chrome = window['chrome'];
  private sub1: Subscription;

  constructor(
    private chromeStorage: ChromeStorageService,
    private commonService: CommonService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getStorageData();

    this.sub1 = this.commonService.chooseAccount$.subscribe(() => {
      this.getStorageData();
    });
  }

  getStorageData() {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.selectedAccount = this.storageData.currentWallet;
      this.ref.detectChanges();
    });
  }

  openSettingModal() {
    this.isOpenSettingModal = !this.isOpenSettingModal;
    this.getStorageData();
  }

  chooseAccount() {
    this.chromeStorage.save('currentWallet', this.selectedAccount);
    this.commonService.chooseAccount$.next(true);
    this.ref.detectChanges();
  }

  goToAccountDetails() {
    this.router.navigate(['/home/account-details']);
    this.isOpenSettingModal = false;
    this.ref.detectChanges();
  }

  goToImportAccount() {
    this.router.navigate(['/home/new-account/import']);
    this.isOpenSettingModal = false;
    this.ref.detectChanges();
  }

  goToBackup() {
    this.router.navigate(['/home/backup']);
    this.isOpenSettingModal = false;
    this.ref.detectChanges();
  }

  logOut() {
    this.chrome.runtime.sendMessage({logout: true});
    this.commonService.isLoggedIn = false;
    setTimeout(() => {
      this.router.navigate(['/login'])
    }, 200);
  }

  getItem() {
    this.chromeStorage.load(null);
  }

  clearStorage() {
    this.chromeStorage.clear();
  }

  createAccount() {
    this.router.navigate(['/home/new-account/create']);
    this.isOpenSettingModal = false;
    this.ref.detectChanges();
  }

  ngOnDestroy() {
    this.sub1 && this.sub1.unsubscribe();
  }

}
