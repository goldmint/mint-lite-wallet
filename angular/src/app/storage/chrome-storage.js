'use strict';

function ChromeStorage() {
}

ChromeStorage.prototype.load = function(key, cbk) {
  try {
	chrome.storage.local.get([key], (res) => {
		cbk(res, null);
	});
  } catch (e) {
    cbk(null, e);
  }
}

ChromeStorage.prototype.save = function(key, value, cbk) {
  try {
	chrome.storage.local.set({key: value}, () => {
		cbk(true, null);
	});
  } catch (e) {
    cbk(false, e);
  }
}

module.exports = { ChromeStorage }