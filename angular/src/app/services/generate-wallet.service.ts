import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class GenerateWalletService {

  private encryptedKey;

  constructor() {}

  getPublicKeyFromPrivate(key: string) {
    let publicKey = window['mint'].Signer.FromPK(key).PublicKey();
    return publicKey;
  }

  createWallet(identify) {
    let sig = window['mint'].Signer.Generate();
    this.encryptedKey = CryptoJS.AES.encrypt(sig.PrivateKey(), identify).toString();

    const keys = {
      publicKey: sig.PublicKey(),
      encryptedKey: this.encryptedKey
    }

    return keys;
  }
}
