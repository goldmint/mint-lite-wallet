'use strict';

const lastVersion = 1;

function StorageData() {
  this.provider = null;
  this.data = {
    version: lastVersion,
    wallet_id: null,
    wallet_new_id: 0,
    wallets: [],
  };
}

StorageData.prototype.setProvider = function (prov) {
  this.provider = prov;
}

StorageData.prototype.load = function (cbk) {
  if (this.provider == null) throw new Error("Storage provider is not set");

  this.provider.load('wallets', (res, err) => {
    if (err != null) {
      console.error("Failed to load: ", err);
    } else {
      console.log("Loaded");
      if (res !== null && res !== "") {
        this.data = JSON.parse(res);
      }
      cbk();
    }
  });
}

StorageData.prototype.save = function () {
  if (this.provider == null) throw new Error("Storage provider is not set");

  this.provider.save('wallets', JSON.stringify(this.data), (ok, err) => {
    if (err != null) {
      console.error("Failed to save: ", err);
    } else {
      console.log("Saved: " + ok);
    }
  });
}

// ---

StorageData.prototype.getCurrentWallet = function () {
  var cid = this.data.wallet_id;
  var ret = null;

  // by id
  if (cid !== null) {
    ret = this.data.wallets.find((c, i, a) => {
      return c.id == cid;
    });
    if (typeof ret === "undefined") {
      ret = null;
    }
  }

  // first
  if (ret == null) {
    ret = this.data.wallets[0];
  }

  if (ret != null) {
    return JSON.parse(JSON.stringify(ret));
  }
  return null;
}

StorageData.prototype.setCurrentWallet = function (id) {

  var w = this.data.wallets.find((c, i, a) => {
    return c.id == id;
  });
  if (typeof w !== "undefined") {
    this.data.wallet_id = id;
  } else {
    this.data.wallet_id = null;
  }

  this.save();
}

StorageData.prototype.getWallets = function () {
  return this.data.wallets.map((c, i, a) => {
    return JSON.parse(JSON.stringify(c));
  });
}

StorageData.prototype.addWallet = function (name, pvt, pub) {
  var w = new Wallet();
  w.id = this.data.wallet_new_id++;
  w.name = name;
  w.privateKey = pvt;
  w.publicKey = pub;
  this.data.wallets.push(w);

  this.save();
  return w.id;
}

// ---

function Wallet() {
  this.id = 0;
  this.name = 0;
  this.privateKey = 0;
  this.publicKey = 0;
}

module.exports = { StorageData, Wallet }