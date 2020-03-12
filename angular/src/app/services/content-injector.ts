import { Injectable } from '@angular/core';

@Injectable()
export class ContentInjectorService {

	private chrome = window['chrome'];

	constructor() { }

	async offerInjection():Promise<boolean> {
		let origin = await this.currentOrigin();
		if (origin == null) return false;

		let ok = await this.checkPermission(['activeTab'], origin);
		if (!ok) {
			let ok = await this.requirePermission(['activeTab'], origin);
			if (!ok) return false;
		}

		this.chrome.runtime.sendMessage({ injectContent: true });
		return true;
	}

	currentOrigin(): Promise<string | null> {
		return new Promise<string | null>((resolve, reject) => {
			try {
				this.chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
					if (tabs.length == 0 || !tabs[0].url) {
						resolve(null);
						return;
					}
					let url = new URL(tabs[0].url);
					if (!url.protocol.startsWith('http')) {
						resolve(null);
						return;
					}
					resolve(tabs[0].url);
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	checkPermission(perms: string[], origin: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			try {
				this.chrome.permissions.contains({
					permissions: perms,
					origins: [origin]
				}, function (ok) {
					resolve(ok);
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	requirePermission(perms: string[], origin: string): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			try {
				this.chrome.permissions.request({
					permissions: perms,
					origins: [origin]
				}, function (ok) {
					resolve(ok);
				});
			} catch (e) {
				reject(e);
			}
		});
	}
}
