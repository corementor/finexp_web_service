import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseOrderHistoryDto } from '../../../../../common/dto/inventory/purchase-order-history';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { CommonModule } from '@angular/common';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { Location } from '@angular/common';

@Component({
  selector: 'app-purchase-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-order-history.html',
  styleUrl: './purchase-order-history.css',
})
export class PurchaseOrderHistory implements OnInit {
  purchaseOrderId: string;
  history: PurchaseOrderHistoryDto[] = [];
  purchaseOrder: PurchaseOrderDto | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private purchaseOrderService: PurchaseOrderService
  ) {
    this.purchaseOrderId = this.route.snapshot.paramMap.get('id') || '';
  }

  ngOnInit() {
    if (this.purchaseOrderId) {
      this.loadPurchaseOrderHistory();
      this.loadPurchaseOrderDetails();
    } else {
      this.errorMessage = 'No purchase order ID provided';
    }
  }

  loadPurchaseOrderDetails() {
    this.purchaseOrderService.getPurchaseOrderById(this.purchaseOrderId).subscribe({
      next: (data: any) => {
        console.log('Purchase Order Response:', data);

        if (data && data.data) {
          this.purchaseOrder = data.data;
        } else {
          console.warn('No purchase order data found in response');
        }
      },
      error: (error) => {
        console.error('Error loading purchase order details:', error);
      },
    });
  }

  loadPurchaseOrderHistory() {
    this.isLoading = true;
    this.errorMessage = '';

    this.purchaseOrderService.getPurchaseOrderHistory(this.purchaseOrderId).subscribe({
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
    this.router.navigate(['/purchase-orders/list']);
  }
}
