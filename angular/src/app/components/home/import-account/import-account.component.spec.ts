import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAccountComponent } from './import-account.component';

describe('ImportAccountComponent', () => {
  let component: ImportAccountComponent;
  let fixture: ComponentFixture<ImportAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
