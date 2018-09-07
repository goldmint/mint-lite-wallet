import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/auth/login/login.component";
import {AccountComponent} from "./components/home/account/account.component";
import {NewAccountComponent} from "./components/home/new-account/new-account.component";
import {AuthComponent} from "./components/auth/auth.component";
import {CreateWalletComponent} from "./components/auth/create-wallet/create-wallet.component";
import {DetailsAccountComponent} from "./components/home/details-account/details-account.component";
import {ExportAccountComponent} from "./components/home/export-account/export-account.component";

const routes: Routes = [
  {
    path: '', component: AuthComponent, children: [
      { path: 'login', component: LoginComponent },
      { path: 'create-wallet', component: CreateWalletComponent },
    ]
  },
  {
    path: 'home', component: HomeComponent, children: [
      { path: 'account', component: AccountComponent },
      { path: 'new-account/:id', component: NewAccountComponent },
      { path: 'account-details', component: DetailsAccountComponent },
      { path: 'export-account', component: ExportAccountComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
