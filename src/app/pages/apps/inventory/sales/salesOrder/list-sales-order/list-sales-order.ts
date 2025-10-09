import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesOrderDTO } from '../../../../../../common/dto/inventory/sales-order-dto';
import { SalesOrderService } from '../service/sales-order-service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-sales-order',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './list-sales-order.html',
  styleUrl: './list-sales-order.css',
})
export class ListSalesOrder implements OnInit {
  saleOrderForm: FormGroup;
  salesOrderList: SalesOrderDTO[] = [];
  isLoading = false;
  constructor(
    private router: Router,
    private salesOrderService: SalesOrderService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.saleOrderForm = this.createForm();
  }

  ngOnInit() {
    this.loadSalesOrders();
  }
  viewOrderDetails(order: SalesOrderDTO) {
    this.router.navigate(['/view-sales-order'], { state: { order: order } });
  }
  loadSalesOrders() {
    this.isLoading = true;
    this.salesOrderService.getSalesOrders().subscribe({
      next: (response) => {
        this.salesOrderList = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sales orders:', error);
        this.isLoading = false;
      },
    });
  }
  createNewOrder() {
    this.router.navigate(['/create-sales-order']);
  }
  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
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
    return this.saleOrderForm.get('orderItems') as FormArray;
  }
  calculateTotalItems(order: SalesOrderDTO): number {
    if (!order.orderItems) {
      return 0;
    }
    return order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }
}
