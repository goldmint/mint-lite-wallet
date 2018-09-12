import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  private loggedIn;
  private chrome = window['chrome'];
  private result;

  constructor(
    private router: Router,
    private chromeStorage: ChromeStorageService,
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.chrome.runtime.getBackgroundPage(page => {
      this.loggedIn = page.sessionStorage.identify;
      this.loggedIn && (this.commonService.isLoggedIn = true);
    });

    this.chrome.storage.local.get(null, (result) => {
      this.result = result;
    });

    setTimeout(() => {
      if (this.loggedIn) {
        this.router.navigate(['/home/account']);
      } else {
        this.result['wallets'] ? this.router.navigate(['/login']) : this.router.navigate(['/new-wallet'])
      }
    }, 200);
  }

  openInTab() {
    this.chrome.tabs.create({'url': this.chrome.extension.getURL('index.html')}, () => {});
  }

  clearStorage() {
    this.chromeStorage.clear();
  }

  show() {
    this.chromeStorage.load(null);
  }

}
