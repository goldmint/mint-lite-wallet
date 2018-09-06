import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {HomeComponent} from "./components/home/home.component";
import {LoginComponent} from "./components/login/login.component";
import {AccountComponent} from "./components/account/account.component";
import {NewAccountComponent} from "./components/new-account/new-account.component";
import {AuthComponent} from "./components/auth/auth.component";
import {CreateWalletComponent} from "./components/create-wallet/create-wallet.component";

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
      { path: 'new-account', component: NewAccountComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
