import { Injectable } from '@angular/core';

@Injectable()
export class SumusTransactionService {

  private mintLib = window['mint'];

  constructor() {}

  makeTransferAssetTransaction(signerPrivateKey: string, toAddress: string, token: string, amount: number, nonce: number) {
    const singer = this.mintLib.Signer.FromPK(signerPrivateKey);
    const tx = singer.SignTransferAssetTx(nonce, toAddress, token, amount.toPrecision(18));

    return {
      txData: tx.Data,
      txDigest: tx.Digest,
      txName: tx.Name
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
