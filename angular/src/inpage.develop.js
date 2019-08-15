"use strict"

!function() {
    var questions = {};
    var sendQuestion = (resource, data) => new Promise((resolve, reject) => {
        let id = Math.random().toString(36).substr(2, 9);
        questions[id] = [resolve, reject];
        window.postMessage({type: 'question', id, resource, data: JSON.stringify(data)}, "*");
    });

    window.addEventListener("message", (data) => {
        if (data && data.data && data.data.type === 'answer' && data.data.id in questions) {
            questions[data.data.id][data.data.isSuccess ? 0 : 1](data.data.data);
            delete questions[data.data.id];
        }
    });

    class GoldMint {

        constructor() { }

        getAccount() {
            return sendQuestion('getAccount');
        }

        getCurrentNetwork() {
            return sendQuestion('getCurrentNetwork');
        }

        getBalance(address) {
            return sendQuestion('getBalance', { address });
        }

        sendTransaction(to, token, amount) {
            return sendQuestion('sendTransaction', { to, token, amount });
        }

        openSendTokenPage(address, token) {
            return sendQuestion('openSendTokenPage', { address, token: token.toLowerCase() });
        }

        signMessage(bytes, publicKey = null) {
            return sendQuestion('signMessage', { bytes, publicKey });
        }

        verifySignature(bytes, signature, publicKey) {
            let result;
            if (!bytes || typeof bytes !== 'object' || !signature || !publicKey) {
                result = null;
            }

            if (window.SumusLib && window.SumusLib.Signer && window.SumusLib.Signer.Verify) {
                try {
                    result = window.SumusLib.Signer.Verify(bytes, signature, publicKey)
                } catch (e) {
                    result = null;
                }
            } else {
                result = null;
            }

            return sendQuestion('verifySignature', { result });
        }
    }

    window.GoldMint = new GoldMint;

}();
