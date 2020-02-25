import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class GenerateWalletService {

  private mintLib = window['mint'];
  private encryptedKey;

  constructor() {}

  getPublicKeyFromPrivate(key: string) {
    let publicKey = this.mintLib.Signer.FromPK(key).PublicKey();
    return publicKey;
  }

  createWallet(identify) {
    let sig = this.mintLib.Signer.Generate();
    this.encryptedKey = CryptoJS.AES.encrypt(sig.PrivateKey(), identify).toString();

    const keys = {
      publicKey: sig.PublicKey(),
      encryptedKey: this.encryptedKey
    }

    return keys;
  }
}
