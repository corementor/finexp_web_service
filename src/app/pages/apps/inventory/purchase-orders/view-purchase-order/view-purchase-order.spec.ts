import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPurchaseOrder } from './view-purchase-order';

describe('ViewPurchaseOrder', () => {
  let component: ViewPurchaseOrder;
  let fixture: ComponentFixture<ViewPurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPurchaseOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPurchaseOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
