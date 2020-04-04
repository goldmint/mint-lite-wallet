import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

@Component({
    selector: 'app-approve-address',
    templateUrl: './approve-address.component.html',
    styleUrls: ['./approve-address.component.scss']
})
export class ApproveAddressComponent implements OnInit {

    public wallet: string;

    private chrome = window['chrome'];

    constructor(
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.chrome.storage.local.get(null, (result) => {
            this.wallet = result.wallets[result.currentWallet].publicKey;
            this.ref.detectChanges();
        });
    }
}
