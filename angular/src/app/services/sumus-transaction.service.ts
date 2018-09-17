import { Injectable } from '@angular/core';
import * as sumus from '../../../../sumuslib/sumuslib.js';

@Injectable()
export class SumusTransactionService {

  private sumusLib = window['SumusLib']

  constructor() {
    sumus;
  }

  makeTransferAssetTransaction(signerPrivateKey: string, toAddress: string, token: string, amount: number) {
    const unix = Math.floor(new Date().getTime() / 1000);
    let tx = this.sumusLib.Transaction.TransferAsset(signerPrivateKey, unix, toAddress, token, amount.toPrecision(18));

    let txData = tx.Data();
    let txHash = tx.Hash();

    return {
      txData,
      txHash,
    }
  }
}
