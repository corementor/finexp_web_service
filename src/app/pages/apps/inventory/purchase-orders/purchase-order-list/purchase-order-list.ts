import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToasterService } from '../../../../../services/toaster.service';

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
  itemsPerPage: number = 10;
  sortColumn: string = 'saleDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  dateFilter: string = '';
  Math = Math;

  showDeleteModal = false;
  orderToDelete?: PurchaseOrderDto;

  openDropdownIndex: number | null = null;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private toaster: ToasterService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders() {
    this.isLoading = true;
    this.purchaseOrderService.getPurchaseOrders().subscribe({
      next: (response) => {
        this.purchaseOrders = response.data;
        this.isLoading = false;
        this.toaster.success(
          'Purchase Orders',
          `Loaded ${this.purchaseOrders.length} purchase orders successfully`
        );
      },
      error: (error) => {
        this.toaster.error('Error', 'Failed to load purchase orders');
        console.error('Error loading purchase orders:', error);
        this.isLoading = false;
      },
    });
  }

  createNewOrder() {
    this.router.navigate(['/purchase-orders/create-purchase-orders']);
  }

  calculateTotalItems(order: PurchaseOrderDto): number {
    return order.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  viewOrderDetails(order: PurchaseOrderDto) {
    this.openDropdownIndex = null; // Close dropdown
    this.router.navigate(['/purchase-orders/view-purchase-order'], {
      state: {
        order: order,
      },
    });
  }

  viewOrderHistory(order: PurchaseOrderDto) {
    this.openDropdownIndex = null; // Close dropdown
    this.router.navigate(['/purchase-orders/purchase-order-history', order.id]);
  }

  toggleDropdown(index: number) {
    this.openDropdownIndex = this.openDropdownIndex === index ? null : index;
  }

  closeDropdown() {
    this.openDropdownIndex = null;
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
        case 'status':
          comparison = (a.status || '').toString().localeCompare((b.status || '').toString());
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

  deletePurchaseOrder(order: PurchaseOrderDto) {
    this.openDropdownIndex = null; // Close dropdown
    this.orderToDelete = order;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.orderToDelete = undefined;
  }

  confirmDeletePurchaseOrder() {
    if (!this.orderToDelete?.id) {
      this.toaster.error('Delete Error', 'Invalid purchase order');
      return;
    }

    this.purchaseOrderService.deletePurchaseOrder(this.orderToDelete).subscribe({
      next: (response) => {
        if (response.status >= 200 && response.status < 300) {
          this.toaster.success(
            'Deleted',
            `Purchase order "${this.orderToDelete?.purchaseCode}" deleted successfully`
          );
          this.closeDeleteModal();
          this.loadPurchaseOrders();
        } else {
          this.toaster.error('Error', 'Failed to delete purchase order');
        }
      },
      error: (error) => {
        this.toaster.error('Error', 'Failed to delete purchase order');
        console.error('Error deleting purchase order:', error);
      },
    });
  }
}
