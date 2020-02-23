import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import * as sumus from '../../assets/libs/sumus-lib/sumuslib.js';

@Injectable()
export class GenerateWalletService {

  private sumusLib = window['SumusLib']
  private encryptedKey;

  constructor() {
    sumus;
  }

  getPublicKeyFromPrivate(key: string) {
    let publicKey = this.sumusLib.Signer.FromPK(key).PublicKey();
    return publicKey;
  }

  createWallet(identify) {
    let sig = this.sumusLib.Signer.Generate();
    this.encryptedKey = CryptoJS.AES.encrypt(sig.PrivateKey(), identify).toString();

    const keys = {
      publicKey: sig.PublicKey(),
      encryptedKey: this.encryptedKey
    }

    return keys;
  }
}
