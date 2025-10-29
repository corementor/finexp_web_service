import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { SalesOrderService } from '../service/sales-order-service';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToasterService } from '../../../../../services/toaster.service';

@Component({
  selector: 'app-list-sales-order',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './list-sales-order.html',
  styleUrl: './list-sales-order.css',
})
export class ListSalesOrder implements OnInit {
  Math = Math;
  saleOrderForm: FormGroup;
  salesOrderList: SalesOrderDTO[] = [];
  isLoading = false;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  sortColumn: string = 'saleDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  dateFilter: string = '';

  constructor(
    private router: Router,
    private salesOrderService: SalesOrderService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private toaster: ToasterService
  ) {
    this.saleOrderForm = this.createForm();
  }

  ngOnInit() {
    this.loadSalesOrders();
  }
  viewOrderDetails(order: SalesOrderDTO) {
    this.router.navigate(['/sales-orders/view-sales-order'], { state: { order: order } });
  }
  loadSalesOrders() {
    this.isLoading = true;
    this.salesOrderService.getSalesOrders().subscribe({
      next: (response) => {
        this.salesOrderList = response;
        this.isLoading = false;
        this.toaster.success(
          'Sales Orders',
          `Loaded ${this.salesOrderList.length} sales orders successfully`
        );
      },
      error: (error) => {
        console.error('Error loading sales orders:', error);
        this.isLoading = false;
        this.toaster.error('Error', 'Failed to load sales orders');
      },
    });
  }
  createNewOrder() {
    this.router.navigate(['/sales-orders/create-sales-order']);
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

  get filteredOrders(): SalesOrderDTO[] {
    let filtered = [...this.salesOrderList];

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.saleCode?.toLowerCase().includes(term) ||
          this.formatDate(order.saleDate).toLowerCase().includes(term) ||
          order.totalPrice?.toString().includes(term)
      );
    }

    // Apply date filter
    if (this.dateFilter) {
      filtered = filtered.filter((order) => order.saleDate?.substring(0, 10) === this.dateFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortColumn) {
        case 'saleCode':
          comparison = (a.saleCode || '').localeCompare(b.saleCode || '');
          break;
        case 'saleDate':
          comparison = new Date(a.saleDate || '').getTime() - new Date(b.saleDate || '').getTime();
          break;
        case 'totalItems':
          comparison = this.calculateTotalItems(a) - this.calculateTotalItems(b);
          break;
        case 'totalPrice':
          comparison = (a.totalPrice || 0) - (b.totalPrice || 0);
          break;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  get paginatedOrders(): SalesOrderDTO[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.toaster.info('Sorting', `Sorted by ${column} (${this.sortDirection}ending)`);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  clearFilters() {
    this.searchTerm = '';
    this.dateFilter = '';
    this.currentPage = 1;
    this.toaster.info('Filters Cleared', 'All filters have been reset');
  }
}
