import { Component, OnInit } from '@angular/core';
import {CommonService} from "../../services/common.service";

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public year = new Date().getFullYear();
  public version: string = '';

  constructor(
    private commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.getManifest().subscribe((data: any) => {
      this.version = data ? data.version : '';
    });
  }

}
