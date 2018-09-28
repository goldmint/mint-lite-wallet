"use strict"

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

        actions[data.data.resource](resourceData).then(r =>
        {
            window.postMessage({type: 'answer', id: data.data.id, isSuccess: true, data: r}, "*");
        }, r =>
        {
            window.postMessage({type: 'answer', id: data.data.id, isSuccess: false, data: r}, "*");
        });
    }
});

var actions = {
    getAccount: data => new Promise((resolve, reject) => {
        browser.storage.local.get(null, (result) =>
        {
            resolve(isLoggedIn ? [result.wallets[result.currentWallet].publicKey] : []);
        });
    }),
};