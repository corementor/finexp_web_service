import { Component } from '@angular/core';
import { InventoryService } from '../../service/inventory-service';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';
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
      taxAmount: [0, [Validators.required, Validators.min(0)]], // Changed from taxRate to taxAmount
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
        unitPrice: selectedProductType.unitPrice || 0,
        taxAmount: 0, // Reset tax amount when product changes
      });
    }
  }

  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    const subtotal = item.quantity * item.unitPrice;
    const taxAmount = item.taxAmount || 0;
    return subtotal + taxAmount;
  }

  calculateItemSubtotal(index: number): number {
    const item = this.orderItems.at(index).value;
    return item.quantity * item.unitPrice;
  }

  calculateGrandTotal(): number {
    return this.orderItems.controls.reduce((total, control, index) => {
      return total + this.calculateItemTotal(index);
    }, 0);
  }

  onSubmit() {
    if (this.purchaseOrderForm.valid) {
      this.isSubmitting = true;

      const formData = this.purchaseOrderForm.value;

      // Create the purchase order with proper structure
      const purchaseOrder: PurchaseOrderDto = {
        createdAt: new Date().toISOString(),
        purchaseDate: formData.purchaseDate,
        totalPrice: this.calculateGrandTotal(),
        orderItems: formData.orderItems.map((item: any) => {
          const subtotal = item.quantity * item.unitPrice;
          const taxAmount = item.taxAmount || 0;
          const totalWithTax = subtotal + taxAmount;

          return {
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxAmount: taxAmount, // This is the actual tax amount, not rate
            totalTax: taxAmount, // totalTax should be the same as taxAmount
            totalPriceWithTax: totalWithTax,
            productType: {
              id: item.productType.id, // Only send the ID for the relationship
            },
            productName: item.productType.productName,
            size: item.productType.size,
          };
        }),
      };

      console.log('Sending purchase order:', purchaseOrder); // For debugging

      this.purchaseOrderService.createPurchaseOrder(purchaseOrder).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            // Navigate to purchase orders list or show success message
            this.router.navigate(['/purchase-orders'], {
              state: { message: 'Purchase order created successfully' },
            });
          } else {
            console.error('Failed to create purchase order:', response.message);
            // Show error message to user
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating purchase order:', error);
          // Show error message to user
        },
      });
    } else {
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
