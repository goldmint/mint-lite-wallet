import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/auth/login/login.component";
import {AccountComponent} from "./components/home/account/account.component";
import {NewAccountComponent} from "./components/home/new-account/new-account.component";
import {AuthComponent} from "./components/auth/auth.component";
import {DetailsAccountComponent} from "./components/home/details-account/details-account.component";
import {ExportAccountComponent} from "./components/home/export-account/export-account.component";
import {SendTokensComponent} from "./components/home/send-tokens/send-tokens.component";

const routes: Routes = [
  {
    path: '', component: AuthComponent, children: [
      { path: 'login', component: LoginComponent },
      { path: 'new-account/:id', component: NewAccountComponent },
    ]
  },
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'account', component: AccountComponent },
      { path: 'new-account/:id', component: NewAccountComponent },
      { path: 'account-details', component: DetailsAccountComponent },
      { path: 'export-account', component: ExportAccountComponent },
      { path: 'send-tokens/:id', component: SendTokensComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
