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
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { SalesOrderItemDTO } from '../../../../../common/dto/inventory/sales-order-item-dto';
import { InventoryService } from '../../service/inventory-service';
import { ProductTypeDto } from '../../../../../common/dto/inventory/productType-dto';
import { SalesOrderService } from '../service/sales-order-service';
import { Response } from '../../../../../common/dto/util/response';
import { ToasterService } from '../../../../../services/toaster.service';

@Component({
  selector: 'app-view-sales-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './view-sales-order.html',
  styleUrl: './view-sales-order.css',
})
export class ViewSalesOrder implements OnInit {
  order?: SalesOrderDTO;
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

  loading = false;
  showDeleteModal = false;
  salesOrderItemToDelete?: SalesOrderItemDTO;

  // Add these new properties
  showAddItemModal = false;
  addItemForm: FormGroup | null = null;

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private salesOrderService: SalesOrderService,
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
      this.router.navigate(['/sales-orders']);
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

  createOrderItemFormGroup(item?: SalesOrderItemDTO): FormGroup {
    return this.fb.group({
      id: [item?.id],
      productType: [item?.productType || null, Validators.required],
      productName: [item?.productName],
      quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
      unitPrice: [item?.unitPrice || 0, [Validators.required, Validators.min(0)]],
      size: [item?.size],
      totalPrice: [item?.totalPrice],
    });
  }

  calculateItemTotal(index: number): number {
    const item = this.orderItems.at(index).value;
    const quantity = item.quantity || 0;
    const unitPrice = item.unitPrice || 0;
    return quantity * unitPrice;
  }

  calculateGrandTotal(): number {
    if (!this.order?.orderItems) return 0;

    return this.order.orderItems.reduce((total, item) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      return total + quantity * unitPrice;
    }, 0);
  }

  startInlineEdit(index: number, item: SalesOrderItemDTO) {
    // Prevent editing if product type is not set
    if (!item.productType || !item.productName) {
      this.toaster.warning('Cannot Edit', 'This item does not have a valid product type');
      return;
    }

    this.editingRow = index;
    this.initializeInlineForm(item);
  }

  initializeInlineForm(item: SalesOrderItemDTO) {
    // Remove productType from the form since it's no longer editable
    this.inlineForm = this.fb.group({
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
    });
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

      const itemTotal = this.calculateInlineItemTotal();

      // Keep the existing product information and only update the editable fields
      const updatedItem = {
        ...this.order.orderItems[index],
        quantity: formValues.quantity,
        unitPrice: formValues.unitPrice,
        totalPrice: itemTotal,
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

  private updateOrderInBackend() {
    if (!this.order) return;

    this.salesOrderService.updateSalesOrder(this.order).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.cdr.detectChanges();
          this.toaster.success('Order Updated', 'Changes saved successfully');
        } else {
          this.toaster.error('Update Failed', response.message || 'Failed to update order');
        }
      },
      error: (error) => {
        console.error('Error updating order:', error);
        this.toaster.error('Update Failed', error.message || 'An error occurred while updating');
      },
    });
  }

  calculateInlineItemTotal(): number {
    if (!this.inlineForm) return 0;
    const values = this.inlineForm.value;
    const quantity = values.quantity || 0;
    const unitPrice = values.unitPrice || 0;
    return quantity * unitPrice;
  }

  cancelInlineEdit() {
    this.editingRow = null;
    this.inlineForm = null;
    this.toaster.info('Edit Cancelled', 'Inline edit cancelled');
  }

  addNewItem() {
    this.showAddItemModal = true;
    this.addItemForm = this.fb.group({
      productType: [null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
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
      this.addItemForm.patchValue({
        unitPrice: selectedProductType.sellUnitPrice || 0,
      });
    }
  }

  calculateAddItemTotal(): number {
    if (!this.addItemForm) return 0;
    const values = this.addItemForm.value;
    const quantity = values.quantity || 0;
    const unitPrice = values.unitPrice || 0;
    return quantity * unitPrice;
  }

  saveNewItem() {
    if (this.addItemForm?.valid && this.order) {
      const formValues = this.addItemForm.value;
      const selectedProductType: ProductTypeDto = formValues.productType;

      // Enhanced validation
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

      const newItem: SalesOrderItemDTO = {
        productType: { id: selectedProductType.id, createdAt: selectedProductType.createdAt },
        productName: selectedProductType.productName,
        size: selectedProductType.size,
        quantity: formValues.quantity,
        unitPrice: formValues.unitPrice,
        totalPrice: this.calculateAddItemTotal(),
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

  onBack() {
    this.router.navigate(['/sales-orders']);
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

  calculateTotals() {
    let total = 0;
    this.orderItems.controls.forEach((control, index) => {
      const itemTotal = this.calculateItemTotal(index);
      control.patchValue(
        {
          totalPrice: itemTotal,
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
      const updatedOrder: SalesOrderDTO = {
        ...this.order,
        orderItems: this.orderItems.value.map((item: any) => ({
          ...item,
          productType: { id: item.productType.id },
        })),
      };

      this.salesOrderService.updateSalesOrder(updatedOrder).subscribe({
        next: (response: Response) => {
          this.isSubmitting = false;
          if (response.status === 200) {
            this.order = response.data;
            this.isEditing = false;
            this.toaster.success('Sales Order', 'Updated successfully');
          } else {
            this.toaster.error('Sales Order', response.message || 'Failed to update order');
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating order:', error);
          this.toaster.error(
            'Sales Order',
            error.message || 'An error occurred while updating the order'
          );
        },
      });
    } else {
      this.toaster.warning('Form Validation', 'Please fill in all required fields correctly');
    }
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
        unitPrice: selectedProductType.sellUnitPrice || 0,
        size: selectedProductType.size?.toString(),
      });
    }
    this.calculateTotals();
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
        item.unitPrice?.toString().includes(term)
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

  deleteSalesOrderItem(item: SalesOrderItemDTO) {
    this.salesOrderItemToDelete = item;
    this.showDeleteModal = true;
    this.toaster.info('Delete Confirmation', 'Review the product details before deleting');
  }
  closeDeleteModal() {
    this.showDeleteModal = false;
    this.salesOrderItemToDelete = undefined;
  }
  confirmDelete() {
    if (!this.salesOrderItemToDelete?.id) {
      this.toaster.error('Delete Error', 'No product selected for deletion');
      return;
    }
    this.salesOrderService.deleteSalesOrderItem(this.salesOrderItemToDelete.id).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.cdr.detectChanges();
          this.toaster.success(
            'Deleted',
            `Product order item "${this.salesOrderItemToDelete?.productName}" deleted successfully`
          );
          // Remove item from local array
          if (this.order?.orderItems) {
            const index = this.order.orderItems.findIndex(
              (item) => item.id === this.salesOrderItemToDelete?.id
            );
            if (index !== -1) {
              this.order.orderItems.splice(index, 1);
              // Recalculate total
              // this.order.totalPrice = this.calculateGrandTotal();
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
