import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SalesOrderDTO } from '../../../../../common/dto/inventory/sales-order-dto';
import { SalesOrderHistoryDto } from '../../../../../common/dto/inventory/sales-order-history';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { SalesOrderService } from '../service/sales-order-service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sales-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-order-history.html',
  styleUrl: './sales-order-history.css',
})
export class SalesOrderHistory implements OnInit {
  salesOrderId: string;
  history: SalesOrderHistoryDto[] = [];
  salesOrder: SalesOrderDTO | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private salesOrderService: SalesOrderService
  ) {
    this.salesOrderId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    if (this.salesOrderId) {
      this.loadSalesOrderHistory();
      this.loadSalesOrderDetails();
    } else {
      this.errorMessage = 'No sales order ID provided';
    }
  }
  loadSalesOrderHistory() {
    this.isLoading = true;
    this.errorMessage = '';

    this.salesOrderService.getSalesOrderHistory(this.salesOrderId).subscribe({
      next: (data: any) => {
        this.isLoading = false;
        console.log('API Response:', data); // Debug log

        // Check if data exists and has a data array
        if (data && data.data && Array.isArray(data.data)) {
          this.history = data.data;
          console.log('History loaded:', this.history);

          // Show warning if there's a message issue
          if (data.status === 0 || data.messageNumber === 1001) {
            console.warn('API Message:', data.message);
          }
        } else {
          this.errorMessage = 'Invalid response format - No data array found';
          console.error('Invalid data format:', data);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load purchase order history';
        console.error('Error loading history:', error);
      },
    });
  }

  loadSalesOrderDetails() {
    this.salesOrderService.getSalesOrderById(this.salesOrderId).subscribe({
      next: (data: any) => {
        console.log('Sales Order Response:', data);

        if (data && data.data) {
          this.salesOrder = data.data;
        } else {
          console.warn('No sales order data found in response');
        }
      },
      error: (error) => {
        console.error('Error loading sales order details:', error);
      },
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }
  getStatusColor(status: string): string {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'CREATED':
        return 'bg-blue-500';
      case 'SUBMITTED':
        return 'bg-yellow-500';
      case 'APPROVED':
        return 'bg-green-500';
      case 'RETURNED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  getStatusBadgeColor(status: string): string {
    const statusUpper = status?.toUpperCase();
    switch (statusUpper) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'RETURNED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  goBack() {
    this.router.navigate(['/sales-orders/list']);
  }
}
