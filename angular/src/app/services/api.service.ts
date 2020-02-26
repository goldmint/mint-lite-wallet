import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs/index";

@Injectable()
export class ApiService {

  public getCurrentNetwork = new Subject();
  public currentNetwork: string = 'main';

  private networkUrl = environment.networkUrl.main;
  private rateUrl = environment.rateUrl;
  private chrome = window['chrome'];

  constructor(private http: HttpClient) {
    // this.getCurrentNetwork.subscribe((network: any) => {
    //   if (network) {
    //     this.networkUrl = environment.networkUrl[network];
    //     this.chrome.storage.local.set({['currentNetwork']: network}, () => { });
    //   } else {
    //     this.chrome.storage.local.set({['currentNetwork']: 'main'}, () => { });
    //   }
    // });

    // this.chrome.storage.local.get(null, (result) => {
    //   this.currentNetwork = result.currentNetwork;
    //   this.getCurrentNetwork.next(result.currentNetwork);
    // });
  }

  getWalletBalance(address: string) {
    return this.http.get(`${this.networkUrl}/wallet/${address}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getTransactionList(address: string) {
    return this.http.get(`${this.networkUrl}/tx/list/-/${address}/-`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  postWalletTransaction(txdata: string, name: string) {
    return this.http.post(
      `${this.networkUrl}/tx`,
      { 'name': name, 'data': txdata},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getBlock(blockNumber: number, network: string = this.networkUrl) {
    return this.http.get(`${network}/block/${blockNumber}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getGoldRate() {
    return this.http.get(`${this.rateUrl}/gold`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getMntpRate() {
    return this.http.get(`${this.rateUrl}/mntp`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getBanner() {
    return this.http.get('https://www.goldmint.io/lite-wallet-banner.json');
  }

  getBlockChainStatus() {
    return this.http.get(`${this.networkUrl}/status`);
  }

}
