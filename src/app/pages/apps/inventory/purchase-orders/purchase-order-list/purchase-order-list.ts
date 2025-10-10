import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {
  purchaseOrders: PurchaseOrderDto[] = [];
  isLoading = false;
  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  sortColumn: string = 'saleDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  dateFilter: string = '';
  Math = Math;
  constructor(private purchaseOrderService: PurchaseOrderService, private router: Router) {}

  ngOnInit() {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders() {
    this.isLoading = true;
    this.purchaseOrderService.getPurchaseOrders().subscribe({
      next: (response) => {
        this.purchaseOrders = response.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading purchase orders:', error);
        this.isLoading = false;
      },
    });
  }

  createNewOrder() {
    this.router.navigate(['/create-purchase-orders']);
  }

  calculateTotalItems(order: PurchaseOrderDto): number {
    return order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  viewOrderDetails(order: PurchaseOrderDto) {
    this.router.navigate(['/view-purchase-order'], {
      state: {
        order: order,
      },
    });
  }

  get filteredOrders(): PurchaseOrderDto[] {
    let filtered = [...this.purchaseOrders];

    // Apply search
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.purchaseCode?.toLowerCase().includes(term) ||
          this.formatDate(order.purchaseDate).toLowerCase().includes(term) ||
          order.totalPrice?.toString().includes(term)
      );
    }

    // Apply date filter
    if (this.dateFilter) {
      filtered = filtered.filter(
        (order) => order.purchaseDate?.substring(0, 10) === this.dateFilter
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (this.sortColumn) {
        case 'purchaseCode':
          comparison = (a.purchaseCode || '').localeCompare(b.purchaseCode || '');
          break;
        case 'purchaseDate':
          comparison =
            new Date(a.purchaseDate || '').getTime() - new Date(b.purchaseDate || '').getTime();
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

  get paginatedOrders(): PurchaseOrderDto[] {
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
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  clearFilters() {
    this.searchTerm = '';
    this.dateFilter = '';
    this.currentPage = 1;
  }
}
