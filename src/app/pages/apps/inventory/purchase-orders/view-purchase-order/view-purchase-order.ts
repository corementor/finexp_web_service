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
import { ToasterService } from '../../../../../services/toaster.service';

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

  itemsPerPage: number = 5;
  currentPage: number = 1;
  Math = Math;
  productToDelete?: ProductOrderItemDto;
  showDeleteModal = false;
  loading = false;
  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toaster: ToasterService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras?.state?.['order'];
    this.orderForm = this.createOrderForm();
  }

  ngOnInit() {
    if (!this.order) {
      this.toaster.warning('Navigation Error', 'No order data found. Redirecting to list...');
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
        this.patchFormWithOrderData();
        this.toaster.success('Product Types', 'Loaded successfully');
      },
      error: (error) => {
        console.error('Error loading product types:', error);
        this.toaster.error('Product Types', 'Failed to load product types');
      },
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
      this.toaster.info('Edit Mode', 'Edit mode cancelled');
    } else {
      this.toaster.info('Edit Mode', 'You can now edit the order');
    }
  }

  addOrderItem() {
    this.orderItems.push(this.createOrderItemFormGroup());
    this.toaster.info('Order Item', 'New item added to form');
  }

  removeOrderItem(index: number) {
    this.orderItems.removeAt(index);
    this.calculateTotals();
    this.toaster.info('Order Item', 'Item removed from form');
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
    const taxAmount = (item.taxAmount || 0) * (item.quantity || 0);
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
          if (response.status >= 200 && response.status < 300) {
            this.isEditing = false;
            this.order = updatedOrder;
            this.toaster.success('Purchase Order', 'Updated successfully');
          } else {
            this.toaster.error('Purchase Order', 'Failed to update order');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating purchase order:', error);
          this.toaster.error('Purchase Order', error.message || 'Failed to update order');
        },
      });
    } else {
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  onBack() {
    this.router.navigate(['/purchase-orders']);
  }

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
    this.toaster.info('Edit Cancelled', 'Inline edit cancelled');
  }

  saveInlineEdit(index: number) {
    if (this.inlineForm?.valid && this.order?.orderItems) {
      const formValues = this.inlineForm.value;

      // Enhanced validation
      if (!formValues.productType) {
        this.toaster.warning('Validation Error', 'Please select a product');
        return;
      }
      if (!formValues.quantity || formValues.quantity < 1) {
        this.toaster.warning('Validation Error', 'Please enter a valid quantity (minimum 1)');
        return;
      }
      if (!formValues.unitPrice || formValues.unitPrice <= 0) {
        this.toaster.warning('Validation Error', 'Please enter a valid unit price');
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

      // Persist to backend
      this.updateOrderInBackend();

      this.editingRow = null;
      this.inlineForm = null;

      this.toaster.success('Order Item', 'Item updated successfully');
    } else {
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  calculateGrandTotal(): number {
    if (!this.order?.orderItems) return 0;

    return this.order.orderItems.reduce((total, item) => {
      const subtotal = (item.quantity || 0) * (item.unitPrice || 0);
      const taxAmount = (item.taxAmount || 0) * (item.quantity || 0);
      return total + subtotal + taxAmount;
    }, 0);
  }

  calculateInlineItemTotal(): number {
    if (!this.inlineForm) return 0;
    const values = this.inlineForm.value;
    return values.quantity * values.unitPrice + values.taxAmount * values.quantity;
  }

  addNewItem() {
    if (!this.order?.orderItems) return;

    const newItem: ProductOrderItemDto = {
      quantity: 1,
      unitPrice: undefined,
      taxAmount: 0,
      totalPriceWithTax: 0,
      createdAt: new Date().toISOString(),
    };

    this.order.orderItems.push(newItem);
    const newIndex = this.order.orderItems.length - 1;

    this.startInlineEdit(newIndex, newItem);
    this.toaster.info('New Item', 'Fill in the details for the new item');
  }

  private updateOrderInBackend() {
    if (!this.order) return;

    this.purchaseOrderService.updatePurchaseOrder(this.order).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success('Order Updated', 'Changes saved successfully');
        } else {
          this.toaster.error('Update Failed', response.body?.message || 'Failed to update order');
        }
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.toaster.error('Update Failed', error.message || 'An error occurred while updating');
      },
    });
  }

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

  get paginatedOrderItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrderItems.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrderItems.length / this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  deleteOrderItem(itemId: string, index: number) {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    this.purchaseOrderService.deletePurchaseOrderItem(itemId).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          // Remove item from local array
          if (this.order?.orderItems) {
            this.order.orderItems.splice(index, 1);
            // Recalculate total
            this.order.totalPrice = this.calculateGrandTotal();
            this.cdr.detectChanges();
            this.toaster.success('Order Item', 'Item deleted successfully');
          }
        } else {
          this.toaster.error('Delete Failed', response.body?.message || 'Failed to delete item');
        }
      },
      error: (error) => {
        console.error('Error deleting order item:', error);
        this.toaster.error('Delete Failed', error.message || 'An error occurred while deleting');
      },
    });
  }

  deleteProductOrderItem(productOrderItem: ProductOrderItemDto) {
    this.productToDelete = productOrderItem;
    this.showDeleteModal = true;
    this.toaster.info('Delete Confirmation', 'Review the product details before deleting');
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.productToDelete = undefined;
  }

  confirmDelete() {
    if (!this.productToDelete?.id) {
      this.toaster.error('Delete Error', 'No product selected for deletion');
      return;
    }
    this.purchaseOrderService.deletePurchaseOrderItem(this.productToDelete.id).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success(
            'Deleted',
            `Product order item "${this.productToDelete?.productName}" deleted successfully`
          );
          // Remove item from local array
          if (this.order?.orderItems) {
            const index = this.order.orderItems.findIndex(
              (item) => item.id === this.productToDelete?.id
            );
            if (index !== -1) {
              this.order.orderItems.splice(index, 1);
              // Recalculate total
              // this.order.totalPrice = this.calculateGrandTotal();
              this.cdr.detectChanges();
            }
          }
          this.closeDeleteModal();
        } else {
          this.toaster.error(
            'Delete Failed',
            response.body?.message || 'Failed to delete product order item'
          );
        }
      },
    });
  }
}
