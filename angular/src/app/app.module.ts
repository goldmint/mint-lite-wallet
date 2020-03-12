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
import { NewAccountComponent } from "./components/home/new-account/new-account.component";
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
import { SumusAddressValidator } from "./directives/check-sumus.directive";
import { AccountReductionPipe } from "./pipes/account-reduction.pipe";
import { BackupComponent } from './components/home/backup/backup.component';
import { AuthGuard } from "./services/auth.guard";
import { NewWalletComponent } from './components/auth/new-wallet/new-wallet.component';
import { SubstrPipe } from "./pipes/substr.pipe";
import { NoexpPipe } from "./pipes/noexp.pipe";
import { ReplaceZero } from "./pipes/replace-zero";
import { ConfirmTransactionComponent } from './components/auth/confirm-transaction/confirm-transaction.component';
import { PrivacyPolicyComponent } from './blocks/privacy-policy/privacy-policy.component';
import { ContentInjectorService } from './services/content-injector';

@NgModule({
	declarations: [
		AppComponent,
		FooterComponent,
		HomeComponent,
		LoginComponent,
		SpriteComponent,
		AccountComponent,
		NewAccountComponent,
		AuthComponent,
		DetailsAccountComponent,
		MessageBoxComponent,
		SendTokensComponent,
		SumusAddressValidator,
		AccountReductionPipe,
		SubstrPipe,
		NoexpPipe,
		ReplaceZero,
		BackupComponent,
		NewWalletComponent,
		ConfirmTransactionComponent,
		PrivacyPolicyComponent
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
