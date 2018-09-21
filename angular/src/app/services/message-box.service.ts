import { Injectable } from '@angular/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import {MessageBoxComponent} from "../common/message-box/message-box.component";

@Injectable()
export class MessageBoxService {

  bsModalRef: BsModalRef;

  constructor(private modalService: BsModalService) {}

  alert(message: string) {
    const initialState = {
      message: message
    };

    this.bsModalRef = this.modalService.show(MessageBoxComponent, { initialState });
  }
}
