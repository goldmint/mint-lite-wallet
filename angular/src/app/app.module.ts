import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './blocks/footer/footer.component';
import {AppRoutingModule} from "./app-routing.module";
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { SpriteComponent } from './common/sprite/sprite.component';
import {ChromeStorageService} from "./services/chrome-storage.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GenerateWalletService} from "./services/generate-wallet.service";
import { AccountComponent } from './components/home/account/account.component';
import {NewAccountComponent} from "./components/home/new-account/new-account.component";
import { CreateWalletComponent } from './components/auth/create-wallet/create-wallet.component';
import { AuthComponent } from './components/auth/auth.component';
import {DetectChangesDirective} from "./directives/detect-changes.directive";
import {CommonService} from "./services/common.service";
import { DetailsAccountComponent } from './components/home/details-account/details-account.component';

import {
  ButtonsModule
} from 'ngx-bootstrap';
import { ExportAccountComponent } from './components/home/export-account/export-account.component';
import {ApiService} from "./services/api.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent,
    SpriteComponent,
    AccountComponent,
    NewAccountComponent,
    CreateWalletComponent,
    AuthComponent,
    DetectChangesDirective,
    DetailsAccountComponent,
    ExportAccountComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    ButtonsModule.forRoot()
  ],
  providers: [
    ChromeStorageService,
    GenerateWalletService,
    CommonService,
    ApiService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
