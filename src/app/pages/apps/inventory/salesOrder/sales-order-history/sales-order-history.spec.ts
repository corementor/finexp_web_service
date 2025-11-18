import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderHistory } from './sales-order-history';

describe('SalesOrderHistory', () => {
  let component: SalesOrderHistory;
  let fixture: ComponentFixture<SalesOrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesOrderHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
