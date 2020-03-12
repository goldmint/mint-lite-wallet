"use strict"

!function() {
	if (window['GoldMint']) {
		return;
	}
	
	const config = {
		networkUrl: {
			main: 'https://service.goldmint.io/mint/mainnet/v1',
			test: 'https://service.goldmint.io/mint/testnet/v1'
		},
		api: {
			getBalance: '/wallet/'
		}
	};

	var isLoggedIn = false;
	var isFirefox = typeof InstallTrigger !== 'undefined';
	var brows = isFirefox ? browser : chrome;

	injectInpageJs();

	brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
		request.hasOwnProperty('loginStatus') && isLoggedIn !== request.loginStatus && (isLoggedIn = request.loginStatus);
		request.hasOwnProperty('login') && (isLoggedIn = request.login);
	});
	brows.runtime.sendMessage({ checkLoginStatus: true });

	window.addEventListener("message", (data) => {
		if (data && data.data && data.data.type === 'question' && data.data.resource in actions) {
			let resourceData = undefined;
			try {
				resourceData = JSON.parse(data.data.data);
			} catch (e) {
			}

			window.postMessage && actions[data.data.resource](resourceData).then(r => {
				try {
					window.postMessage({ type: 'answer', id: data.data.id, isSuccess: true, data: r }, "*");
				} catch (e) {
				}
			}, r => {
				try {
					window.postMessage({ type: 'answer', id: data.data.id, isSuccess: false, data: r }, "*");
				} catch (e) {
				}
			});
		}
	});

	function injectInpageJs() {
		var script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', brows.extension.getURL('inpage.js'));
		document.documentElement.insertBefore(script, document.head);
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
	};

	function generateId() {
		return Math.random().toString(36).substr(2, 9);
	}

	var actions = {
		getAccount: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					brows.storage.local.get(null, (result) => {
						resolve(isLoggedIn ? [result.wallets[result.currentWallet].publicKey] : []);
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		getCurrentNetwork: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					brows.storage.local.get(null, (result) => {
						resolve(isLoggedIn ? (result.currentNetwork || 'main') : null);
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		getBalance: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					brows.storage.local.get(null, (result) => {
						let currentNetwork = config.networkUrl[result.currentNetwork || 'main'];
						if (isLoggedIn) {
							http('GET', currentNetwork + config.api.getBalance, data.address).then(result => {
								if (result) {
									resolve({
										gold: result.res.balance.gold,
										mint: result.res.balance.mint
									});
								} else {
									resolve(null);
								}
							});
						} else {
							resolve(null);
						}
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		sendTransaction: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					if (!isLoggedIn) {
						return resolve(null);
					}
					brows.storage.local.get(null, (storage) => {
						const id = generateId();
						const from = storage.wallets[storage.currentWallet].publicKey;

						let tx = { id, from, to: data.to, token: data.token, amount: data.amount, network: (storage.currentNetwork || 'main') },
							unconfirmedTx = [];

						storage.unconfirmedTx && (unconfirmedTx = storage.unconfirmedTx);
						unconfirmedTx.push(tx);

						brows.storage.local.set({ 'unconfirmedTx': unconfirmedTx }, () => {
							brows.runtime.sendMessage({ sendTransaction: id });
						});

						brows.runtime.onMessage.addListener(function answer(request, sender, sendResponse) {
							brows.runtime.onMessage.removeListener(answer);

							if (request.hasOwnProperty('sendTxResultContent') && request.sendTxResultContent.id === id) {
								resolve(request.sendTxResultContent.hash);
							}
						});
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		openSendTokenPage: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					if (!isLoggedIn) {
						return resolve(null);
					}
					const dataObj = {
						address: data.address,
						token: data.token,
						amount: data.amount
					};
					brows.storage.local.set({ 'openSendTokenPage': dataObj }, () => {
						brows.runtime.sendMessage({ openSendTokenPage: data });
						resolve(true);
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		signMessage: data => new Promise((resolve, reject) => {
			brows.runtime.onMessage.addListener(function checkLogin(request, sender, sendResponse) {
				brows.runtime.onMessage.removeListener(checkLogin);

				if (request.hasOwnProperty('loginStatus')) {
					isLoggedIn = request.loginStatus;

					if (!isLoggedIn) {
						return resolve(null);
					}

					if (!data.bytes || typeof data.bytes !== 'object') {
						return resolve(null);
					}

					brows.storage.local.get(null, (storage) => {
						const id = generateId();
						const publicKey = data.publicKey || storage.wallets[storage.currentWallet].publicKey;
						const host = window.location.host;
						let iconUrl;

						let icons = document.querySelectorAll('link');
						[].forEach.call(icons, icon => {
							if (icon.rel.indexOf('icon') >= 0) {
								iconUrl = icon.href;
							}
						});

						let message = { id, bytes: data.bytes, publicKey, host, iconUrl: iconUrl || null },
							messagesForSign = [];

						storage.messagesForSign && (messagesForSign = storage.messagesForSign);
						messagesForSign.push(message);

						brows.storage.local.set({ 'messagesForSign': messagesForSign }, () => {
							brows.runtime.sendMessage({ signMessage: id });
						});

						brows.runtime.onMessage.addListener(function answer(request, sender, sendResponse) {
							brows.runtime.onMessage.removeListener(answer);

							if (request.hasOwnProperty('sendSignResultContent') && request.sendSignResultContent.id === id) {
								resolve(request.sendSignResultContent.result);
							}
						});
					});
				}
			});
			brows.runtime.sendMessage({ checkLoginStatus: true });
		}),

		verifySignature: data => new Promise((resolve, reject) => {
			resolve(data.result);
		}),

		getGoWasmJsPath: data => new Promise((resolve, reject) => {
			resolve(brows.extension.getURL('assets/libs/mint/gowasm.js'));
		}),

		getMintWasmPath: data => new Promise((resolve, reject) => {
			resolve(brows.extension.getURL('assets/libs/mint/mint.wasm'));
		})
	};

}();