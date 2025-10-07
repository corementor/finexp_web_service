import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { ProductOrderItemDto } from '../../../../../common/dto/inventory/product-order-item-dto';
import { InventoryService } from '../../service/inventory-service';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';

@Component({
  selector: 'app-view-purchase-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './view-purchase-order.html',
  styleUrl: './view-purchase-order.css',
})
export class ViewPurchaseOrder implements OnInit {
  order?: PurchaseOrderDto;
  productTypes: ProductTypeDto[] = [];
  isEditing = false;
  isSubmitting = false;
  orderForm: FormGroup;

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras?.state?.['order'];
    this.orderForm = this.createOrderForm();
  }

  ngOnInit() {
    if (!this.order) {
      this.router.navigate(['/purchase-orders']);
      return;
    }
    this.loadProductTypes();
    this.patchFormWithOrderData();
  }

  createOrderForm(): FormGroup {
    return this.fb.group({
      orderItems: this.fb.array([]),
    });
  }

  get orderItems(): FormArray {
    return this.orderForm.get('orderItems') as FormArray;
  }

  createOrderItemFormGroup(item?: ProductOrderItemDto): FormGroup {
    return this.fb.group({
      id: [item?.id],
      productType: [item?.productTypeId, Validators.required],
      productName: [item?.productName],
      quantity: [item?.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice, [Validators.required, Validators.min(0)]],
      size: [item?.size],
      taxAmount: [item?.taxAmount, [Validators.required, Validators.min(0)]],
      totalTax: [item?.totalTax],
      totalPriceWithTax: [item?.totalPriceWithTax],
    });
  }

  loadProductTypes() {
    this.inventoryService.getAllProductTypes().subscribe({
      next: (types) => {
        this.productTypes = types;
      },
      error: (error) => console.error('Error loading product types:', error),
    });
  }

  patchFormWithOrderData() {
    if (this.order?.orderItems) {
      const itemsFormArray = this.orderForm.get('orderItems') as FormArray;
      itemsFormArray.clear();

      this.order.orderItems.forEach((item) => {
        itemsFormArray.push(this.createOrderItemFormGroup(item));
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.patchFormWithOrderData(); // Reset form when canceling edit
    }
  }

  addOrderItem() {
    this.orderItems.push(this.createOrderItemFormGroup());
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
    this.calculateTotals();
  }

  onProductTypeChange(index: number) {
    const itemGroup = this.orderItems.at(index);
    const selectedProductType: ProductTypeDto = itemGroup.get('productType')?.value;

    if (selectedProductType) {
      itemGroup.patchValue({
        productName: selectedProductType.productName,
        unitPrice: selectedProductType.unitPrice || 0,
        size: selectedProductType.size,
        taxAmount: 0,
      });
    }
    this.calculateTotals();
  }

  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
    const taxAmount = item.taxAmount || 0;
    return subtotal + taxAmount;
  }

  calculateTotals() {
    let total = 0;
    this.orderItems.controls.forEach((control, index) => {
      const itemTotal = this.calculateItemTotal(index);
      control.patchValue(
        {
          totalPriceWithTax: itemTotal,
        },
        { emitEvent: false }
      );
      total += itemTotal;
    });
    if (this.order) {
      this.order.totalPrice = total;
    }
  }

  onSubmit() {
    if (this.orderForm.valid && this.order) {
      this.isSubmitting = true;
      const updatedOrder: PurchaseOrderDto = {
        ...this.order,
        orderItems: this.orderItems.value,
      };

      this.purchaseOrderService.updatePurchaseOrder(updatedOrder).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.isEditing = false;
          this.order = updatedOrder;
          // Show success message
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating purchase order:', error);
          // Show error message
        },
      });
    }
  }

  onBack() {
    this.router.navigate(['/purchase-orders']);
  }
}
