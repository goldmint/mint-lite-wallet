"use strict"

const config = {
    api: {
        getBalance: 'https://service.goldmint.io/sumus/rest-proxy/v1/wallet/'
    }
};

var isLoggedIn = false;
var isFirefox = typeof InstallTrigger !== 'undefined';
var brows = isFirefox ? browser : chrome;

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node && node.appendChild(script);
}
injectScript(brows.extension.getURL('inpage.js'), 'body');

brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
    request.hasOwnProperty('loginStatus') && isLoggedIn !== request.loginStatus && (isLoggedIn = request.loginStatus);
    request.hasOwnProperty('login') && (isLoggedIn = request.login);
});
brows.runtime.sendMessage({checkLoginStatus: true});

window.addEventListener("message", (data) => {
    if (data.data && data.data.type === 'question' && data.data.resource in actions) {
        let resourceData = undefined;
        try {
            resourceData = JSON.parse(data.data.data);
        } catch (e) {}

        actions[data.data.resource](resourceData).then(r => {
            window.postMessage({type: 'answer', id: data.data.id, isSuccess: true, data: r}, "*");
        }, r => {
            window.postMessage({type: 'answer', id: data.data.id, isSuccess: false, data: r}, "*");
        });
    }
});

window.addEventListener('focus', () => {
    brows.runtime.sendMessage({checkLoginStatus: true});
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
        brows.storage.local.get(null, (result) => {
            resolve(isLoggedIn ? [result.wallets[result.currentWallet].publicKey] : []);
        });
    }),
    getBalance: data => new Promise((resolve, reject) => {
        http('GET', config.api.getBalance, data.address).then(result => {
            if (result) {
                resolve({
                    gold: result.res.balance.gold,
                    mint: result.res.balance.mint
                });
            } else {
                resolve(null);
            }
        });
    }),
    sendTransaction: data => new Promise((resolve, reject) => {
        if (!isLoggedIn) {
            return resolve(null);
        }

        brows.storage.local.get(null, (storage) => {
            const id = Math.random().toString(36).substr(2, 9);
            let tx = { id: id, from: data.from, to: data.to, token: data.token, amount: data.amount },
                unconfirmedTx = [];

            storage.unconfirmedTx && (unconfirmedTx = storage.unconfirmedTx);
            unconfirmedTx.push(tx);

            brows.runtime.onMessage.addListener(function answer(request, sender, sendResponse) {
                if (request.hasOwnProperty('sendTxResultContent') && request.sendTxResultContent.id === id) {
                    resolve(request.sendTxResultContent.hash);
                    brows.runtime.onMessage.removeListener(answer);
                }
            });

            brows.storage.local.set({'unconfirmedTx': unconfirmedTx}, () => {
                brows.runtime.sendMessage({sendTransaction: id});
            });
        });
    })
};
