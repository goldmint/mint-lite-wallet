import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FooterComponent } from './blocks/footer/footer.component';
import {AppRoutingModule} from "./app-routing.module";
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SpriteComponent } from './common/sprite/sprite.component';
import {ChromeStorageService} from "./services/chrome-storage.service";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GenerateWalletService} from "./services/generate-wallet.service";
import { AccountComponent } from './components/account/account.component';
import {NewAccountComponent} from "./components/new-account/new-account.component";
import { CreateWalletComponent } from './components/create-wallet/create-wallet.component';
import { AuthComponent } from './components/auth/auth.component';
import {DetectChangesDirective} from "./directives/detect-changes.directive";
import {CommonService} from "./services/common.service";

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
    DetectChangesDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    ChromeStorageService,
    GenerateWalletService,
    CommonService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
