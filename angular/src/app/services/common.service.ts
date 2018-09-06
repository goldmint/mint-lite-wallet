import { Injectable } from '@angular/core';
import {Subject} from "rxjs/index";

@Injectable()
export class CommonService {

  public chooseAccount$ = new Subject();

  constructor() { }
}
