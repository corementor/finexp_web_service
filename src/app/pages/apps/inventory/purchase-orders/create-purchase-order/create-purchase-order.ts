import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { InventoryService } from '../../service/inventory-service';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { ToasterService } from '../../../../../services/toaster.service';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
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

  showDuplicateModal = false;
  duplicateProductInfo: {
    productName: string;
    existingIndex: number;
    newIndex: number;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private purchaseOrderService: PurchaseOrderService,
    private router: Router,
    private toaster: ToasterService
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
      taxAmount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  get orderItems(): FormArray {
    return this.purchaseOrderForm.get('orderItems') as FormArray;
  }

  loadProductTypes() {
    this.inventoryService.getAllProductTypes().subscribe({
      next: (response) => {
        this.productTypes = response;
        this.toaster.success('Product Types', 'Loaded successfully');
      },
      error: (error) => {
        console.error('Error loading product types:', error);
        this.toaster.error('Product Types', 'Failed to load product types');
      },
    });
  }

  addOrderItem() {
    this.orderItems.push(this.createOrderItemFormGroup());
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
    this.toaster.info('Order Item', 'Item removed from order');
  }
  onProductTypeChange(index: number) {
    const itemGroup = this.orderItems.at(index);
    const selectedProductType: ProductTypeDto = itemGroup.get('productType')?.value;

    if (selectedProductType) {
      // Check for duplicates
      const duplicateIndex = this.checkForDuplicateProduct(selectedProductType.id!, index);

      if (duplicateIndex !== -1) {
        // Duplicate found - show modal and clear selection
        this.duplicateProductInfo = {
          productName: selectedProductType.productName || 'Unknown Product',
          existingIndex: duplicateIndex,
          newIndex: index,
        };
        this.showDuplicateModal = true;

        // Clear the duplicate selection immediately
        itemGroup.patchValue({
          productType: null,
          unitPrice: 0,
          taxAmount: 0,
        });

        // Show error toast
        this.toaster.error(
          'Duplicate Product Not Allowed',
          `${selectedProductType.productName} is already added at row ${
            duplicateIndex + 1
          }. Please select a different product.`
        );
      } else {
        // No duplicate, proceed with auto-fill
        itemGroup.patchValue({
          unitPrice: selectedProductType.unitPrice || 0,
          taxAmount: 0,
        });
      }
    }
  }

  checkForDuplicateProduct(productTypeId: string, currentIndex: number): number {
    for (let i = 0; i < this.orderItems.length; i++) {
      if (i !== currentIndex) {
        const item = this.orderItems.at(i);
        const productType = item.get('productType')?.value;

        if (productType && productType.id === productTypeId) {
          return i; // Return the index of the duplicate
        }
      }
    }
    return -1; // No duplicate found
  }

  closeDuplicateModal() {
    this.showDuplicateModal = false;
    this.duplicateProductInfo = null;
  }
  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    const subtotal = this.calculateItemSubtotal(index) || 0;
    const taxAmount = item.taxAmount * item.quantity || 0;
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

      const purchaseOrder: PurchaseOrderDto = {
        createdAt: new Date().toISOString(),
        purchaseDate: formData.purchaseDate,
        orderItems: formData.orderItems.map((item: any) => {
          const subtotal = item.quantity * item.unitPrice;
          const taxPerItem = item.taxAmount || 0;
          const taxAmount = taxPerItem * item.quantity || 0;
          const totalWithTax = subtotal + taxAmount;

          return {
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxAmount: taxPerItem,
            productType: {
              id: item.productType.id,
            },
            productName: item.productType.productName,
            size: item.productType.size,
          };
        }),
      };

      console.log('Sending purchase order:', purchaseOrder);

      this.purchaseOrderService.createPurchaseOrder(purchaseOrder).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          console.log('Response:', response); // Debug log

          // Check HTTP status code (200-299 are success codes)
          if (response.status >= 200 && response.status < 300) {
            this.toaster.success('Purchase Order', 'Created successfully');
            setTimeout(() => {
              this.router.navigate(['/purchase-orders']);
            }, 1000);
          } else {
            this.toaster.error('Purchase Order', 'Failed to create purchase order');
            console.error('Failed to create purchase order:', response);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating purchase order:', error);
          this.toaster.error(
            'Purchase Order',
            error.message || 'An error occurred while creating the purchase order'
          );
        },
      });
    } else {
      this.markFormGroupTouched(this.purchaseOrderForm);
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
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
