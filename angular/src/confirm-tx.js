'use strict';

!function () {
	const config = {
		networkUrl: {
			main: 'https://service.goldmint.io/mint/mainnet/v1',
			test: 'https://service.goldmint.io/mint/testnet/v1'
		},
		api: {
			getBalance: '/wallet/',
			addTx: '/tx',
			blockChainStatus: '/status'
		},
		timeTxFailed: 1800000, // 30 minutes,
	};

	let css = `
        body, html {
            margin: 0;
            padding: 0;
            min-width: 300px;
            width: 100%;
            height: 520px;
            overflow: hidden;
            font-size: 16px;
            font-family: Avenir,Helvetica,Arial,sans-serif;
            line-height: 1.5;
        }
        header {
            background: #212121;
            color: #ccc;
            height: 57px;
            padding: 0 1rem;
            display: flex;
            align-items: center;
        }
        header svg {
          min-width: 25px;
        }
        header > div {
            width: 100%;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-left: 15px;
        }
        .icon-gold {
            color: #e9cb6b;
            fill: #e9cb6b;
        }
        .confirm-container, .failed-container {
            padding: 1rem;
        }
        .confirm-block {
            margin-top: 0.5rem;
        }
        .h4, h4 {
            font-size: 1.5rem;
            margin-top: 0;
            margin-bottom: 1rem;
            font-weight: 500;
            line-height: 1.2;
            text-align: center;
        }
        .confirm-info-block {
            border-bottom: 2px solid #e9cb6b;
            border-top: 2px solid #e9cb6b;
            padding: 0.5rem 0;
        }
        .button-block {
            display: flex;
            margin-top: 1.5rem;
            justify-content: center;
        }
        .confirm-address-block {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .confirm-item {
            font-size: 14px;
            color: #7a7a7a;
        }
        .confirm-item.name {
            max-width: 104px;
            min-width: 86px;
            overflow: hidden;
        }
        .confirm-details-block {
            text-align: center;
            margin-top: 0.5rem;
        }
        .trs-fee {
            font-size: .875rem;
        }
        .nonce-info {
            font-size: .75em;
            color: #ababab;
        }
        .btn:not(:disabled):not(.disabled) {
            cursor: pointer;
        }
        .btn {
            font-size: 1.125rem;
            letter-spacing: .1em;
            text-transform: uppercase;
            padding: .875rem 1.25rem;
            min-height: 57px;
            min-width: 150px;
            cursor: pointer;
            display: inline-block;
            font-weight: 700;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            border: 1px solid transparent;
            line-height: 1.5;
            border-radius: 0;
            transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
        }
        .btn-sm {
            font-size: .875rem;
            line-height: 1rem;
            letter-spacing: 0;
            text-transform: none;
            padding: .625rem .875rem;
            min-height: 38px;
            min-width: 75px;
        }
        .btn-primary {
            background-color: #e9cb6b;
            border-color: #e9cb6b;
            color: #1c1c1c;
            max-width: 250px;
        }
        .btn-cancel {
            margin-right: 0.25rem;
            width: 50%;
        }
        .btn-confirm {
            margin-left: 0.25rem;
            width: 50%;
        }
        [type=reset], [type=submit], button, html [type=button] {
            -webkit-appearance: button;
        }
        .btn-primary:hover {
            color: #212529;
            background-color: #fadc7d;
            border-color: #fadc7d;
        }
        .btn:focus, .btn:hover {
            text-decoration: none;
            outline: none;
        }
        .btn-primary:not(:disabled):not(.disabled).active, .btn-primary:not(:disabled):not(.disabled):active, .show>.btn-primary.dropdown-toggle {
            background-color: #fadc7d;
            border-color: #fadc7d;
        }
        .btn-primary:not([disabled]):not(.disabled).active, .btn-primary:not([disabled]):not(.disabled):active {
            color: #fff;
        }
        .btn-primary.focus, .btn-primary:focus, .btn-primary:not(:disabled):not(.disabled).active:focus, .btn-primary:not(:disabled):not(.disabled):active:focus, .show>.btn-primary.dropdown-toggle:focus {
            box-shadow: 0 0 0 0.2rem rgba(233,203,107,.5);
        }
        .failed-icon {
            text-align: center;
            margin-top: 24px;
        }
        .failed-text {
            margin-bottom: 8px;
        }
        #errorMessage {
          text-align: center;
        }
        .btn-done {
            width: 100%;
        }
        .btn-primary.disabled, .btn-primary:disabled {
            color: #212529;
            background-color: #e9cb6b;
            border-color: #e9cb6b;
            cursor: not-allowed;
        }
        .btn.disabled, .btn:disabled {
            opacity: .65;
        }
        .failed-container {
            display: none;
        }
        body.failed .confirm-container {
            display: none;
        }
        body.failed .failed-container {
            display: block;
        }
    `
	let queryParams = {};
	window.location.search.replace(/^\?/, '').split('&').forEach(item => {
		let param = item.split('=');
		queryParams[decodeURIComponent(param[0])] = param.length > 1 ? decodeURIComponent(param[1]) : '';
	});

	let isFirefox = typeof InstallTrigger !== 'undefined',
		brows = isFirefox ? browser : chrome,
		nonce,
		accountName,
		publicKey,
		unconfirmedTx,
		currentUnconfirmedTx,
		wallets,
		id = queryParams.id,
		tabId = queryParams.tabId,
		network,
		identify,
		domElements = {},
		retrySendTxCount = 0;

	onInit();

	function onInit() {
		initCSS();

		if (isFirefox) {
			brows.runtime.onMessage.addListener((request, sender, sendResponse) => {
				actions(request);
			});
		} else {
			brows.extension.onMessage.addListener((request, sender, sendResponse) => {
				actions(request);
			});
		}
		brows.runtime.sendMessage({ getIdentifier: true });

		chooseDomElements([
			'infoFrom', 'infoTo', 'infoAmount', 'infoFee', 'infoNonce', 'btnClose', 'btnConfirm', 'btnDone', 'errorMessage', 'accountName'
		]);

		domElements.btnClose.addEventListener('click', cancel);
		domElements.btnConfirm.addEventListener('click', confirm);
		domElements.btnDone.addEventListener('click', close);

		disabledBtn();

		brows.storage.local.get(null, data => {
			wallets = data.wallets;
			unconfirmedTx = data.unconfirmedTx;

			unconfirmedTx.forEach(tx => {
				if (tx.id == id) {

					tx.tabId = tabId;
					network = tx.network;
					brows.storage.local.set({ ['unconfirmedTx']: unconfirmedTx }, () => { });

					http('GET', config.networkUrl[network] + config.api.getBalance, tx.from).then(result => {
						if (result) {
							nonce = +result['res'].approved_nonce + 1;
                            const mintBalance = result['res'].balance.mint;

							try {
								for (let i = 0; i < wallets.length; i++) {
									if (wallets[i].publicKey === tx.from) {
										publicKey = wallets[i].publicKey;
										accountName = wallets[i].name;
										break;
									}
								}

								currentUnconfirmedTx = tx;

								domElements.infoFrom.textContent = reduction(tx.from);
								domElements.infoTo.textContent = reduction(tx.to);
								domElements.infoAmount.textContent = tx.amount + ' ' + tx.token.toUpperCase();
								domElements.infoFee.textContent = feeCalculate(mintBalance, tx.amount, tx.token) + ' ' + tx.token.toUpperCase();
								domElements.infoNonce.textContent = nonce;
								domElements.accountName.textContent = accountName;

								enableBtn();
							} catch (e) {
								failedTx();
							}
						} else {
							failedTx();
						}
					});
				}
			});
		});
	}

	function actions(request) {
		request.identifier && (identify = request.identifier);

		if (request.hasOwnProperty('makeTransferAssetTransaction')) {
		    try {
                const { txData, txDigest, txName } = request.makeTransferAssetTransaction;
                postWalletTransaction(txData, txDigest, txName);
            } catch (e) {
                failedTx();
            }
        }
	}

	function makeTransferAssetTransaction(publicKey, toAddress, token, amount, nonce) {
        brows.runtime.sendMessage({ makeTransferAssetTransaction: { publicKey, toAddress, token, amount, nonce } });
	}

	function postWalletTransaction(data, hash, name) {
		http('GET', config.networkUrl[network] + config.api.blockChainStatus).then(result => {
			if (!result || !result.res || !result.res.blockchain_state || !result.res.blockchain_state.block_count) {
				failedTx();
				return;
			}
			;

			http('POST', config.networkUrl[network] + config.api.addTx, { name, data }).then(res => {
				res ? successTx(hash, data, name, result.res.blockchain_state.block_count) : failedTx();
			}).catch((error) => {
				let skip = false;
				if (error.res) {
					if (!error.res.code) {
						domElements.errorMessage.textContent = 'Service is unavailable. Please retry later';
					} else if (error.res.code == 42 || error.res.code == 43) {
						domElements.errorMessage.textContent = 'Transaction pool overflow'
					} else if (error.res.code && error.res.wallet_inconsistency) {
						domElements.errorMessage.textContent = 'Not enough funds'
					} else if (error.res.code && error.res.nonce_ahead) {
						domElements.errorMessage.textContent = 'Transaction is out of range'
					} else if (error.res.code && res.nonce_behind) {
						// resend tx
						nonce++;
						setTimeout(() => {
							if (retrySendTxCount >= 10) {
								failedTx();
								return;
							}
							retrySendTxCount++;
							confirm();
						}, 200);
						skip = true;
					}
				}
				!skip && failedTx();
			});
		}).catch(() => {
			failedTx();
		});
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

	function successTx(hash, txData, txName, blocks) {
		brows.storage.local.get(null, (data) => {
			unconfirmedTx = data.unconfirmedTx;
			wallets = data.wallets;
			let endTime = (new Date().getTime() + config.timeTxFailed);

			wallets = wallets.map(wallet => {
				if (wallet.publicKey === currentUnconfirmedTx.from) {
					let tx = {
						hash,
						endTime,
						amount: currentUnconfirmedTx.amount,
						token: currentUnconfirmedTx.token.toUpperCase(),
						network,
						nonce: nonce,
						blockId: blocks ? (+blocks - 1) : null,
						data: { data: txData, name: txName }
					};

					if (wallet.tx) {
						wallet.tx.push(tx);
					} else {
						wallet.tx = [tx];
					}
				}
				return wallet;
			});

			unconfirmedTx.forEach((tx, index) => {
				if (tx.id == id) {
					unconfirmedTx.splice(index, 1);
				}
			});

			brows.storage.local.set({ ['wallets']: wallets }, () => {
				brows.storage.local.set({ ['unconfirmedTx']: unconfirmedTx }, () => {
					brows.runtime.sendMessage({ sendTxResult: { hash, id, tabId } });
					close();
				});
			});

		});
	}

	function failedTx() {
		document.body.classList.add('failed');
		cancel(false);
	}

	function confirm() {
		disabledBtn();
		makeTransferAssetTransaction(publicKey, currentUnconfirmedTx.to, currentUnconfirmedTx.token.toUpperCase(), currentUnconfirmedTx.amount, nonce);
	}

	function cancel(isClose = true) {
		brows.storage.local.get(null, (data) => {
			unconfirmedTx = data.unconfirmedTx;
			unconfirmedTx.forEach((tx, index) => {
				if (tx.id == id) {
					unconfirmedTx.splice(index, 1);
				}
			});

			brows.storage.local.set({ ['unconfirmedTx']: unconfirmedTx }, () => {
				brows.runtime.sendMessage({ sendTxResult: { hash: null, id, tabId } });
				isClose && close();
			});
		});
	}

	function close() {
		brows.windows.getCurrent((window) => {
			brows.windows.remove(window.id);
		});
	}

	function reduction(value) {
		return value.slice(0, 6) + '....' + value.slice(-4);
	}

	function noExp(value) {
		const amount = getNoExpValue(value);
		const position = amount.toString().indexOf('.');
		if (position >= 0) {
			return (amount.toString().substr(0, position + 19)).replace(/0+$/, '');
		} else {
			return amount;
		}

		function getNoExpValue(value) {
			let data = String(value).split(/[eE]/);
			if (data.length == 1) return data[0];

			let z = '', sign = value < 0 ? '-' : '',
				str = data[0].replace('.', ''),
				mag = Number(data[1]) + 1;

			if (mag < 0) {
				z = sign + '0.';
				while (mag++) z += '0';
				return z + str.replace(/^\-/, '');
			}
			mag -= str.length;
			while (mag--) z += '0';
			return str + z;
		}
	}

    function feeCalculate(mnt = '0', gold = '0', token) {
        if (token.toUpperCase() === 'MNT') {
            return '0.02';
        }

        const BigInt = window['BigInt'];
        const _gold = BigInt ? toBigInt(gold.toString()) : +gold;
        const _mnt = BigInt ? toBigInt(mnt.toString()) : +mnt;
        let fee;

        const mnt10 = BigInt ? BigInt("10000000000000000000") : 10;
        const mnt1000 = BigInt ? BigInt("1000000000000000000000") : 1000;
        const mnt10000 = BigInt ? BigInt("10000000000000000000000") : 10000;
        const maxFeeFor10k = BigInt ? BigInt("2000000000000000") : 0.002;
        const minFee = BigInt ? BigInt("20000000000000") : 0.00002;

        if (_gold == 0) return '0';

        if (_mnt < mnt10) {
            fee = _gold / (BigInt ? BigInt(1000) : 1000); // 0.1%
        }
        else if (_mnt >= mnt10 && _mnt < mnt1000) {
            fee = (BigInt ? BigInt(3) : 3) * _gold / (BigInt ? BigInt(10000) : 10000); // 0.03%
        }
        else if (_mnt >= mnt1000 && _mnt < mnt10000) {
            fee = (BigInt ? BigInt(3) : 3) * _gold / (BigInt ? BigInt(100000) : 100000); // 0.003%
        }
        else if (_mnt >= mnt10000) {
            fee = (BigInt ? BigInt(3) : 3) * _gold / (BigInt ? BigInt(100000) : 100000); // 0.003%

            if (fee > maxFeeFor10k) {
                fee = maxFeeFor10k;
            }
        }

        if (fee < minFee) {
            fee = minFee;
        }

        return noExp(BigInt ? (+fee.toString() / Math.pow(10, 18)) : +fee);
    }

    function toBigInt(value) {
        let parts = value.toString().split('.');
        let result;

        if (parts.length > 1) {
            let rightPart = parts[1];
            for (let i = parts[1].length; i < 18; i++) {
                rightPart += '0';
            }
            result = parts[0] + rightPart.slice(0, 18);
        } else {
            let leftPart = parts[0];
            for (let i = 0; i < 18; i++) {
                leftPart += '0';
            }
            result = leftPart;
        }
        return window['BigInt'](result);
    }

	function chooseDomElement(id) {
		domElements[id] = document.getElementById(id);
	}

	function chooseDomElements(ids) {
		ids.forEach(id => {
			domElements[id] = document.getElementById(id);
		});
	}

	function disabledBtn() {
		domElements.btnConfirm.setAttribute("disabled", "disabled");
		domElements.btnClose.setAttribute("disabled", "disabled");
	}

	function enableBtn() {
		domElements.btnConfirm.removeAttribute("disabled");
		domElements.btnClose.removeAttribute("disabled");
	}

	function initCSS() {
		let style = document.createElement('style');
		style.type = 'text/css';
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}
}();
