"use strict"

const config = {
    networkUrl: {
        main: 'https://service.goldmint.io/sumus/mainnet/v1',
        test: 'https://service.goldmint.io/sumus/testnet/v1'
    },
    checkTxUrl: '/tx/',
    addTxUrl: '/tx',
    successTxStatus: "approved",
    staleTxStatus: "stale",
    checkTxTime: 30000
};

let isFirefox = typeof InstallTrigger !== 'undefined';
let brows = isFirefox ? browser : chrome;
let xhr = new XMLHttpRequest();

let wallets = [];
let txQueue = {};

if (isFirefox) {
    brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
        actions(request, sender);
    });
} else {
    brows.extension.onMessage.addListener((request, sender, sendResponse) => {
        actions(request, sender);
    });
}

// after load page
watchTransactionStatus(true);

function actions(request, sender) {
    request.identify && login(request);
    request.logout && logout();
    // check login status
    request.checkLoginStatus && sendMessage('loginStatus', window.sessionStorage.getItem('identify') ? true : false);
    // after added new tx
    request.newTransaction && watchTransactionStatus(false);
    // after send tx from lib
    request.sendTransaction && createConfirmWindow(request.sendTransaction, sender.tab.id);
    // after success confirm tx from lib
    if (request.hasOwnProperty('sendTxResult')) {
        brows.tabs.query({active: true, currentWindow: true}, (tabs) => {
            brows.tabs.sendMessage(+request.sendTxResult.tabId, {sendTxResultContent: request.sendTxResult});
        });
        request.sendTxResult && watchTransactionStatus(false);
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

function watchTransactionStatus(firstLoad) {
    brows.storage.local.get(null, (result) => {
        wallets = result.wallets;
        wallets && wallets.forEach(wallet => {
            if (wallet.tx) {
                const hash = wallet.tx.hash,
                    endTime = wallet.tx.endTime,
                    network = wallet.tx.network,
                    data = wallet.tx.data;

                let isMatch = false;
                Object.keys(txQueue).forEach(key => {
                    key === hash && (isMatch = true);
                });

                if (!isMatch) {
                    const interval = setInterval(() => {
                        checkTransactionStatus(hash, endTime, network, data);
                    }, config.checkTxTime);
                    txQueue[hash] = interval;
                    firstLoad && checkTransactionStatus(hash, endTime, network, data);
                }
            }
        });
    });
}

function checkTransactionStatus(hash, endTime, network, data) {
    const time = new Date().getTime();
    if (time < endTime) {
        http('GET', config.networkUrl[network] + config.checkTxUrl + hash).then(result => {
            if (result && result.res) {
                if (result.res.status == config.successTxStatus) {
                    finishTx(hash);
                    successTxNotification(hash);
                } else if (result.res.status == config.staleTxStatus) {
                    http('POST', config.networkUrl[network] + config.addTxUrl, {name: data.name, data: data.data})
                        .then(result => {
                            !result && finishTx(hash);
                        });
                }
            }
        });
    } else {
        finishTx(hash);
        failedTxNotification(hash);
    }
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
                resolve(null);
            }
        };
    });
}

function finishTx(hash) {
    clearInterval(txQueue[hash]);
    delete txQueue[hash];

    wallets = wallets.map(wallet => {
        if (wallet.tx && wallet.tx.hash === hash) {
            delete wallet.tx;
        }
        return wallet;
    });
    brows.storage.local.set({['wallets']: wallets}, () => { });
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
    brows.windows.create({url: `confirm-tx.html?id=${id}&tabId=${tabId}`, type: "popup", width: 300, height: 520}, (data) => { });
}

function openSendTokenPage() {
    brows.tabs.create({
        active: true,
        url:  'index.html'
    }, null);
}
