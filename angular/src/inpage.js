"use strict"

!function () {
	if (window['GoldMint']) {
		return;
	}
	
	var questions = {};
	var sendQuestion = (resource, data) => new Promise((resolve, reject) => {
		let id = Math.random().toString(36).substr(2, 9);
		questions[id] = [resolve, reject];
		window.postMessage({ type: 'question', id, resource, data: JSON.stringify(data) }, "*");
	});

	window.addEventListener("message", (data) => {
		if (data && data.data && data.data.type === 'answer' && data.data.id in questions) {
			questions[data.data.id][data.data.isSuccess ? 0 : 1](data.data.data);
			delete questions[data.data.id];
		}
	});

	Promise.all([
		sendQuestion('getGoWasmJsPath'),
		sendQuestion('getMintWasmPath')
	]).then(res => {
		let script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', res[0]);
		document.head && document.head.appendChild(script);

		const interval = setInterval(() => {
			if (window.Go) {
				clearInterval(interval);
				const go = new Go();

				// polyfill
				if (!WebAssembly.instantiateStreaming) {
					WebAssembly.instantiateStreaming = async (resp, importObject) => {
						const source = await (await resp).arrayBuffer();
						return await WebAssembly.instantiate(source, importObject);
					};
				}

				WebAssembly.instantiateStreaming(fetch(res[1]), go.importObject)
					.then((result) => {
						go.run(result.instance);
					})
					.catch((err) => {
						console.error(err);
					});
			}
		}, 50);
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

		openSendTokenPage(address, token, amount = 0) {
			return sendQuestion('openSendTokenPage', { address, token: token.toLowerCase(), amount });
		}

		signMessage(bytes, publicKey = null) {
			return sendQuestion('signMessage', { bytes, publicKey });
		}

		verifySignature(bytes, signature, publicKey) {
			let result;
			if (!bytes || typeof bytes !== 'object' || !signature || !publicKey) {
				result = null;
			}

			if (window.mint && window.mint.Verify) {
				try {
					result = window.mint.Verify(bytes, signature, publicKey)
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
