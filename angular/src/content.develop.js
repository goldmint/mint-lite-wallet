"use strict"

const config = {
    networkUrl: {
        main: 'https://service.goldmint.io/sumus/mainnet/v1',
        test: 'https://service.goldmint.io/sumus/testnet/v1'
    },
    api: {
        getBalance: '/wallet/'
    }
};

var isLoggedIn = false;
var isFirefox = typeof InstallTrigger !== 'undefined';
var brows = isFirefox ? browser : chrome;

var script = document.createElement('script');
script.setAttribute('type', 'text/javascript');
script.setAttribute('src', brows.extension.getURL('inpage.js'));
document.documentElement.insertBefore(script , document.head);

brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
    request.hasOwnProperty('loginStatus') && isLoggedIn !== request.loginStatus && (isLoggedIn = request.loginStatus);
    request.hasOwnProperty('login') && (isLoggedIn = request.login);
});
brows.runtime.sendMessage({checkLoginStatus: true});

window.addEventListener("message", (data) => {
    if (data && data.data && data.data.type === 'question' && data.data.resource in actions) {
        let resourceData = undefined;
        try {
            resourceData = JSON.parse(data.data.data);
        } catch (e) {}

        window.postMessage && actions[data.data.resource](resourceData).then(r => {
            try {
                window.postMessage({type: 'answer', id: data.data.id, isSuccess: true, data: r}, "*");
            } catch(e) {}
        }, r => {
            try {
                window.postMessage({type: 'answer', id: data.data.id, isSuccess: false, data: r}, "*");
            } catch (e) {}
        });
    }
});

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
};

var actions = {
    getAccount: data => new Promise((resolve, reject) => {
        brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
            if (request.hasOwnProperty('loginStatus')) {
                isLoggedIn = request.loginStatus;

                brows.storage.local.get(null, (result) => {
                    resolve(isLoggedIn ? [result.wallets[result.currentWallet].publicKey] : []);
                    brows.runtime.onMessage.removeListener(checkLogin);
                });
            }
        });
        brows.runtime.sendMessage({checkLoginStatus: true});
    }),
    getCurrentNetwork: data => new Promise((resolve, reject) => {
        brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
            if (request.hasOwnProperty('loginStatus')) {
                isLoggedIn = request.loginStatus;

                brows.storage.local.get(null, (result) => {
                    resolve(isLoggedIn && result.currentNetwork ? result.currentNetwork : null);
                    brows.runtime.onMessage.removeListener(checkLogin);
                });
            }
        });
        brows.runtime.sendMessage({checkLoginStatus: true});
    }),
    getBalance: data => new Promise((resolve, reject) => {
        brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
            if (request.hasOwnProperty('loginStatus')) {
                isLoggedIn = request.loginStatus;

                brows.storage.local.get(null, (result) => {
                    let currentNetwork = config.networkUrl[result.currentNetwork];
                    if (isLoggedIn) {
                        http('GET', currentNetwork + config.api.getBalance, data.address).then(result => {
                            if (result) {
                                resolve({
                                    gold: result.res.balance.gold,
                                    mint: result.res.balance.mint
                                });
                                brows.runtime.onMessage.removeListener(checkLogin);
                            } else {
                                resolve(null);
                                brows.runtime.onMessage.removeListener(checkLogin);
                            }
                        });
                    } else {
                        resolve(null);
                        brows.runtime.onMessage.removeListener(checkLogin);
                    }
                });
            }
        });
        brows.runtime.sendMessage({checkLoginStatus: true});
    }),
    sendTransaction: data => new Promise((resolve, reject) => {
        brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
            if (request.hasOwnProperty('loginStatus')) {
                isLoggedIn = request.loginStatus;

                if (!isLoggedIn) {
                    brows.runtime.onMessage.removeListener(checkLogin);
                    return resolve(null);
                }
                brows.storage.local.get(null, (storage) => {
                    const id = Math.random().toString(36).substr(2, 9);
                    const from = storage.wallets[storage.currentWallet].publicKey;

                    let tx = { id, from, to: data.to, token: data.token, amount: data.amount, network: storage.currentNetwork },
                        unconfirmedTx = [];

                    storage.unconfirmedTx && (unconfirmedTx = storage.unconfirmedTx);
                    unconfirmedTx.push(tx);

                    brows.storage.local.set({'unconfirmedTx': unconfirmedTx}, () => {
                        brows.runtime.sendMessage({sendTransaction: id});
                        brows.runtime.onMessage.removeListener(checkLogin);
                    });

                    brows.runtime.onMessage.addListener(function answer(request, sender, sendResponse) {
                        if (request.hasOwnProperty('sendTxResultContent') && request.sendTxResultContent.id === id) {
                            resolve(request.sendTxResultContent.hash);
                            brows.runtime.onMessage.removeListener(answer);
                        }
                    });
                });
            }
        });
        brows.runtime.sendMessage({checkLoginStatus: true});
    }),
    openSendTokenPage: data => new Promise((resolve, reject) => {
        brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
            if (request.hasOwnProperty('loginStatus')) {
                isLoggedIn = request.loginStatus;

                if (!isLoggedIn) {
                    brows.runtime.onMessage.removeListener(checkLogin);
                    return resolve(null);
                }
                const dataObj = {
                    address: data.address,
                    token: data.token
                };
                brows.storage.local.set({'openSendTokenPage': dataObj}, () => {
                    brows.runtime.sendMessage({openSendTokenPage: data});
                    brows.runtime.onMessage.removeListener(checkLogin);
                    resolve(true);
                });
            }
        });
        brows.runtime.sendMessage({checkLoginStatus: true});
    })
};
