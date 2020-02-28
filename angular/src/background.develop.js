"use strict"

const config = {
  networkUrl: {
    main: 'https://service.goldmint.io/mint/mainnet/v1',
    test: 'https://service.goldmint.io/mint/testnet/v1'
  },
  checkTxUrl: '/tx/',
  addTxUrl: '/tx',
  blockChainStatus: '/status',
  successTxStatus: "approved",
  staleTxStatus: "stale",
  checkTxTime: 30000
};

let isFirefox = typeof InstallTrigger !== 'undefined';
let brows = isFirefox ? browser : chrome;
let xhr = new XMLHttpRequest();

if (isFirefox) {
  brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
    actions(request, sender);
  });
} else {
  brows.extension.onMessage.addListener((request, sender, sendResponse) => {
    actions(request, sender);
  });
}

clearMessagesForSign();

// after load page
watchTransactionStatus();
setInterval(() => {
  watchTransactionStatus();
}, config.checkTxTime);

function actions(request, sender) {
  request.identify && login(request);
  request.logout && logout();

  // check login status
  request.checkLoginStatus && sendMessage('loginStatus', window.sessionStorage.getItem('identify') ? true : false);

  // after send tx from lib
  request.sendTransaction && createConfirmWindow(request.sendTransaction, sender.tab.id);
  // after success confirm tx from lib
  if (request.hasOwnProperty('sendTxResult')) {
    brows.tabs.query({active: true, currentWindow: true}, (tabs) => {
      brows.tabs.sendMessage(+request.sendTxResult.tabId, {sendTxResultContent: request.sendTxResult});
    });
  }

  // after call sign message function from lib
  request.signMessage && createSignMessageWindow(request.signMessage, sender.tab.id);
  // after success sign message from lib
  if (request.hasOwnProperty('sendSignResult')) {
    brows.tabs.query({active: true, currentWindow: true}, (tabs) => {
      brows.tabs.sendMessage(+request.sendSignResult.tabId, {sendSignResultContent: request.sendSignResult});
    });
  }

  // pass password
  request.getIdentifier && sendMessage('identifier', window.sessionStorage.getItem('identify'));

  // open send gold page in wallet
  request.openSendTokenPage && openSendTokenPage();
}

function login(request) {
  window.sessionStorage.setItem('identify', request.identify);
  sendMessage('login', true);
}

function logout() {
  window.sessionStorage.removeItem('identify');
  sendMessage('login', false);
}

function sendMessage(key, value) {
  brows.tabs.query({active: true, currentWindow: true}, (tabs) => {
    brows.tabs.sendMessage(tabs[0].id, {[key]: value});
  });
}

function watchTransactionStatus() {
  brows.storage.local.get(null, (result) => {
    let wallets = result.wallets;
    let txListEmpty = true;
    let blockCount = {
      main: 0,
      test: 0
    };
    let skip = false;

    wallets && wallets.forEach(wallet => {
      if (wallet.tx && wallet.tx.length) txListEmpty = false;
    });

    if (txListEmpty) return;

    const p1 = http('GET', config.networkUrl['main'] + config.blockChainStatus);
    const p2 = http('GET', config.networkUrl['test'] + config.blockChainStatus);

    Promise.all([p1, p2]).then(values => {
      if (values) {
        values.forEach((value, index) => {
          if (!value || !value.res || !value.res.blockchain_state || !value.res.blockchain_state.block_count) {
            skip = true;
          } else {
            blockCount[Object.keys(blockCount)[index]] = +value.res.blockchain_state.block_count - 1;
          }
        });
      }
    });

    !skip && wallets && wallets.forEach(wallet => {
      if (wallet.tx) {
        wallet.tx.forEach(tx => {
          setTimeout(() => {
            checkTransactionStatus(tx.hash, tx.endTime, tx.network, tx.data, tx.blockId, blockCount[tx.network]);
          }, 200);
        });
      }
    });
  });
}

function checkTransactionStatus(hash, endTime, network, data, txBlockId, currentBlockId) {
  const time = new Date().getTime();
  if (time < endTime) {
    http('GET', config.networkUrl[network] + config.checkTxUrl + hash).then(result => {
      if (result && result.res) {
        if (result.res.status == config.successTxStatus) {
          finishTx(hash);
          successTxNotification(hash);
        } else {
          if (+txBlockId != +currentBlockId) {
            http('POST', config.networkUrl[network] + config.addTxUrl, {name: data.name, data: data.data}).then(() => {
              brows.storage.local.get(null, (res) => {
                let wallets = res.wallets;
                wallets = wallets.map(wallet => {
                  if (wallet.tx && wallet.tx.hash === hash) wallet.tx.blockId = currentBlockId;
                  return wallet;
                });
                brows.storage.local.set({['wallets']: wallets}, () => {
                });
              });
            }).catch((error) => {
              let skip = false;
              if (error.res) {
                if (!error.res.code) {
                  skip = true;
                } else if (error.res.code != 42 && error.res.code != 43) {
                  skip = true;
                }
              }
              if (!skip) {
                finishTx(hash);
                failedTxNotification(hash);
              }
            });
          }
        }
      }
    });
  } else {
    finishTx(hash);
    failedTxNotification(hash);
  }
}

function clearMessagesForSign() {
  brows.storage.local.set({'messagesForSign': []}, () => {
  });
}

function http(method, url, params = '') {
  let xhr = new XMLHttpRequest(),
    currentUrl = method.toUpperCase() === "GET" ? url + params : url;
  xhr.open(method.toUpperCase(), currentUrl, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  method.toUpperCase() === "GET" ? xhr.send() : xhr.send(JSON.stringify(params));

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve(null);
        }
      } else {
        try {
          reject(JSON.parse(xhr.responseText));
        } catch (e) {
          resolve(null);
        }
      }
    };
  });
}

function finishTx(hash) {
  brows.storage.local.get(null, (result) => {
    let wallets = result.wallets;
    if (wallets) {
      wallets = wallets.map(wallet => {
        if (wallet.tx && wallet.tx.length) {
          wallet.tx = wallet.tx.filter((tx => tx.hash != hash));
        }
        return wallet;
      });
      brows.storage.local.set({['wallets']: wallets}, () => {
      });
    }
  });
}

function successTxNotification(hash) {
  new Notification('Goldmint Lite Wallet', {
    icon: 'assets/icon.png',
    body: `Transaction ${hash} is confirmed`,
  });
}

function failedTxNotification(hash) {
  new Notification('Goldmint Lite Wallet', {
    icon: 'assets/icon.png',
    body: `Transaction ${hash} is failed`,
  });
}

function createConfirmWindow(id, tabId) {
  brows.windows.create({
    url: `confirm-tx.html?id=${id}&tabId=${tabId}`,
    type: "popup",
    width: 320,
    height: 551
  }, (data) => {
  });
}

function createSignMessageWindow(id, tabId) {
  brows.windows.create({
    url: `sign-message.html?id=${id}&tabId=${tabId}`,
    type: "popup",
    width: 320,
    height: 551
  }, (data) => {
  });
}

function openSendTokenPage() {
  brows.tabs.create({
    active: true,
    url: 'index.html'
  }, null);
}
