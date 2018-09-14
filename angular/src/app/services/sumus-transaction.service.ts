import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import * as CryptoJS from 'crypto-js';
import * as sumus from '../../../../sumuslib/sumuslib.js';

@Injectable()
export class SumusTransactionService {

  private sumusLib = window['SumusLib']
  private apiService:ApiService;
  private signerNonce:number;

  constructor() {
    sumus;
  }

  async makeTransferAssetTransaction(signerPrivateKey:string, toAddress:string, token:string, amount:number) {

	// get pubkey
	let signerPub = this.sumusLib.Signer.FromPK(signerPrivateKey).PublicKey();

	// TODO: get wallet nonce once and keep it
	// signerNonce = await this.apiService.getWalletNonce(signerPub);

	// make tx
	let tx = this.sumusLib.Transaction.TransferAsset(signerPrivateKey, this.signerNonce + 1, toAddress, token, amount.toPrecision(18));

	let txData = tx.Data();
	let txHash = tx.Hash();

	return {
		txData,
		txHash,
	}
  }

  async postTransferAssetTransaction(txdata:string) {

	// TODO: check result
	await this.apiService.postWalletTransaction(txdata, 'TransferAssetsTransaction');

	// ok?
	this.signerNonce++;

	return true;
  }
}
