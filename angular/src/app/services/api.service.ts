import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Subject} from "rxjs/index";

@Injectable()
export class ApiService {

  public getCurrentNetwork = new Subject();

  private networkUrl = environment.networkUrl.main;
  private chrome = window['chrome'];

  constructor(private http: HttpClient) {
    this.getCurrentNetwork.subscribe((network: any) => {
      if (network) {
        this.networkUrl = environment.networkUrl[network];
        this.chrome.storage.local.set({['currentNetwork']: network}, () => { });
      } else {
        this.chrome.storage.local.set({['currentNetwork']: 'main'}, () => { });
      }
    });

    this.chrome.storage.local.get(null, (result) => {
      this.getCurrentNetwork.next(result.currentNetwork);
    });
  }

  getWalletBalance(address: string) {
    return this.http.get(`${this.networkUrl}/wallet/${address}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getTransactionList(address: string) {
    return this.http.get(`${this.networkUrl}/tx/list/0/${address}/0`,
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
}
