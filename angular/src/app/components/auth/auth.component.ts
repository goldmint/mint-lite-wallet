import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {ChromeStorageService} from "../../services/chrome-storage.service";

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

  private chrome = window['chrome'];
  private result;

  constructor(
    private router: Router,
    private chromeStorage: ChromeStorageService
  ) { }

  ngOnInit() {
    this.chrome.storage.local.get(null, (result) => {
      this.result = result;
    });

    setTimeout(() => {
      if (this.result['identify']) {
        this.router.navigate(['/home/account']);
      } else {
        this.result['wallets'] ? this.router.navigate(['/login']) : this.router.navigate(['/new-account/create'])
      }
    }, 100);
  }

  clearStorage() {
    this.chromeStorage.clear();
  }

  show() {
    this.chromeStorage.load(null);
  }

}
