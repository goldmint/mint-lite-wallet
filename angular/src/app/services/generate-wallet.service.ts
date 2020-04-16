import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

export interface GeneratedAddress {
  publicKey: string;
  privateKey: string;
  //encPrivateKey: string;
}

@Injectable()
export class GenerateWalletService {

  constructor() {}

  getPublicKeyFromPrivate(key: string) {
    let publicKey = window['mint'].Signer.FromPK(key).PublicKey();
    return publicKey;
  }

  generateSeedPhrase(): string {
    return window['mint'].Mnemonic.Generate();
  }
  
  validateSeedPhrase(seedPhrase: string): boolean {
    return window['mint'].Mnemonic.Valid(seedPhrase);
  }
  
  recoverPrivateKey(seedPhrase: string, extraWord?: string): GeneratedAddress {
    
    let privateKey = window['mint'].Mnemonic.Recover(seedPhrase, extraWord);
    let signer: any = window['mint'].Signer.FromPK(privateKey);
    //let encPrivateKey = CryptoJS.AES.encrypt(signer.PrivateKey(), identify).toString();

    return {
      publicKey: signer.PublicKey(),
      privateKey: signer.PrivateKey(),
      //encPrivateKey: encPrivateKey,
    };
  }
}
