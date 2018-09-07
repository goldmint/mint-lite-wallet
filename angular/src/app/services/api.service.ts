import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";

@Injectable()
export class ApiService {

  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTxByAddress(sumusAddress: string, offset: number = 0, limit: number = null, sort: string = 'date') {
    return this.http.post(`${this.baseUrl}/statistics/transactions/tx_by_address`, { sumusAddress, offset, limit, sort, ascending: false });
  }

  getWalletBalance(sumusAddress: string) {
    return this.http.post(`${this.baseUrl}/statistics/tokens/wallet_balance`, { sumusAddress });
  }
}
