import { Injectable } from '@angular/core';
import * as sumus from '../../../../sumuslib/sumuslib.js';

@Injectable()
export class SumusTransactionService {

  private sumusLib = window['SumusLib'];

  constructor() {
    sumus;
  }

  makeTransferAssetTransaction(signerPrivateKey: string, toAddress: string, token: string, amount: number, nonce: number) {
    let tx = this.sumusLib.Transaction.TransferAsset(signerPrivateKey, nonce, toAddress, token, amount.toPrecision(18));
    let txData = tx.Data(),
        txDigest = tx.Digest(),
        txName = tx.Name()

    return {
      txData,
      txDigest,
      txName
    }
  }

  feeCalculate(amount, token) {
    if (token.toUpperCase() === 'MNT') {
      return 0.02;
    }

    if (amount < 10) {
      return 1 * amount / 100;
    } else if (amount >= 10 && amount < 1000) {
      return 0.3 * amount / 100;
    } else if (amount >= 1000 && amount < 10000) {
      return 0.03 * amount / 100;
    } else if (amount >= 10000) {
      const value = 0.03 * amount / 100;

      if (value >= 0.002) {
        return 0.002
      } else if (value <= 0.0002) {
        return 0.0002
      } else {
        return value;
      }
    }
  }
}
