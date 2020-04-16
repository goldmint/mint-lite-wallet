import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './blocks/footer/footer.component';
import { AppRoutingModule } from "./app-routing.module";
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SpriteComponent } from './common/sprite/sprite.component';
import { ChromeStorageService } from "./services/chrome-storage.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GenerateWalletService } from "./services/generate-wallet.service";
import { AccountComponent } from './components/home/account/account.component';
import { CreateAccountComponent } from "./components/home/create-account/create-account.component";
import { AuthComponent } from './components/auth/auth.component';
import { CommonService } from "./services/common.service";
import { DetailsAccountComponent } from './components/home/details-account/details-account.component';
import { SumusTransactionService } from "./services/sumus-transaction.service";

import {
	ButtonsModule, ModalModule, TooltipModule
} from 'ngx-bootstrap';
import { ApiService } from "./services/api.service";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { MessageBoxService } from "./services/message-box.service";
import { MessageBoxComponent } from "./common/message-box/message-box.component";
import { APIHttpInterceptor } from "./common/interceptor/api-http.interceptor";
import { SendTokensComponent } from "./components/home/send-tokens/send-tokens.component";
import { MintAddressValidator, MintPrivateKeyValidator } from "./directives/base58.directive";
import { AccountReductionPipe } from "./pipes/account-reduction.pipe";
import { BackupComponent } from './components/home/backup/backup.component';
import { AuthGuard } from "./services/auth.guard";
import { NewWalletComponent } from './components/auth/new-wallet/new-wallet.component';
import { SubstrPipe } from "./pipes/substr.pipe";
import { NoexpPipe } from "./pipes/noexp.pipe";
import { FormatTokenAmount } from "./pipes/format-token-amount";
import { ConfirmTransactionComponent } from './components/auth/confirm-transaction/confirm-transaction.component';
import { PrivacyPolicyComponent } from './blocks/privacy-policy/privacy-policy.component';
import { ContentInjectorService } from './services/content-injector';
import { ApproveAddressComponent } from './components/home/approve-address/approve-address.component';
import { NewAddressComponent } from './blocks/new-address/new-address.component';
import { ImportAccountComponent } from './components/home/import-account/import-account.component';

@NgModule({
	declarations: [
		AppComponent,
		FooterComponent,
		HomeComponent,
		LoginComponent,
		SpriteComponent,
		AccountComponent,
		CreateAccountComponent,
		AuthComponent,
		DetailsAccountComponent,
		MessageBoxComponent,
		SendTokensComponent,
		MintAddressValidator,
		MintPrivateKeyValidator,
		AccountReductionPipe,
		SubstrPipe,
		NoexpPipe,
		FormatTokenAmount,
		BackupComponent,
		NewWalletComponent,
		ConfirmTransactionComponent,
		PrivacyPolicyComponent,
		ApproveAddressComponent,
		NewAddressComponent,
		ImportAccountComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		AppRoutingModule,
		ButtonsModule.forRoot(),
		TooltipModule.forRoot(),
		ModalModule.forRoot()
	],
	providers: [
		ContentInjectorService,
		ChromeStorageService,
		GenerateWalletService,
		SumusTransactionService,
		CommonService,
		ApiService,
		MessageBoxService,
		{
			provide: HTTP_INTERCEPTORS,
			useClass: APIHttpInterceptor,
			multi: true
		},
		AuthGuard
	],
	entryComponents: [
		MessageBoxComponent
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
