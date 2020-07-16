"use strict"

const config = {
	networkUrl: {
		main: 'https://service.goldmint.io/mint/mainnet/v1',
		test: 'https://service.goldmint.io/mint/testnet/v1'
	},
	checkTxUrl: '/tx/',
	addTxUrl: '/tx',
	blockChainStatus: '/status',
	successTxStatus: "approved",
	staleTxStatus: "stale",
	checkTxTime: 30000
};

let isFirefox = typeof InstallTrigger !== 'undefined';
let brows = isFirefox ? browser : chrome;

// receive messages
let messageListener = (request, sender, sendResponse) => {
	// content injection requested
	if (request.injectContent) {
		injectContent();
		return;
	}
	actions(request, sender);
};
if (isFirefox) {
	brows.runtime.onMessage.addListener(messageListener);
} else {
	brows.extension.onMessage.addListener(messageListener);
}

injectMintWasm();
injectCryptoJS();

clearMessagesForSign();

// after load page
watchTransactionStatus();
setInterval(() => {
	watchTransactionStatus();
}, config.checkTxTime);

function actions(request, sender) {
	request.identify && login(request);
	request.logout && logout();

	// check login status
	request.checkLoginStatus && sendMessage('loginStatus', getIdentify() ? true : false);

	// after send tx from lib
	request.sendTransaction && createConfirmWindow(request.sendTransaction, sender.tab.id);
	// after success confirm tx from lib
	if (request.hasOwnProperty('sendTxResult')) {
		brows.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			brows.tabs.sendMessage(+request.sendTxResult.tabId, { sendTxResultContent: request.sendTxResult });
		});
	}

	// after call sign message function from lib
	request.signMessage && createSignMessageWindow(request.signMessage, sender.tab.id);
	// after success sign message from lib
	if (request.hasOwnProperty('sendSignResult')) {
		brows.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			brows.tabs.sendMessage(+request.sendSignResult.tabId, { sendSignResultContent: request.sendSignResult });
		});
	}

	// pass password
	request.getIdentifier && sendMessage('identifier', getIdentify());

	// open send gold page in wallet
	request.openSendTokenPage && openSendTokenPage();

	// get private key
	request.getPrivateKey && getPrivateKey(request);

	// make transfer asset transaction
    request.makeTransferAssetTransaction && makeTransferAssetTransaction(request);

    // get signed message
    request.getSignedMessage && getSignedMessage(request);

    // verify signature
    request.verifySignature && verifySignature(request);

    // get public key from private
	request.getPublicKeyFromPrivate && getPublicKeyFromPrivate(request);

	// generate seed phrase
	request.generateSeedPhrase && generateSeedPhrase();

	// validate seed phrase
	request.validateSeedPhrase && validateSeedPhrase(request);

	// recover private key
	request.recoverPrivateKey && recoverPrivateKey(request);
}

function getIdentify() {
    return window.sessionStorage.getItem('identify');
}

function decryptPrivateKey(publicKey, password = getIdentify()) {
	return new Promise(resolve => {
		brows.storage.local.get(null, (result) => {
			const { wallets } = result;
			if (wallets) {
				wallets.forEach(wallet => {
					if (wallet.publicKey === publicKey) {
						try {
							const privateKey = window.CryptoJS.AES.decrypt(wallet.privateKey, password).toString(window.CryptoJS.enc.Utf8);
							resolve(privateKey);
						} catch (e) {
							resolve(null);
						}
					}
				});
			} else {
				resolve(null);
			}
		});
	});
}

function encryptPrivateKey(privateKey) {
	return window.CryptoJS.AES.encrypt(privateKey, getIdentify()).toString();
}

async function makeTransferAssetTransaction(request) {
    let tx, _fromWallet, result = {};

    try {
        const { publicKey, toAddress, token, amount, nonce, fromWallet } = request.makeTransferAssetTransaction;
		_fromWallet = fromWallet;
        const privateKey = await decryptPrivateKey(publicKey);
        const singer = window.mint.Signer.FromPK(privateKey);

        tx = singer.SignTransferAssetTx(nonce, toAddress, token, amount.toString());
        if (tx) {
            result = {
                txData: tx.Data,
                txDigest: tx.Digest,
                txName: tx.Name
            }
        }
    } catch (e) {
        result = {};
    }

    sendMessage('makeTransferAssetTransaction', result, _fromWallet);
}

async function getSignedMessage(request) {
    let result = null;

    try {
        const { publicKey, bytesObject } = request.getSignedMessage;
        const privateKey = await decryptPrivateKey(publicKey);

        const singer = window.mint.Signer.FromPK(privateKey);
        result = singer.SignMessage(getUint8Array(bytesObject));
    } catch (e) {
        result = null;
    }

    sendMessage('getSignedMessage', result);
}

function verifySignature(request) {
    let result = null;

    try {
        const { bytes, signature, publicKey } = request.verifySignature;
        result = window.mint.Verify(getUint8Array(bytes), signature, publicKey);
    } catch (e) {
        result = null;
    }

	sendMessage('verifySignatureResult', result);
}

// Used in wallet app only

async function getPrivateKey(request) {
	const { publicKey, password } = request.getPrivateKey;
	const privateKey = await decryptPrivateKey(publicKey, password);

	sendMessage('getPrivateKey', privateKey, true);
}

function getPublicKeyFromPrivate(request) {
	let result = null;

	try {
		const { privateKey } = request.getPublicKeyFromPrivate;
		result = window.mint.Signer.FromPK(privateKey).PublicKey();
	} catch (e) {
		result = null;
	}

	sendMessage('getPublicKeyFromPrivate', result, true);
}

function generateSeedPhrase() {
	let result = null;

	try {
		result = window.mint.Mnemonic.Generate();
	} catch (e) {
		result = null;
	}

	sendMessage('generateSeedPhrase', result, true);
}

function validateSeedPhrase(request) {
	let result = null;

	try {
		const { seedPhrase } = request.validateSeedPhrase;
		result = window.mint.Mnemonic.Valid(seedPhrase, true);
	} catch (e) {
		result = null;
	}

	sendMessage('validateSeedPhrase', result, true);
}

function recoverPrivateKey(request) {
	let result = null;

	try {
		const { seedPhrase, extraWord } = request.recoverPrivateKey;
		const privateKey = window.mint.Mnemonic.Recover(seedPhrase, extraWord);
		const signer = window.mint.Signer.FromPK(privateKey);

		result =  {
			publicKey: signer.PublicKey(),
			privateKey: signer.PrivateKey()
		};
	} catch (e) {
		result = null;
	}

	sendMessage('recoverPrivateKey', result, true);
}

// ---

function getUint8Array(bytes) {
    let _bytes = [];
    for (let key in bytes) {
        _bytes.push(bytes[key]);
    }
    return new Uint8Array(_bytes);
}

// ---

function sendMessage(key, value, fromWallet = false) {
	if (fromWallet) {
		// this method uses for send data in wallet app
		brows.runtime.sendMessage(brows.runtime.id, { [key]: value });
	} else {
		brows.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			tabs[0] && brows.tabs.sendMessage(tabs[0].id, { [key]: value });
		});
	}
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
				try {
					reject(JSON.parse(xhr.responseText));
				} catch (e) {
					resolve(null);
				}
			}
		};
	});
}

function login(request) {
	window.sessionStorage.setItem('identify', request.identify);
	sendMessage('login', true);
}

function logout() {
	window.sessionStorage.removeItem('identify');
	sendMessage('login', false);
}

function watchTransactionStatus() {
	brows.storage.local.get(null, (result) => {
		let wallets = result.wallets;
		let txListEmpty = true;
		let blockCount = {
			main: 0,
			test: 0
		};
		let skip = false;

		wallets && wallets.forEach(wallet => {
			if (wallet.tx && wallet.tx.length) txListEmpty = false;
		});

		if (txListEmpty) return;

		const p1 = http('GET', config.networkUrl['main'] + config.blockChainStatus);
		// const p2 = http('GET', config.networkUrl['test'] + config.blockChainStatus);

		Promise.all([p1/*, p2*/]).then(values => {
			if (values) {
				values.forEach((value, index) => {
					if (!value || !value.res || !value.res.blockchain_state || !value.res.blockchain_state.block_count) {
						skip = true;
					} else {
						blockCount[Object.keys(blockCount)[index]] = +value.res.blockchain_state.block_count - 1;
					}
				});
			}
		});

		!skip && wallets && wallets.forEach(wallet => {
			if (wallet.tx) {
				wallet.tx.forEach(tx => {
					setTimeout(() => {
						checkTransactionStatus(tx.hash, tx.endTime, tx.network, tx.data, tx.blockId, blockCount[tx.network]);
					}, 200);
				});
			}
		});
	});
}

function checkTransactionStatus(hash, endTime, network, data, txBlockId, currentBlockId) {
	const time = new Date().getTime();
	if (time < endTime) {
		http('GET', config.networkUrl[network] + config.checkTxUrl + hash).then(result => {
			if (result && result.res) {
				if (result.res.status == config.successTxStatus) {
					finishTx(hash);
					successTxNotification(hash);
				} else {
					if (+txBlockId != +currentBlockId) {
						http('POST', config.networkUrl[network] + config.addTxUrl, { name: data.name, data: data.data }).then(() => {
							brows.storage.local.get(null, (res) => {
								let wallets = res.wallets;
								wallets = wallets.map(wallet => {
									if (wallet.tx && wallet.tx.hash === hash) wallet.tx.blockId = currentBlockId;
									return wallet;
								});
								brows.storage.local.set({ ['wallets']: wallets }, () => {
								});
							});
						}).catch((error) => {
							let skip = false;
							if (error.res) {
								if (!error.res.code) {
									skip = true;
								} else if (error.res.code != 42 && error.res.code != 43) {
									skip = true;
								}
							}
							if (!skip) {
								finishTx(hash);
								failedTxNotification(hash);
							}
						});
					}
				}
			}
		});
	} else {
		finishTx(hash);
		failedTxNotification(hash);
	}
}

function clearMessagesForSign() {
	brows.storage.local.set({ 'messagesForSign': [] }, () => {});
}

function finishTx(hash) {
	brows.storage.local.get(null, (result) => {
		let wallets = result.wallets;
		if (wallets) {
			wallets = wallets.map(wallet => {
				if (wallet.tx && wallet.tx.length) {
					wallet.tx = wallet.tx.filter((tx => tx.hash != hash));
				}
				return wallet;
			});
			brows.storage.local.set({ ['wallets']: wallets }, () => {
			});
		}
	});
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
	brows.windows.create({
		url: `confirm-tx.html?id=${id}&tabId=${tabId}`,
		type: "popup",
		width: 320,
		height: 551
	}, (data) => {});
}

function createSignMessageWindow(id, tabId) {
	brows.windows.create({
		url: `sign-message.html?id=${id}&tabId=${tabId}`,
		type: "popup",
		width: 320,
		height: 551
	}, (data) => {});
}

function openSendTokenPage() {
	brows.tabs.create({
		active: true,
		url: 'index.html'
	}, null);
}

// ---

function injectContent() {
	try {
		console.log("Injecting content")
		brows.tabs.executeScript(null, { file: 'content.js' });
	} catch (e) {
		console.log("Failed to inject")
	}
}

async function injectMintWasm() {
    const goWasmPath = brows.extension.getURL('assets/libs/mint/gowasm.js');
    await import(goWasmPath);

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

            const mintWasmPath = brows.extension.getURL('assets/libs/mint/mint.wasm');
            WebAssembly.instantiateStreaming(fetch(mintWasmPath), go.importObject)
                .then((result) => {
                    go.run(result.instance);
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    }, 50);
}

async function injectCryptoJS() {
    const cryptoJsPath = brows.extension.getURL('assets/libs/crypto-js/crypto-js.js');
    await import(cryptoJsPath);
}
