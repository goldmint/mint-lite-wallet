import { Injectable } from '@angular/core';
import * as sumus from '../../../../sumuslib/sumuslib.js';
import {Wallet} from "../interfaces/wallet";

@Injectable()
export class SumusTransactionService {

  public wallets: Wallet[];

  private sumusLib = window['SumusLib'];

  constructor() {
    sumus;
  }

  makeTransferAssetTransaction(signerPrivateKey: string, toAddress: string, token: string, amount: number, nonce: number) {
    let tx = this.sumusLib.Transaction.TransferAsset(signerPrivateKey, nonce, toAddress, token, amount.toPrecision(18));

    let txData = tx.Data();
    let txHash = tx.Hash();

    return {
      txData,
      txHash,
    }
  }
}
