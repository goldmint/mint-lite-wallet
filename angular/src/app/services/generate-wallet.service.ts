import { Injectable } from '@angular/core';
import * as nacl from "../../assets/sumus/nacl.js"
import * as bs58 from 'bs58';
import * as CRC32 from 'crc-32';
import * as CryptoJS from 'crypto-js';
import {MessageBoxService} from "./message-box.service";

@Injectable()
export class GenerateWalletService {

  private privateKey;
  private publicKey;
  private encryptedKey;

  constructor(private messageBox: MessageBoxService) { }

  getPublicKeyFromPrivate(key: string) {
    let bytes;
    try {
      bytes = bs58.decode(key);
    } catch (e) {
      this.messageBox.alert('Something went wrong');
    }

    if (bytes && (bytes.length > 4 || key.length > 4)) {
      let value = nacl.sign.keyPair.publicFromPrehashedSecretKey(bytes.slice(0, -4));
      let privateCrc32 = CRC32.buf(value);

      let publicHashsum = [];
      for (let i = 0; i <= 24; i += 8) {
        publicHashsum.push((privateCrc32 >> i) & 255);
      }
      let publicKey = bs58.encode(Array.from(value).concat(publicHashsum));

      return publicKey;
    } else {
      this.messageBox.alert('Something went wrong');
    }
  }

  createWallet(identify) {
    let pair = nacl.sign.keyPair();
    let pkPrehashed = nacl.sign.keyPair.prehashSecretKey(pair.secretKey);

    const privateCrc32 = CRC32.buf(pkPrehashed);
    let privateHashsum = [];
    for (let i = 0; i <= 24; i += 8) {
      privateHashsum.push((privateCrc32 >> i) & 255);
    }

    const publicCrc32 = CRC32.buf(nacl.sign.keyPair.publicFromPrehashedSecretKey(pkPrehashed));
    let publicHashsum = [];
    for (let i = 0; i <= 24; i += 8) {
      publicHashsum.push((publicCrc32 >> i) & 255);
    }

    this.privateKey = bs58.encode(Array.from(pkPrehashed).concat(privateHashsum));
    this.publicKey = bs58.encode(Array.from(nacl.sign.keyPair.publicFromPrehashedSecretKey(pkPrehashed)).concat(publicHashsum));

    this.encryptedKey = CryptoJS.AES.encrypt(this.privateKey, identify).toString();

    const keys = {
      publicKey: this.publicKey,
      encryptedKey: this.encryptedKey
    }

    return keys;
  }
}
