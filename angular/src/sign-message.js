'use strict';

!function () {
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
        .confirm-container {
            margin: 1rem;
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
        #sourceIconBlock {
            display: none;
            text-align: center;
            margin-right: 5px;
        }
        .source-block {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .source-host {
            text-align: center;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .confirm-text {
            text-align: center;
            font-size: 13px;
            line-height: 1.4;
        }
        .attention-text {
            text-align: center;
            font-size: 13px;
            line-height: 1.4;
        }
        .attention-text b {
            color: #fa3c00;
        }
        .icon-gold {
            color: #e9cb6b;
            fill: #e9cb6b;
        }
        .button-block {
            display: flex;
            margin-top: 1.5rem;
            justify-content: center;
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
        .btn-primary.disabled, .btn-primary:disabled {
            color: #212529;
            background-color: #e9cb6b;
            border-color: #e9cb6b;
            cursor: not-allowed;
        }
        .btn.disabled, .btn:disabled {
            opacity: .65;
        }
        .message-block {
          border-bottom: 2px solid #e9cb6b;
        }
        .message-details {
          max-height: 151px;
          overflow: auto;
          min-height: 151px;
        }
        .message-view-btn {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          text-align: right;
          margin: 5px 0;
          font-size: 14px;
          color: darkgrey;
        }
        .btn-text, .btn-hex {
          background: transparent;
          border: 2px solid #cfcfcf;
          outline: none;
          cursor: pointer;
        }
        .message-block.text .btn-text {
          background: rgba(171, 171, 171, 0.3);
        }
        .message-block.text .message-text {
          display: block;
        }
        .message-block.text .message-hex {
          display: none;
        }
        .message-block.text .btn-hex {
          background: transparent;
        }
        .message-block.hex .btn-hex {
          background: rgba(171, 171, 171, 0.3);
        }
        .message-block.hex .message-hex {
          display: block;
        }
        .message-block.hex .message-text {
          display: none;
        }
        .message-block.hex .btn-text {
          background: transparent;
        }
    `
	let queryParams = {};
	window.location.search.replace(/^\?/, '').split('&').forEach(item => {
		let param = item.split('=');
		queryParams[decodeURIComponent(param[0])] = param.length > 1 ? decodeURIComponent(param[1]) : '';
	});

	let isFirefox = typeof InstallTrigger !== 'undefined',
		brows = isFirefox ? browser : chrome,
		accountName,
		publicKey,
		id = queryParams.id,
		tabId = queryParams.tabId,
		identify,
		messages,
		currentMessage,
		wallets,
		domElements = {};

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
			'sourceHost',
			'sourceIconBlock',
			'sourceIcon',
			'messageLength',
			'btnClose',
			'btnConfirm',
			'messageBlock',
			'btnText',
			'btnHex',
			'messageText',
			'messageHex',
			'accountName'
		]);

		domElements.btnClose.addEventListener('click', cancel);
		domElements.btnConfirm.addEventListener('click', sign);
		domElements.btnText.addEventListener('click', displayTextMessage);
		domElements.btnHex.addEventListener('click', displayHexMessage);
	}

    function actions(request) {
        if (request.identifier) {
            identify = request.identifier;
            getMessage();
        }

        if (request.hasOwnProperty('getSignedMessage')) {
            try {
                const message = request.getSignedMessage;

                brows.storage.local.get(null, (data) => {
                    messages = data.messagesForSign;
                    messages.forEach((message, index) => {
                        if (message.id == id) messages.splice(index, 1);
                    });

                    brows.storage.local.set({ ['messagesForSign']: messages }, () => {
                        brows.runtime.sendMessage({ sendSignResult: { result: message, id, tabId } });
                        close();
                    });
                });
            } catch (e) {
                cancel();
            }
        }
    }

	function buf2hex(buffer) {
		return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
	}

	function getMessage() {
		brows.storage.local.get(null, data => {
			messages = data.messagesForSign;
			wallets = data.wallets;

			messages.forEach(message => {
				if (message.id == id) {
					currentMessage = message;

					let bytes = [];
					for (let key in currentMessage.bytes) {
						bytes.push(currentMessage.bytes[key]);
					}

					if (bytes && bytes.length) {
						currentMessage.utf8 = new TextDecoder('utf-8').decode(new Uint8Array(bytes));

						const buffer = new Uint8Array(bytes).buffer;
						currentMessage.hex = '0x' + buf2hex(buffer);

						domElements.messageText.textContent = currentMessage.utf8;
						domElements.messageHex.textContent = currentMessage.hex;
					}

					for (let i = 0; i < wallets.length; i++) {
						if (wallets[i].publicKey === message.publicKey) {
							publicKey = wallets[i].publicKey;
							accountName = wallets[i].name;
							break;
						}
					}

					domElements.sourceHost.textContent = message.host;
					domElements.messageLength.textContent = bytes ? bytes.length : 0;
					domElements.accountName.textContent = accountName || '';

					if (message.iconUrl) {
						domElements.sourceIconBlock.style.display = 'block';
						domElements.sourceIcon.setAttribute('src', message.iconUrl);
					}

					displayTextMessage();
				}
			});
		});
	}

	function sign() {
        brows.runtime.sendMessage({ getSignedMessage: { publicKey, bytesObject: currentMessage.bytes } });
	}

	function cancel() {
		brows.storage.local.get(null, (data) => {
			messages = data.messagesForSign;
			messages.forEach((message, index) => {
				if (message.id == id) messages.splice(index, 1);
			});

			brows.storage.local.set({ ['messagesForSign']: messages }, () => {
				brows.runtime.sendMessage({ sendSignResult: { result: null, id, tabId } });
				close();
			});
		});
	}

	function close() {
		brows.windows.getCurrent((window) => {
			brows.windows.remove(window.id);
		});
	}

	function displayTextMessage() {
		domElements.messageBlock.classList.remove('hex');
		domElements.messageBlock.classList.add('text');
	}

	function displayHexMessage() {
		domElements.messageBlock.classList.remove('text');
		domElements.messageBlock.classList.add('hex');
	}

	function chooseDomElement(id) {
		domElements[id] = document.getElementById(id);
	}

	function chooseDomElements(ids) {
		ids.forEach(id => {
			domElements[id] = document.getElementById(id);
		});
	}

	function initCSS() {
		let style = document.createElement('style');
		style.appendChild(document.createTextNode(css));
		document.head.appendChild(style);
	}

}();
