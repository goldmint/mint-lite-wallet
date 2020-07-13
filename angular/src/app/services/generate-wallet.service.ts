import { Injectable } from '@angular/core';
import {ChromeStorageService} from "./chrome-storage.service";

export interface GeneratedAddress {
  publicKey: string;
  privateKey: string;
}

@Injectable()
export class GenerateWalletService {

  private promiseResolve: any = {};
  private methods = [
    'getPublicKeyFromPrivate',
    'generateSeedPhrase',
    'validateSeedPhrase',
    'recoverPrivateKey',
    'getPrivateKey'
  ];

  constructor(
    private chromeStorage: ChromeStorageService
  ) {
    const isFireFox = this.chromeStorage.isFireFox();
    this.chromeStorage.chrome[isFireFox ? 'runtime' : 'extension'].onMessage.addListener(request => {
      this.methods.forEach(method => {
        request.hasOwnProperty(method) && this.promiseResolve[method](request[method]);
      });
    });
  }

  getPublicKeyFromPrivate(privateKey: string): Promise<string> {
    return new Promise(resolve => {
      this.promiseResolve.getPublicKeyFromPrivate = resolve;
      this.chromeStorage.sendMessage({ getPublicKeyFromPrivate: { privateKey} });
    });
  }

  generateSeedPhrase(): Promise<string> {
    return new Promise(resolve => {
      this.promiseResolve.generateSeedPhrase = resolve;
      this.chromeStorage.sendMessage({ generateSeedPhrase: true });
    });
  }
  
  validateSeedPhrase(seedPhrase: string): Promise<boolean> {
    return new Promise(resolve => {
      this.promiseResolve.validateSeedPhrase = resolve;
      this.chromeStorage.sendMessage({ validateSeedPhrase: { seedPhrase } });
    });
  }
  
  recoverPrivateKey(seedPhrase: string, extraWord?: string): Promise<GeneratedAddress> {
    return new Promise(resolve => {
      this.promiseResolve.recoverPrivateKey = resolve;
      this.chromeStorage.sendMessage({ recoverPrivateKey: { seedPhrase, extraWord } });
    });
  }

  getPrivateKey(publicKey: string, password?: string): Promise<string> {
    return new Promise(resolve => {
      this.promiseResolve.getPrivateKey = resolve;
      this.chromeStorage.sendMessage({ getPrivateKey: { publicKey, password } });
    });
  }
}
