import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSalesOrder } from './view-sales-order';

describe('ViewSalesOrder', () => {
  let component: ViewSalesOrder;
  let fixture: ComponentFixture<ViewSalesOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSalesOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewSalesOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
