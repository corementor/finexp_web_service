import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderList } from './purchase-order-list';

describe('PurchaseOrderList', () => {
  let component: PurchaseOrderList;
  let fixture: ComponentFixture<PurchaseOrderList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrderList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseOrderList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
