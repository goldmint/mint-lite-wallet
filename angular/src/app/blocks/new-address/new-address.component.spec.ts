import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAddressComponent } from './new-address.component';

describe('NewAddressComponent', () => {
  let component: NewAddressComponent;
  let fixture: ComponentFixture<NewAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
