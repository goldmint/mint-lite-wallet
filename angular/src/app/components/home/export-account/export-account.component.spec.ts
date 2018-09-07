import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportAccountComponent } from './export-account.component';

describe('ExportAccountComponent', () => {
  let component: ExportAccountComponent;
  let fixture: ComponentFixture<ExportAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
