import { Injectable } from '@angular/core';

@Injectable()
export class ChromeStorageService {

  private chrome = window['chrome'];

  constructor() { }

  public save(key, value) {
    this.chrome.storage.local.set({[key]: value}, () => {

    });
  }

  public load(key) {
    this.chrome.storage.local.get(key, (result) => {
      alert(JSON.stringify(result))
      return result;
    });
  }

  public remove(key) {
    this.chrome.storage.local.remove(key, () => {

    });
  }

  public clear() {
    this.chrome.storage.local.clear(() => {

    });
  }
  // ----------
  // public load(key, cbk) {
  //   try {
  //     this.chrome.storage.local.get([key], (res) => {
  //       cbk(res, null);
  //     });
  //   } catch (e) {
  //     cbk(null, e);
  //   }
  // }
  //
  // public save(key, value, cbk) {
  //   try {
  //     this.chrome.storage.local.set({key: value}, () => {
  //       cbk(true, null);
  //     });
  //   } catch (e) {
  //     cbk(false, e);
  //   }
  // }
}
