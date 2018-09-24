import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class ApiService {

  private baseUrl = environment.apiUrl;
  private sumusProxyUrl = environment.sumusProxyUrl;

  constructor(private http: HttpClient) {}

  getTxByAddress(sumusAddress: string, offset: number = 0, limit: number = null, sort: string = 'date') {
    return this.http.post(`${this.baseUrl}/statistics/transactions/tx_by_address`, { sumusAddress, offset, limit, sort, ascending: false });
  }

  getWalletBalance(address: string) {
    return this.http.get(`${this.sumusProxyUrl}/wallet/${address}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getTransactionList(address: string) {
    return this.http.get(`${this.sumusProxyUrl}/tx/${address}`,
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  postWalletTransaction(txdata: string, name: string) {
    return this.http.post(
      `${this.sumusProxyUrl}/tx`,
      { 'name': name, 'data': txdata},
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
