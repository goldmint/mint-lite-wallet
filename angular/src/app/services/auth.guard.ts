import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import {CommonService} from "./common.service";

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private commonService: CommonService) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.commonService.isLoggedIn) {
        return true;
      } else {
        return false;
      }
  }
}
