import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'modal-content',
  templateUrl: './message-box.component.html'
})
export class MessageBoxComponent {

  public message: string

  constructor(private bsModalRef: BsModalRef) { }

  public hide() {
    this.bsModalRef.hide();
  }
}
