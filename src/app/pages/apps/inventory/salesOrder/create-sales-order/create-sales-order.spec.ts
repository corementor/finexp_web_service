import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSalesOrder } from './create-sales-order';

describe('CreateSalesOrder', () => {
  let component: CreateSalesOrder;
  let fixture: ComponentFixture<CreateSalesOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSalesOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSalesOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
