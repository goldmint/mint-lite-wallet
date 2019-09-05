import {Component, EventEmitter, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

  @Output() accept = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  acceptPolicy() {
    this.accept.emit(true);
  }

}
