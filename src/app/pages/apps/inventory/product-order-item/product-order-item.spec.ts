import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOrderItem } from './product-order-item';

describe('ProductOrderItem', () => {
  let component: ProductOrderItem;
  let fixture: ComponentFixture<ProductOrderItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductOrderItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductOrderItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
