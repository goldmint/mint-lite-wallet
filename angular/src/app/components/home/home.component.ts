import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ChromeStorageService } from "../../services/chrome-storage.service";
import { Router } from "@angular/router";
import { CommonService } from "../../services/common.service";
import { StorageData } from "../../interfaces/storage-data";
import { Subscription } from "rxjs/index";
import { ApiService } from "../../services/api.service";

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

	public isOpenSettingModal: boolean = false;
	public storageData: StorageData;
	public selectedAccount: number;
	public selectedNetwork: string;

	private chrome = window['chrome'];
	private sub1: Subscription;
	private sub2: Subscription;

	constructor(
		private apiService: ApiService,
		private chromeStorage: ChromeStorageService,
		private commonService: CommonService,
		private router: Router,
		private ref: ChangeDetectorRef
	) { }

	ngOnInit() {
		this.getStorageData();

		this.sub1 = this.commonService.chooseAccount$.subscribe(() => {
			this.getStorageData();
		});
		this.sub2 = this.apiService.getCurrentNetwork.subscribe((network: any) => {
			this.selectedNetwork = network || 'main';
		});
	}

	getStorageData() {
		this.chrome.storage.local.get(null, (result:StorageData) => {
			this.storageData = result;
			this.selectedAccount = this.storageData.currentWallet;
			this.selectedNetwork = result.currentNetwork || 'main';
			this.ref.detectChanges();
		});
	}

	openSettingModal() {
		this.isOpenSettingModal = !this.isOpenSettingModal;
		this.getStorageData();
	}

	chooseAccount() {
		this.chromeStorage.save('currentWallet', this.selectedAccount);
		this.commonService.chooseAccount$.next(true);
		this.ref.detectChanges();
	}

	chooseNetwork() {
		this.apiService.currentNetwork = this.selectedNetwork;
		this.apiService.getCurrentNetwork.next(this.selectedNetwork);
		this.commonService.chooseAccount$.next(true);
		this.isOpenSettingModal = false;
		this.router.navigate(['/home/account']);
		this.ref.detectChanges();
	}

	goToAccountDetails() {
		this.router.navigate(['/home/account-details']);
		this.isOpenSettingModal = false;
		this.ref.detectChanges();
	}

	createAccount() {
		this.router.navigate(['/home/create-account']);
		this.isOpenSettingModal = false;
		this.ref.detectChanges();
	}

	goToImportAccount() {
		this.router.navigate(['/home/import-account']);
		this.isOpenSettingModal = false;
		this.ref.detectChanges();
	}

	goToBackup() {
		this.router.navigate(['/home/backup']);
		this.isOpenSettingModal = false;
		this.ref.detectChanges();
	}

	logOut() {
		this.chrome.runtime.sendMessage({ logout: true });
		this.commonService.isLoggedIn = false;
		setTimeout(() => {
			this.router.navigate(['/login'])
		}, 200);
	}

	getItem() {
		this.chromeStorage.load(null);
	}

	clearStorage() {
		this.chromeStorage.clear();
	}

	ngOnDestroy() {
		this.sub1 && this.sub1.unsubscribe();
		this.sub2 && this.sub2.unsubscribe();
	}

}
