import { Component } from '@angular/core';
import { InventoryService } from '../../service/inventory-service';
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { SalesOrderService } from '../service/sales-order-service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToasterService } from '../../../../../services/toaster.service';
import { AuthService } from '../../../security/service/auth-service';

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

  showDuplicateModal = false;
  duplicateProductInfo: {
    productName: string;
    existingIndex: number;
    newIndex: number;
  } | null = null;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private salesOrderService: SalesOrderService,
    private router: Router,
    private toaster: ToasterService,
    private authService: AuthService
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
    this.toaster.info('Order Item', 'New item added to order');
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
    this.toaster.info('Order Item', 'Item removed from order');
  }

  onProductTypeChange(index: number) {
    const itemGroup = this.orderItems.at(index);
    const selectedProductType: ProductTypeDto = itemGroup.get('productType')?.value;

    if (selectedProductType) {
      const duplicateIndex = this.checkForDuplicateProduct(selectedProductType.id!, index);

      if (duplicateIndex !== -1) {
        this.duplicateProductInfo = {
          productName: selectedProductType.productName || 'Unknown Product',
          existingIndex: duplicateIndex + 1,
          newIndex: index + 1,
        };
        this.showDuplicateModal = true;
        itemGroup.patchValue({
          productType: null,
          unitPrice: 0,
        });
        // Show error toast
        this.toaster.error(
          'Duplicate Product Not Allowed',
          `${selectedProductType.productName} is already added at row ${duplicateIndex}. Please select a different product.`
        );
      } else {
        itemGroup.patchValue({
          unitPrice: selectedProductType.sellUnitPrice || 0,
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
        createdBy: this.authService.getCurrentUser()?.fullName || 'Unknown',
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
        next: (response: any) => {
          this.isSubmitting = false;
          if (response.status >= 200 && response.status < 300) {
            this.toaster.success('Sales Order', 'Created successfully');
            setTimeout(() => {
              this.router.navigate(['/sales-orders/list']);
            }, 1000);
          } else {
            this.toaster.error('Sales Order', 'Failed to create sales order');
            console.error('Failed to create sales order:', response.message);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error creating sales order:', error);
          this.toaster.error(
            'Sales Order',
            error.message || 'An error occurred while creating the sales order'
          );
        },
      });
    } else {
      this.markFormGroupTouched(this.salesOrderForm);
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  onCancel() {
    this.router.navigate(['/sales-orders/list']);
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
