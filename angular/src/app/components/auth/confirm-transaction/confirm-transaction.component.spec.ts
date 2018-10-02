import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmTransactionComponent } from './confirm-transaction.component';

describe('ConfirmTransactionComponent', () => {
  let component: ConfirmTransactionComponent;
  let fixture: ComponentFixture<ConfirmTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
