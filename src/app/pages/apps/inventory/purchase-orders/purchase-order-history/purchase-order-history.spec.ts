import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderHistory } from './purchase-order-history';

describe('PurchaseOrderHistory', () => {
  let component: PurchaseOrderHistory;
  let fixture: ComponentFixture<PurchaseOrderHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderHistory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
