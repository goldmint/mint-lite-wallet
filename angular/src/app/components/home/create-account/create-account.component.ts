import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {CommonService} from "../../../services/common.service";

@Component({
  selector: 'app-new-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.scss']
})
export class CreateAccountComponent implements OnInit {

  private chrome = window['chrome'];

  constructor(
    private router: Router,
    private commonService: CommonService
  ) { }

  ngOnInit() {
  }

  onAddressCreated() {
    this.chrome.storage.local.set({ ['backedUp']: false }, () => { });
    this.chrome.storage.local.set({ ['backupOfferStamp']: (new Date().getTime() / 1000) }, () => { });

    this.commonService.chooseAccount$.next(true);
    this.router.navigate(['/home/account']);
  }

  onAddressRejected() {
    this.router.navigate(['/home/account']);
  }
}
