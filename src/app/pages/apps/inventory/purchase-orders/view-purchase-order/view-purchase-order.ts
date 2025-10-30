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
import { AuthService } from '../../../security/service/auth-service';
import { EOrderHistoryStatus } from '../../../../../common/dto/util/e-order-history-status';

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

  itemsPerPage: number = 10;
  currentPage: number = 1;
  Math = Math;
  productToDelete?: ProductOrderItemDto;
  showDeleteModal = false;
  loading = false;

  showAddItemModal = false;
  addItemForm: FormGroup | null = null;

  showDuplicateModal = false;
  duplicateProductInfo: {
    productName: string;
    existingIndex: number;
    newIndex: number;
  } | null = null;

  // Approval workflow properties
  showSubmitModal = false;
  showApproveModal = false;
  showReturnModal = false;
  approvalComment = '';
  isProcessingApproval = false;

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private purchaseOrderService: PurchaseOrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toaster: ToasterService,
    private authService: AuthService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras?.state?.['order'];
    this.orderForm = this.createOrderForm();
  }

  ngOnInit() {
    if (!this.order) {
      this.toaster.warning('Navigation Error', 'No order data found. Redirecting to list...');
      this.router.navigate(['/purchase-orders/list']);
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
      this.order.modifiedBy = this.authService.getCurrentUser()?.fullName || 'N/A';

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
    this.router.navigate(['/purchase-orders/list']);
  }

  initializeInlineForm(item: ProductOrderItemDto) {
    // Remove productType from the form since it's no longer editable
    this.inlineForm = this.fb.group({
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
      taxAmount: [item.taxAmount, [Validators.required, Validators.min(0)]],
    });
  }

  startInlineEdit(index: number, item: ProductOrderItemDto) {
    // Prevent editing if product type is not set
    if (!item.productType || !item.productName) {
      this.toaster.warning('Cannot Edit', 'This item does not have a valid product type');
      return;
    }

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
      if (!formValues.quantity || formValues.quantity < 1) {
        this.toaster.warning('Validation Error', 'Please enter a valid quantity (minimum 1)');
        return;
      }
      if (
        formValues.unitPrice === null ||
        formValues.unitPrice === undefined ||
        formValues.unitPrice < 0
      ) {
        this.toaster.warning('Validation Error', 'Please enter a valid unit price');
        return;
      }
      if (
        formValues.taxAmount === null ||
        formValues.taxAmount === undefined ||
        formValues.taxAmount < 0
      ) {
        this.toaster.warning('Validation Error', 'Please enter a valid tax amount');
        return;
      }

      // Keep the existing product information and only update the editable fields
      const updatedItem = {
        ...this.order.orderItems[index],
        quantity: formValues.quantity,
        unitPrice: formValues.unitPrice,
        taxAmount: formValues.taxAmount,
        totalTax: formValues.taxAmount * formValues.quantity,
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
    const quantity = values.quantity || 0;
    const unitPrice = values.unitPrice || 0;
    const taxAmount = values.taxAmount || 0;
    return quantity * unitPrice + taxAmount * quantity;
  }

  addNewItem() {
    this.showAddItemModal = true;
    this.addItemForm = this.fb.group({
      productType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxAmount: [0, [Validators.required, Validators.min(0)]],
    });
    this.toaster.info('Add New Item', 'Select a product and fill in the details');
  }

  closeAddItemModal() {
    this.showAddItemModal = false;
    this.addItemForm = null;
  }

  onAddItemProductTypeChange() {
    if (!this.addItemForm) return;

    const selectedProductType: ProductTypeDto = this.addItemForm.get('productType')?.value;

    if (selectedProductType) {
      // Check for duplicates in existing order items
      const duplicateIndex = this.checkForDuplicateInOrder(selectedProductType.id!);

      if (duplicateIndex !== -1) {
        // Duplicate found - show modal and clear selection
        this.duplicateProductInfo = {
          productName: selectedProductType.productName || 'Unknown Product',
          existingIndex: duplicateIndex,
          newIndex: -1, // Not applicable for add modal
        };
        this.showDuplicateModal = true;

        // Clear the duplicate selection immediately
        this.addItemForm.patchValue({
          productType: null,
          unitPrice: 0,
          taxAmount: 0,
        });

        // Show error toast
        this.toaster.error(
          'Duplicate Product Not Allowed',
          `${selectedProductType.productName} is already in the order at row ${
            duplicateIndex + 1
          }. Please select a different product.`
        );
      } else {
        // No duplicate, proceed with auto-fill
        this.addItemForm.patchValue({
          unitPrice: selectedProductType.unitPrice || 0,
          taxAmount: 0,
        });
      }
    }
  }
  checkForDuplicateInOrder(productTypeId: string): number {
    if (!this.order?.orderItems) return -1;

    for (let i = 0; i < this.order.orderItems.length; i++) {
      const item = this.order.orderItems[i];
      if (item.productType?.id === productTypeId) {
        return i; // Return the index of the duplicate
      }
    }
    return -1; // No duplicate found
  }

  closeDuplicateModal() {
    this.showDuplicateModal = false;
    this.duplicateProductInfo = null;
  }
  calculateAddItemTotal(): number {
    if (!this.addItemForm) return 0;
    const values = this.addItemForm.value;
    const quantity = values.quantity || 0;
    const unitPrice = values.unitPrice || 0;
    const taxAmount = values.taxAmount || 0;
    return quantity * unitPrice + taxAmount * quantity;
  }

  saveNewItem() {
    if (this.addItemForm?.valid && this.order) {
      const formValues = this.addItemForm.value;
      const selectedProductType: ProductTypeDto = formValues.productType;

      if (!selectedProductType) {
        this.toaster.warning('Validation Error', 'Please select a product');
        return;
      }
      if (!formValues.quantity || formValues.quantity < 1) {
        this.toaster.warning('Validation Error', 'Please enter a valid quantity (minimum 1)');
        return;
      }
      if (
        formValues.unitPrice === null ||
        formValues.unitPrice === undefined ||
        formValues.unitPrice < 0
      ) {
        this.toaster.warning('Validation Error', 'Please enter a valid unit price');
        return;
      }
      if (
        formValues.taxAmount === null ||
        formValues.taxAmount === undefined ||
        formValues.taxAmount < 0
      ) {
        this.toaster.warning('Validation Error', 'Please enter a valid tax amount');
        return;
      }

      const newItem: ProductOrderItemDto = {
        productType: { id: selectedProductType.id, createdAt: selectedProductType.createdAt },
        productName: selectedProductType.productName,
        size: selectedProductType.size,
        quantity: formValues.quantity,
        unitPrice: formValues.unitPrice,
        taxAmount: formValues.taxAmount,
        totalTax: formValues.taxAmount * formValues.quantity,
        totalPriceWithTax: this.calculateAddItemTotal(),
        createdAt: new Date().toISOString(),
      };

      // Add to order items
      if (!this.order.orderItems) {
        this.order.orderItems = [];
      }
      this.order.orderItems.push(newItem);
      this.order.totalPrice = this.calculateGrandTotal();

      // Persist to backend
      this.updateOrderInBackend();

      this.closeAddItemModal();
      this.toaster.success('Order Item', 'New item added successfully');
    } else {
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
  }

  private updateOrderInBackend() {
    if (!this.order) return;

    this.purchaseOrderService.updatePurchaseOrder(this.order).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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

  // Approval workflow methods
  openSubmitModal() {
    this.showSubmitModal = true;
    this.approvalComment = '';
  }

  closeSubmitModal() {
    this.showSubmitModal = false;
    this.approvalComment = '';
  }

  submitForApproval() {
    if (!this.order?.id) {
      this.toaster.error('Submit Error', 'Order ID not found');
      return;
    }

    this.isProcessingApproval = true;
    this.purchaseOrderService
      .submitForApproval({
        id: this.order.id,
        comment: this.approvalComment || undefined,
      })
      .subscribe({
        next: (response) => {
          this.isProcessingApproval = false;
          if (response && response.status === 0) {
            this.toaster.success('Submitted', 'Purchase order submitted for approval successfully');
            this.closeSubmitModal();
            // Update local status
            if (this.order) {
              this.order.status = EOrderHistoryStatus.SUBMITTED;
            }
            this.cdr.detectChanges();
          } else {
            this.toaster.error(
              'Submit Failed',
              response?.message || 'Failed to submit for approval'
            );
          }
        },
        error: (error) => {
          this.isProcessingApproval = false;
          this.toaster.error('Submit Error', error.message || 'Failed to submit for approval');
          console.error('Error submitting for approval:', error);
        },
      });
  }

  openApproveModal() {
    this.showApproveModal = true;
    this.approvalComment = '';
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.approvalComment = '';
  }

  approvePurchaseOrder() {
    if (!this.order?.id) {
      this.toaster.error('Approve Error', 'Order ID not found');
      return;
    }

    if (!this.approvalComment || this.approvalComment.trim() === '') {
      this.toaster.warning('Comment Required', 'Please provide a comment for approval');
      return;
    }

    this.isProcessingApproval = true;
    this.purchaseOrderService
      .approvePurchaseOrder({
        id: this.order.id,
        comment: this.approvalComment,
      })
      .subscribe({
        next: (response) => {
          this.isProcessingApproval = false;
          if (response && response.status === 0) {
            this.toaster.success('Approved', 'Purchase order approved successfully');
            this.closeApproveModal();
            // Update local status
            if (this.order) {
              this.order.status = EOrderHistoryStatus.APPROVED;
            }
            this.cdr.detectChanges();
          } else {
            this.toaster.error(
              'Approve Failed',
              response?.message || 'Failed to approve purchase order'
            );
          }
        },
        error: (error) => {
          this.isProcessingApproval = false;
          this.toaster.error('Approve Error', error.message || 'Failed to approve purchase order');
          console.error('Error approving purchase order:', error);
        },
      });
  }

  openReturnModal() {
    this.showReturnModal = true;
    this.approvalComment = '';
  }

  closeReturnModal() {
    this.showReturnModal = false;
    this.approvalComment = '';
  }

  returnPurchaseOrder() {
    if (!this.order?.id) {
      this.toaster.error('Return Error', 'Order ID not found');
      return;
    }

    if (!this.approvalComment || this.approvalComment.trim() === '') {
      this.toaster.warning('Reason Required', 'Please provide a reason for returning');
      return;
    }

    this.isProcessingApproval = true;
    this.purchaseOrderService
      .returnPurchaseOrder({
        id: this.order.id,
        comment: this.approvalComment,
      })
      .subscribe({
        next: (response) => {
          this.isProcessingApproval = false;
          if (response && response.status === 0) {
            this.toaster.success('Returned', 'Purchase order returned successfully');
            this.closeReturnModal();
            // Update local status
            if (this.order) {
              this.order.status = EOrderHistoryStatus.RETURNED;
            }
            this.cdr.detectChanges();
          } else {
            this.toaster.error(
              'Return Failed',
              response?.message || 'Failed to return purchase order'
            );
          }
        },
        error: (error) => {
          this.isProcessingApproval = false;
          this.toaster.error('Return Error', error.message || 'Failed to return purchase order');
          console.error('Error returning purchase order:', error);
        },
      });
  }

  canSubmitForApproval(): boolean {
    return this.order?.status === EOrderHistoryStatus.CREATED;
  }

  canApproveOrReturn(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';
    return isAdmin && this.order?.status === EOrderHistoryStatus.SUBMITTED;
  }
  canEditOrder(): boolean {
    const currentUser = this.authService.getCurrentUser();
    const isAdmin = currentUser?.role === 'ADMIN';
    return (
      isAdmin &&
      (this.order?.status === EOrderHistoryStatus.CREATED ||
        this.order?.status === EOrderHistoryStatus.RETURNED)
    );
  }
}
