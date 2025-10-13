import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSalesOrder } from './list-sales-order';

describe('ListSalesOrder', () => {
  let component: ListSalesOrder;
  let fixture: ComponentFixture<ListSalesOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSalesOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSalesOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
