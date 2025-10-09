import { Component } from '@angular/core';
import { InventoryService } from '../../../service/inventory-service';
import { SalesOrderDTO } from '../../../../../../common/dto/inventory/sales-order-dto';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductTypeDto } from '../../../../../../common/dto/inventory/productType-dto';
import { SalesOrderService } from '../service/sales-order-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-sales-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-sales-order.html',
  styleUrl: './create-sales-order.css',
})
export class CreateSalesOrder {
  salesOrderForm: FormGroup;
  productTypes: ProductTypeDto[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private salesOrderService: SalesOrderService,
    private router: Router
  ) {
    this.salesOrderForm = this.createForm();
  }

  ngOnInit() {
    this.loadProductTypes();
  }

  createForm(): FormGroup {
    return this.fb.group({
      saleDate: [new Date().toISOString().substring(0, 10), Validators.required],
      orderItems: this.fb.array([this.createOrderItemFormGroup()]),
    });
  }

  createOrderItemFormGroup(): FormGroup {
    return this.fb.group({
      productType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get orderItems(): FormArray {
    return this.salesOrderForm.get('orderItems') as FormArray;
  }

  loadProductTypes() {
    this.inventoryService.getAllProductTypes().subscribe({
      next: (response) => {
        this.productTypes = response;
      },
      error: (error) => {
        console.error('Error loading product types:', error);
      },
    });
  }

  addOrderItem() {
    this.orderItems.push(this.createOrderItemFormGroup());
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
  }

  onProductTypeChange(index: number) {
    const itemGroup = this.orderItems.at(index);
    const selectedProductType: ProductTypeDto = itemGroup.get('productType')?.value;

    if (selectedProductType) {
      itemGroup.patchValue({
        unitPrice: selectedProductType.sellUnitPrice || 0,
      });
    }
  }

  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    return item.quantity * item.unitPrice;
  }

  calculateGrandTotal(): number {
    return this.orderItems.controls.reduce((total, control, index) => {
      return total + this.calculateItemTotal(index);
    }, 0);
  }

  onSubmit() {
    if (this.salesOrderForm.valid) {
      this.isSubmitting = true;

      const formData = this.salesOrderForm.value;

      const salesOrder: SalesOrderDTO = {
        createdAt: new Date().toISOString(),
        saleDate: formData.saleDate,
        totalPrice: this.calculateGrandTotal(),
        orderItems: formData.orderItems.map((item: any) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          productType: {
            id: item.productType.id,
          },
          productName: item.productType.productName,
          size: item.productType.size,
        })),
      };

      this.salesOrderService.createSalesOrder(salesOrder).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.status === 200) {
            this.router.navigate(['/sales-orders'], {
              state: { message: 'Sales order created successfully' },
            });
          } else {
            console.error('Failed to create sales order:', response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating sales order:', error);
        },
      });
    } else {
      this.markFormGroupTouched(this.salesOrderForm);
    }
  }

  onCancel() {
    this.router.navigate(['/sales-orders']);
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      } else {
        control?.markAsTouched();
      }
    });
  }
}
