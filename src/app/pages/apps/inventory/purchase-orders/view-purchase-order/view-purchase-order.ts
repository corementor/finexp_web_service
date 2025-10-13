import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { ProductOrderItemDto } from '../../../../../common/dto/inventory/product-order-item-dto';
import { InventoryService } from '../../service/inventory-service';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';

@Component({
  selector: 'app-view-purchase-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './view-purchase-order.html',
  styleUrl: './view-purchase-order.css',
})
export class ViewPurchaseOrder implements OnInit {
  order?: PurchaseOrderDto;
  productTypes: ProductTypeDto[] = [];
  isEditing = false;
  isSubmitting = false;
  orderForm: FormGroup;

  editingRow: number | null = null;
  inlineForm: FormGroup | null = null;
  searchTerm: string = '';

  // Add these properties to the class
  itemsPerPage: number = 5;
  currentPage: number = 1;
  Math = Math;

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
      productType: [item?.productType || null, Validators.required],
      productName: [item?.productName],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      size: [item?.size],
      taxAmount: [item?.taxAmount || 0, [Validators.required, Validators.min(0)]],
      totalTax: [item?.totalTax],
      totalPriceWithTax: [item?.totalPriceWithTax],
    });
  }

  loadProductTypes() {
    this.inventoryService.getAllProductTypes().subscribe({
      next: (types) => {
        this.productTypes = types;
        // After loading product types, patch the form data
        this.patchFormWithOrderData();
      },
      error: (error) => console.error('Error loading product types:', error),
    });
  }

  patchFormWithOrderData() {
    if (this.order?.orderItems) {
      const itemsFormArray = this.orderForm.get('orderItems') as FormArray;
      itemsFormArray.clear();

      this.order.orderItems.forEach((item) => {
        const productType = this.productTypes.find((pt) => pt.id === item.productType?.id);
        const formGroup = this.createOrderItemFormGroup({
          ...item,
          productType: productType,
        });
        itemsFormArray.push(formGroup);
      });
    }
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.patchFormWithOrderData();
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

  // Add these new methods
  initializeInlineForm(item: ProductOrderItemDto) {
    this.inlineForm = this.fb.group({
      productType: [item.productType, Validators.required],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
      taxAmount: [item.taxAmount, [Validators.required, Validators.min(0)]],
    });
  }

  startInlineEdit(index: number, item: ProductOrderItemDto) {
    this.editingRow = index;
    this.initializeInlineForm(item);
  }

  cancelInlineEdit() {
    this.editingRow = null;
    this.inlineForm = null;
  }

  // saveInlineEdit(index: number) {
  //   if (this.inlineForm?.valid && this.order?.orderItems) {
  //     const updatedItem = {
  //       ...this.order.orderItems[index],
  //       ...this.inlineForm.value,
  //       totalPriceWithTax: this.calculateInlineItemTotal(),
  //     };
  //     this.order.orderItems[index] = updatedItem;
  //     this.order.totalPrice = this.calculateGrandTotal();
  //     this.editingRow = null;
  //     this.inlineForm = null;
  //   }
  // }
  /**
   * Save inline edit - make sure it persists to backend
   */
  // saveInlineEdit(index: number) {
  //   if (this.inlineForm?.valid && this.order?.orderItems) {
  //     const updatedItem = {
  //       ...this.order.orderItems[index],
  //       ...this.inlineForm.value,
  //       totalPriceWithTax: this.calculateInlineItemTotal(),
  //     };

  //     this.order.orderItems[index] = updatedItem;
  //     this.order.totalPrice = this.calculateGrandTotal();

  //     // Persist changes to backend
  //     this.updateOrderInBackend();

  //     this.editingRow = null;
  //     this.inlineForm = null;
  //   }
  // }
  // Enhanced save with validation
  saveInlineEdit(index: number) {
    if (this.inlineForm?.valid && this.order?.orderItems) {
      const formValues = this.inlineForm.value;

      // Enhanced validation
      if (!formValues.productType) {
        alert('Please select a product');
        return;
      }
      if (!formValues.quantity || formValues.quantity < 1) {
        alert('Please enter a valid quantity (minimum 1)');
        return;
      }
      if (!formValues.unitPrice || formValues.unitPrice <= 0) {
        alert('Please enter a valid unit price');
        return;
      }

      const updatedItem = {
        ...this.order.orderItems[index],
        ...formValues,
        productName: formValues.productType.productName,
        size: formValues.productType.size,
        totalPriceWithTax: this.calculateInlineItemTotal(),
      };

      this.order.orderItems[index] = updatedItem;
      this.order.totalPrice = this.calculateGrandTotal();

      // Persist to backend only when all data is valid
      this.updateOrderInBackend();

      this.editingRow = null;
      this.inlineForm = null;

      // Show success message
      console.log('Item added successfully');
    }
  }

  // calculateGrandTotal(): number {
  //   if (!this.order?.orderItems) return 0;

  //   return this.order.orderItems.reduce((total, item) => {
  //     const itemTotal = (item.quantity || 0) * (item.unitPrice || 0) + (item.taxAmount || 0);
  //     return total + itemTotal;
  //   }, 0);
  // }

  /**
   * Improved grand total calculation
   */
  calculateGrandTotal(): number {
    if (!this.order?.orderItems) return 0;

    return this.order.orderItems.reduce((total, item) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const taxAmount = item.taxAmount || 0;
      return total + subtotal + taxAmount;
    }, 0);
  }

  calculateInlineItemTotal(): number {
    if (!this.inlineForm) return 0;
    const values = this.inlineForm.value;
    return values.quantity * values.unitPrice + (values.taxAmount || 0);
  }

  // addNewItem() {
  //   if (!this.order?.orderItems) return;

  //   const newItem: ProductOrderItemDto = {
  //     quantity: 1,
  //     unitPrice: 0,
  //     taxAmount: 0,
  //     totalPriceWithTax: 0,
  //     createdAt: new Date().toISOString(),
  //   };

  //   this.order.orderItems.push(newItem);
  //   const newIndex = this.order.orderItems.length - 1;
  //   this.startInlineEdit(newIndex, newItem);
  // }

  /**
   * Add new item and persist to backend
   */
  addNewItem() {
    if (!this.order?.orderItems) return;

    const newItem: ProductOrderItemDto = {
      quantity: 1,
      unitPrice: undefined,
      taxAmount: 0,
      totalPriceWithTax: 0,
      // productType: this.productTypes[0], // Default to first product type
      // productName: this.productTypes[0]?.productName,
      // size: this.productTypes[0]?.size,
      createdAt: new Date().toISOString(),
    };

    this.order.orderItems.push(newItem);
    const newIndex = this.order.orderItems.length - 1;

    // Persist to backend
    // this.updateOrderInBackend();

    this.startInlineEdit(newIndex, newItem);
  }
  /**
   * Update the entire order in backend
   */
  private updateOrderInBackend() {
    if (!this.order) return;

    this.purchaseOrderService.updatePurchaseOrder(this.order).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Order updated successfully');
        } else {
          console.error('Failed to update order:', response.message);
        }
      },
      error: (error) => {
        console.error('Error updating order:', error);
      },
    });
  }
  // Add this getter method
  get filteredOrderItems(): any[] {
    if (!this.order?.orderItems || !this.searchTerm) {
      return this.order?.orderItems || [];
    }

    const term = this.searchTerm.toLowerCase();
    return this.order.orderItems.filter(
      (item) =>
        item.productName?.toLowerCase().includes(term) ||
        item.size?.toString().includes(term) ||
        item.quantity?.toString().includes(term) ||
        item.unitPrice?.toString().includes(term) ||
        item.taxAmount?.toString().includes(term) ||
        item.totalPriceWithTax?.toString().includes(term)
    );
  }

  // Add these getter methods
  get paginatedOrderItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrderItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrderItems.length / this.itemsPerPage);
  }

  // Add this method
  onPageChange(page: number) {
    this.currentPage = page;
  }

  deleteOrderItem(itemId: string, index: number) {
    if (confirm('Are you sure you want to delete this item?')) {
      this.purchaseOrderService.deletePurchaseOrderItem(itemId).subscribe({
        next: (response) => {
          if (response.success) {
            // Remove item from local array
            if (this.order?.orderItems) {
              this.order.orderItems.splice(index, 1);
              // Recalculate total
              this.order.totalPrice = this.calculateGrandTotal();
              this.cdr.detectChanges();
            }
          } else {
            console.error('Failed to delete item:', response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting order item:', error);
        },
      });
    }
  }
}
