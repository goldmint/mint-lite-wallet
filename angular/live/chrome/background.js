"use strict"

const config = {
    // checkTxUrl: 'https://service.goldmint.io/sumus/rest-proxy/v1/tx/',
    checkTxUrl: 'https://staging.goldmint.io/wallet/api/v1/explorer/transaction',
    // successTxStatus: "approved",
    successTxStatus: 2,
    checkTxTime: 30000
};

let isFirefox = typeof InstallTrigger !== 'undefined';
let browser = isFirefox ? browser : chrome;
let xhr = new XMLHttpRequest();

let wallets = [];
let txQueue = {};

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
        browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
            browser.tabs.sendMessage(+request.sendTxResult.tabId, {sendTxResultContent: request.sendTxResult});
        });
        request.sendTxResult && watchTransactionStatus(false);
    }
    // pass password
    request.getIdentifier && sendMessage('identifier', window.sessionStorage.getItem('identify'));
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
    browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {[key]: value});
    });
}

function watchTransactionStatus(firstLoad) {
   browser.storage.local.get(null, (result) => {
        wallets = result.wallets;

        wallets && wallets.forEach(wallet => {
            if (wallet.tx) {
                const hash = wallet.tx.hash;
                const endTime = wallet.tx.endTime;

                let isMatch = false;
                Object.keys(txQueue).forEach(key => {
                    key === hash && (isMatch = true);
                });

                if (!isMatch) {
                    const interval = setInterval(() => {
                        checkTransactionStatus(hash, endTime);
                    }, config.checkTxTime);
                    txQueue[hash] = interval;
                    firstLoad && checkTransactionStatus(hash, endTime);
                }
            }
        });
    });
}

function checkTransactionStatus(hash, endTime) {
    const time = new Date().getTime();
    if (time < endTime) {
        xhr.open('POST', config.checkTxUrl, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify({hash: hash}));

        xhr.onload = () => {
            try {
                const result = JSON.parse(xhr.responseText);
                if (result.data.status == config.successTxStatus) {
                    finishTx(hash);
                    successTxNotification(hash);
                }
            } catch (e) { }
        };
    } else {
        finishTx(hash);
        failedTxNotification(hash);
    }
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
    browser.storage.local.set({['wallets']: wallets}, () => { });
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
    browser.windows.create({url: `confirm-tx.html?id=${id}&tabId=${tabId}`, type: "popup", width: 300, height: 520}, (data) => { });
}

if (isFirefox) {
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        actions(request, sender);
    });
} else {
    browser.extension.onMessage.addListener((request, sender, sendResponse) => {
        actions(request, sender);
    });
}