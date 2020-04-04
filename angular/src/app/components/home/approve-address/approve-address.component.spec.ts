import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveAddressComponent } from './approve-address.component';

describe('ApproveAddressComponent', () => {
  let component: ApproveAddressComponent;
  let fixture: ComponentFixture<ApproveAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
