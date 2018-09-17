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

  getWalletBalance(sumusAddress: string) {
    return this.http.post(`${this.baseUrl}/statistics/tokens/wallet_balance`, { sumusAddress });
  }

  getTransactionInfo(hash: string) {
    return this.http.post(`${this.baseUrl}/explorer/transaction`, { hash });
  }

  getWalletNonce(sumusAddress: string) {
    return this.http.post(
      `${this.sumusProxyUrl}/get-wallet-state`, 
      { 'public_key': sumusAddress },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  postWalletTransaction(txdata: string, name:string) {
    return this.http.post(
      `${this.sumusProxyUrl}/add-transaction`, 
      { 'transaction_data': txdata, 'transaction_name': name },
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
