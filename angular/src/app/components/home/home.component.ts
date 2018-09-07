import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {Router} from "@angular/router";
import {CommonService} from "../../services/common.service";
import {StorageData} from "../../interfaces/storage-data";


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public isOpenSettingModal: boolean = false;
  public storageData: StorageData;

  private chrome = window['chrome'];

  constructor(
    private chromeStorage: ChromeStorageService,
    private commonService: CommonService,
    private router: Router,
    private ref: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // this.getStorageData();
  }

  getStorageData() {
    this.chrome.storage.local.get(null, (result) => {
      this.storageData = result;
      this.ref.detectChanges();
    });
  }

  openSettingModal() {
    this.isOpenSettingModal = !this.isOpenSettingModal;
    this.getStorageData();
  }

  chooseAccount(i) {
    this.chromeStorage.save('currentWallet', i);
    this.isOpenSettingModal = false;
    this.router.navigate(['/home/account']);
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

  goToExportAccount() {
    this.router.navigate(['/home/export-account']);
    this.isOpenSettingModal = false;
    this.ref.detectChanges();
  }

  logOut() {
    this.chromeStorage.remove('identify');
    this.router.navigate(['/login']);
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

}
