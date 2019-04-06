import {Component, NgZone, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {ChromeStorageService} from "../../services/chrome-storage.service";
import {CommonService} from "../../services/common.service";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  public webWalletLink = environment.webWallet;

  private loggedIn;
  private chrome = window['chrome'];
  private result;

  constructor(
    private router: Router,
    private chromeStorage: ChromeStorageService,
    private commonService: CommonService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.chrome.runtime.getBackgroundPage(page => {
      this.loggedIn = page.sessionStorage.identify;
      this.loggedIn && (this.commonService.isLoggedIn = true);

      this.chrome.storage.local.get(null, (result) => {
        this.result = result;

        this.zone.run(() => {
          if (this.loggedIn) {
            if (this.result.unconfirmedTx && this.result.unconfirmedTx.length) {
              this.router.navigate(['/confirm-transaction']);
            } else if (this.result.openSendTokenPage) {
              const data = this.result.openSendTokenPage;
              this.router.navigate(['/home/send-tokens', data.token, data.address]);
            } else {
              this.router.navigate(['/home/account']);
            }
          } else {
            this.result['wallets'] ? this.router.navigate(['/login']) : this.router.navigate(['/new-wallet'])
          }
        });
      });
    });
  }

  openInTab() {
    this.chrome.tabs.create({'url': this.chrome.extension.getURL('index.html')}, () => {});
  }
}
