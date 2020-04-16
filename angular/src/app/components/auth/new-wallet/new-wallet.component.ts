import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from "../../../services/common.service";
import { Router } from "@angular/router";
import { StorageData } from 'src/app/interfaces/storage-data';

@Component({
  selector: 'app-new-wallet',
  templateUrl: './new-wallet.component.html',
  styleUrls: ['./new-wallet.component.scss']
})
export class NewWalletComponent implements OnInit {

  loading: boolean = false;
  isPolicyAccepted: boolean = false;
  newPassword: string = '';
  repeatPassword: string = '';
  currentTab: string;
  incorrectRepeatPass: boolean = false;

  private chrome = window['chrome'];
  private currentIdentity: string = "";

  constructor(
    private router: Router,
    private ref: ChangeDetectorRef,
    private commonService: CommonService
  ) {
  }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result:StorageData) => {
      this.isPolicyAccepted = result.isPolicyAccepted;
      this.ref.detectChanges();
    });
    
    this.currentTab = 'setPassword';
  }

  acceptPolicy() {
    this.isPolicyAccepted = true;
    this.chrome.storage.local.set({ ['isPolicyAccepted']: this.isPolicyAccepted }, () => { });
    this.ref.detectChanges();
  }

  checkNewPassword() {
    this.incorrectRepeatPass = this.repeatPassword != this.newPassword;
    this.ref.detectChanges();
  }

  changeTab(tab: string) {
    this.currentTab = tab;
    this.resetField();
    this.ref.detectChanges();
  }

  resetField() {
    this.incorrectRepeatPass = false;
    this.newPassword = this.repeatPassword = '';
  }

  // ---

  setPassword() {
    this.currentIdentity = this.newPassword;
    this.changeTab('confirmPassword')
  }

  beginAddressGeneration() {
    this.changeTab('newAddress');
  }

  onAddressCreated() {
    this.chrome.runtime.sendMessage({ identify: this.currentIdentity });
    this.commonService.isLoggedIn = true;

    this.chrome.storage.local.set({ ['backedUp']: true }, () => { });
    this.chrome.storage.local.set({ ['backupOfferStamp']: (new Date().getTime() / 1000) }, () => { });

    this.commonService.chooseAccount$.next(true);
    this.router.navigate(['/home/account']);
  }

  onAddressRejected() {
    this.changeTab('setPassword');
  }
}
