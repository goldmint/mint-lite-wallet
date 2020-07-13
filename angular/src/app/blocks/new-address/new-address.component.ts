import { Component, OnInit, EventEmitter, Output, ChangeDetectorRef, Input } from '@angular/core';
import { ChromeStorageService } from 'src/app/services/chrome-storage.service';
import { GenerateWalletService, GeneratedAddress } from 'src/app/services/generate-wallet.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from 'src/app/services/common.service';
import { Wallet } from 'src/app/interfaces/wallet';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-new-address',
  templateUrl: './new-address.component.html',
  styleUrls: ['./new-address.component.scss']
})
export class NewAddressComponent implements OnInit {

  @Input('identity') optionalIdentity: string;

  @Output() completed = new EventEmitter();
  @Output() cancelled = new EventEmitter();

  currentTab: string = '';
  copied: boolean = false;
  printURL: string = '';

  accountName: string = 'Account 1';
  seedPhrase: string = '';
  extraWord: string = '';
  newPair: GeneratedAddress = null;

  private chrome = window['chrome'];
  private identify: string;
  private wallets: Wallet[] = [];

  constructor(
    private chromeStorage: ChromeStorageService,
    private generateWallet: GenerateWalletService,
    private router: Router,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private commonService: CommonService
  ) { }

  async ngOnInit() {
    if (this.optionalIdentity) {
      this.identify = this.optionalIdentity;
    } else {
      this.chrome.runtime.getBackgroundPage(page => {
        this.identify = page.sessionStorage.identify;
      });
    }

    this.chrome.storage.local.get(null, (result) => {
      if (result.wallets) {
        this.wallets = result.wallets;
        this.accountName = 'Account ' + (this.wallets.length + 1);
      }
      this.ref.detectChanges();
    });

    this.seedPhrase = await this.generateWallet.generateSeedPhrase();
    this.currentTab = 'seedPhrase';
  }

  changeTab(tab: string) {
    this.currentTab = tab;
    this.ref.detectChanges();
  }

  copySeedPhrase() {
    this.commonService.copyText(this.seedPhrase);
    this.copied = true;
    this.ref.detectChanges();
  }

  async generate() {
    this.newPair = await this.generateWallet.recoverPrivateKey(this.seedPhrase, this.extraWord);
    this.changeTab('generate');
  }

  print() {
    this.complete();

    this.printURL = "data:text/html," + encodeURIComponent(
      this.printerTemplate
        .replace("{{publicKey}}", this.newPair.publicKey)
        .replace("{{publicKey}}", this.newPair.publicKey)
        .replace("{{privateKey}}", this.newPair.privateKey)
        .replace("{{seedPhrase}}", this.seedPhrase)
        .replace("{{extraWord}}", this.extraWord ? this.extraWord : "<u>none</u>")
    );
    this.chrome.tabs.create({ url: this.printURL }, () => { });
  }

  // ---

  async complete() {

    // ensure doesn't exist yet
    const publicKey = await this.generateWallet.getPublicKeyFromPrivate(this.newPair.privateKey);
    let isMatch = false;
    this.wallets.forEach(wallet => {
      wallet.publicKey === publicKey && (isMatch = true);
    });
    if (isMatch) {
      return;
    }

    // encrypt
    const encryptedKey = CryptoJS.AES.encrypt(this.newPair.privateKey, this.identify).toString();
    this.wallets.push({
      id: this.wallets.length + 1,
      name: this.accountName,
      publicKey: this.newPair.publicKey,
      privateKey: encryptedKey,
    });

    // store
    this.chromeStorage.save('wallets', this.wallets);
    this.chromeStorage.save('currentWallet', this.wallets.length - 1);

    // complete
    this.completed.emit(this.newPair.publicKey);
  }

  cancel() {
    this.cancelled.emit();
  }

  private printerTemplate =
    `
<!doctype html>
<html>

<head>
	<style>
		body {
			padding: 0;
			margin: 0;
		}
		@media print {
			body{
				width: 21cm;
				height: 29.7cm;
				/*margin: 30mm 45mm 30mm 45mm; */
			}
		}
		.row { display: flex; flex-direction: row; }
		.col { display: flex; flex-direction: column; }
		.text-center { text-align: center; }
		.mono { font-family: monospace; }
		.ml-1 { margin-left: 5pt; }
		.ml-2 { margin-left: 10pt; }
		.mr-2 { margin-right: 10pt; }
		.mt-1 { margin-top: 5pt; }
		.mt-2 { margin-top: 10pt; }
		.mt-4 { margin-top: 20pt; }
		.mb-4 { margin-bottom: 20pt; }

		.backup {
			font-size: 10pt;
			font-family: sans-serif;
			letter-spacing: 0.5pt;
			border: 2pt dashed #aaa;
			width: 100%;
		}
		.blockchain-col {
			width: 25pt; 
			min-width: 25pt; 
			border-right: 1pt solid #aaa;
			align-items: center;
		}
		.blockchain {
			transform: rotate(270deg) translateY(2pt) translateX(-70pt);
			position: absolute;
			color: #666;
			letter-spacing: 1pt;
		}
		.qr {
			width: 160pt;
			height: 160pt;
		}
		.long {
			word-break: break-all;
		}
	</style>
</head>

<body>
	<div class="row backup">
		<div class="col blockchain-col">
			<div class="blockchain">Mint Blockchain</div>
		</div>
		<div class="col">
			<div><img onload="window.print()" class="qr" src="https://chart.googleapis.com/chart?cht=qr&chs=180x180&chld=M&chl={{publicKey}}" /></div>
		</div>
		<div class="col ml-1 mt-4 mb-4 mr-2">
			<div class=""><b>Address:</b></div>
			<div class="long mono">{{publicKey}}</div>

			<div class="mt-1"><b>Private Key:</b></div>
			<div class="long mono">{{privateKey}}</div>
			
			<div class="mt-1"><b>Seed phrase:</b></div>
			<div class="mono">{{seedPhrase}}</div>
			
			<div class="mt-1"><b>Extra word:</b></div>
			<div class="long mono">{{extraWord}}</div>
		</div>
	</div>
</body>

</html>
`;
}
