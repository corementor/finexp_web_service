import { Component } from '@angular/core';
import { InventoryService } from '../../service/inventory-service';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-create-purchase-order',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-purchase-order.html',
  styleUrl: './create-purchase-order.css',
})
export class CreatePurchaseOrder {
  purchaseOrderForm: FormGroup;
  productTypes: ProductTypeDto[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private purchaseOrderService: PurchaseOrderService,
    private router: Router
  ) {
    this.purchaseOrderForm = this.createForm();
  }

  ngOnInit() {
    this.loadProductTypes();
  }

  createForm(): FormGroup {
    return this.fb.group({
      purchaseDate: [new Date().toISOString().substring(0, 10), Validators.required],
      orderItems: this.fb.array([this.createOrderItemFormGroup()]),
    });
  }

  createOrderItemFormGroup(): FormGroup {
    return this.fb.group({
      productType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    });
  }

  get orderItems(): FormArray {
    return this.purchaseOrderForm.get('orderItems') as FormArray;
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
        unitPrice: selectedProductType.unitPrice,
        taxRate: 0, // Default tax rate
      });
    }
  }

  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    const total = item.quantity * item.unitPrice;
    const tax = total * (item.taxRate / 100);
    return total + tax;
  }

  calculateGrandTotal(): number {
    return this.orderItems.controls.reduce((total, control) => {
      return total + this.calculateItemTotal(this.orderItems.controls.indexOf(control));
    }, 0);
  }

  onSubmit() {
    if (this.purchaseOrderForm.valid) {
      this.isSubmitting = true;

      const formData = this.purchaseOrderForm.value;
      const purchaseOrder: PurchaseOrderDto = {
        purchaseDate: formData.purchaseDate,
        createdAt: new Date().toISOString(),

        totalPrice: this.calculateGrandTotal(),
        orderItems: formData.orderItems.map((item: any) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          productType: item.productType,
          productName: item.productType.productName,
          size: item.productType.size,
          totalTax: item.quantity * item.unitPrice * (item.taxRate / 100),
          totalPriceWithTax: this.calculateItemTotal(
            this.orderItems.controls.findIndex((ctrl) => ctrl.value === item)
          ),
        })),
      };

      this.purchaseOrderService.createPurchaseOrder(purchaseOrder).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          // Handle success - show message, redirect, etc.
          console.log('Purchase order created successfully:', response);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating purchase order:', error);
        },
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.purchaseOrderForm);
    }
  }
  onCancel() {
    this.router.navigate(['/purchase-orders']);
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
