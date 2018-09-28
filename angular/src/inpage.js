"use strict"

!function() {
    var questions = {};
    var sendQuestion = (resource, data) => new Promise((resolve, reject) => {
        let id = Math.random().toString(36).substr(2, 9);
        questions[id] = [resolve, reject];
        window.postMessage({type: 'question', id, resource, data: JSON.stringify(data)}, "*");
    });

    window.addEventListener("message", (data) => {
        if (data.data.type === 'answer' && data.data.id in questions) {
            questions[data.data.id][data.data.isSuccess ? 0 : 1](data.data.data);
            delete questions[data.data.id];
        }
    });

    class GoldMint {

        constructor() { }

        // getBalance() {
        //     let xhr = new XMLHttpRequest();
        //     let isLoggedIn = false;
        //
        //     browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        //         if (request.hasOwnProperty('loginStatus')) {
        //             isLoggedIn = request.loginStatus;
        //
        //             return new Promise((resolve, reject) => {
        //                 if (isLoggedIn) {
        //                     browser.storage.local.get(null, (result) => {
        //                         const currentWallet = result.currentWallet;
        //                         const walletList = result.wallets;
        //
        //                         xhr.open('GET', config.api.getBalance + walletList[currentWallet].publicKey, true);
        //                         xhr.setRequestHeader('Content-Type', 'application/json');
        //                         xhr.send();
        //                         xhr.onload = () => {
        //                             try {
        //                                 const result = JSON.parse(xhr.responseText);
        //                                 resolve({
        //                                     gold: result.res.balance.gold,
        //                                     mnt: result.res.balance.mint
        //                                 });
        //                             } catch (e) {
        //                                 resolve(null);
        //                             }
        //                         };
        //                         xhr.onerror = () => {
        //                             resolve(null);
        //                         }
        //                     });
        //                 } else {
        //                     resolve(null);
        //                 }
        //             });
        //         }
        //     });
        //
        //     browser.runtime.sendMessage({checkLoginStatus: true});
        // }

        getAccount() {
            return sendQuestion('getAccount');
        }
    }

    window.GoldMint = new GoldMint;

}();