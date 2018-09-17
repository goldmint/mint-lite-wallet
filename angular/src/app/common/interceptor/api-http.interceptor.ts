import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import {Observable} from "rxjs/index";
import {catchError} from "rxjs/internal/operators";
import {MessageBoxService} from "../../services/message-box.service";

@Injectable()
export class APIHttpInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(request)
      .pipe(
        catchError(
          (error: any, caught: Observable<HttpEvent<any>>) => {
            throw error;
          }
        )
      );
  }

}
