"use strict"

const config = {
    api: {
        getBalance: 'https://service.goldmint.io/sumus/rest-proxy/v1/wallet/'
    }
};

function injectScript(file_path, tag) {
    var node = document.getElementsByTagName(tag)[0];
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
}
injectScript(chrome.extension.getURL('inpage.js'), 'body');


var isLoggedIn = false;
var isFirefox = typeof InstallTrigger !== 'undefined';
var browser = isFirefox ? browser : chrome;

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    request.hasOwnProperty('loginStatus') && (isLoggedIn = request.loginStatus);
    request.hasOwnProperty('login') && (isLoggedIn = request.login);
});
browser.runtime.sendMessage({checkLoginStatus: true});

window.addEventListener("message", (data) => {
    if (data.data.type === 'question' && data.data.resource in actions) {
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

function http(method, url, params = '') {
    let xhr = new XMLHttpRequest(),
        currentUrl = method.toUpperCase() === "GET" ? url + params : url;

    xhr.open(method.toUpperCase(), currentUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    method.toUpperCase() === "GET" ? xhr.send() : xhr.send(params);

    return new Promise((resolve, reject) => {
        xhr.onload = () => {
            try {
                resolve(JSON.parse(xhr.responseText));
            } catch (e) {
                resolve(null);
            }
        };
        xhr.onerror = () => {
            resolve(null);
        }
    });
}

var actions = {
    getAccount: data => new Promise((resolve, reject) => {
        browser.storage.local.get(null, (result) => {
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
};