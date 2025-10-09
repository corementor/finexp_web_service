import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SalesOrderDTO } from '../../../../../../common/dto/inventory/sales-order-dto';
import { SalesOrderItemDTO } from '../../../../../../common/dto/inventory/sales-order-item-dto';
import { InventoryService } from '../../../service/inventory-service';
import { ProductTypeDto } from '../../../../../../common/dto/inventory/productType-dto';
import { SalesOrderService } from '../service/sales-order-service';
import { Response } from '../../../../../../common/dto/util/response';

@Component({
  selector: 'app-view-sales-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  errorMessage: string = '';

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private salesOrderService: SalesOrderService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.order = navigation?.extras?.state?.['order'];
    this.orderForm = this.createOrderForm();
  }

  ngOnInit() {
    if (!this.order) {
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
      },
      error: (error) => {
        console.error('Error loading product types:', error);
        this.errorMessage = 'Failed to load product types';
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
    return (item.quantity || 0) * (item.unitPrice || 0);
  }

  calculateGrandTotal(): number {
    if (!this.order?.orderItems) return 0;
    return this.order.orderItems.reduce((total, item) => {
      return total + (item.quantity || 0) * (item.unitPrice || 0);
    }, 0);
  }

  addNewItem() {
    if (!this.order) return;

    if (!this.order.orderItems) {
      this.order.orderItems = [];
    }

    const newItem: SalesOrderItemDTO = {
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      createdAt: new Date().toISOString(),
    };

    this.order.orderItems.push(newItem);
    const newIndex = this.order.orderItems.length - 1;
    this.startInlineEdit(newIndex, newItem);
  }

  startInlineEdit(index: number, item: SalesOrderItemDTO) {
    this.editingRow = index;
    this.initializeInlineForm(item);
  }

  initializeInlineForm(item: SalesOrderItemDTO) {
    this.inlineForm = this.fb.group({
      productType: [item.productType, Validators.required],
      quantity: [item.quantity, [Validators.required, Validators.min(1)]],
      unitPrice: [item.unitPrice, [Validators.required, Validators.min(0)]],
    });
  }

  saveInlineEdit(index: number) {
    if (this.inlineForm?.valid && this.order?.orderItems) {
      this.isSubmitting = true;
      const selectedProductType = this.inlineForm.value.productType;

      const updatedItem: SalesOrderItemDTO = {
        ...this.order.orderItems[index],
        ...this.inlineForm.value,
        productName: selectedProductType.productName,
        size: selectedProductType.size,
        totalPrice: this.calculateInlineItemTotal(),
        productType: {
          id: selectedProductType.id,
        },
      };

      this.order.orderItems[index] = updatedItem;
      this.order.totalPrice = this.calculateGrandTotal();

      this.salesOrderService.updateSalesOrder(this.order).subscribe({
        next: (response: Response) => {
          this.isSubmitting = false;
          if (response.status === 200) {
            this.order = response.data;
            this.editingRow = null;
            this.inlineForm = null;
            this.errorMessage = '';
          } else {
            this.errorMessage = response.message || 'Failed to update order';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating order:', error);
          this.errorMessage = 'An error occurred while updating the order';
        },
      });
    }
  }

  calculateInlineItemTotal(): number {
    if (!this.inlineForm) return 0;
    const values = this.inlineForm.value;
    return (values.quantity || 0) * (values.unitPrice || 0);
  }

  cancelInlineEdit() {
    this.editingRow = null;
    this.inlineForm = null;
    this.errorMessage = '';
  }

  onBack() {
    this.router.navigate(['/sales-orders']);
  }
  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.patchFormWithOrderData();
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
            this.errorMessage = '';
          } else {
            this.errorMessage = response.message || 'Failed to update order';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error updating order:', error);
          this.errorMessage = 'An error occurred while updating the order';
        },
      });
    }
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
        unitPrice: selectedProductType.sellUnitPrice || 0,
        size: selectedProductType.size,
      });
    }
    this.calculateTotals();
  }
}
