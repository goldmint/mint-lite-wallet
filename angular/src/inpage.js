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

        getAccount() {
            return sendQuestion('getAccount');
        }

        getBalance(address) {
            return sendQuestion('getBalance', {address});
        }
    }

    window.GoldMint = new GoldMint;

}();