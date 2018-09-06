'use strict';

function LocalStorage() {
}

LocalStorage.prototype.load = function(key, cbk) {
  try {
    var val = localStorage.getItem(key);
    cbk(val, null);
  } catch (e) {
    cbk(null, e);
  }
}

LocalStorage.prototype.save = function(key, value, cbk) {
  try {
    localStorage.setItem(key, value);
    cbk(true, null);
  } catch (e) {
    cbk(false, e);
  }
}

module.exports = { LocalStorage }
