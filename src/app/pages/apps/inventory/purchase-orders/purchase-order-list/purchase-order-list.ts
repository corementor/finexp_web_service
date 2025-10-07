import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrderDto } from '../../../../../common/dto/inventory/purchase-order-dto';
import { PurchaseOrderService } from '../service/purchase-order-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-order-list.html',
  styleUrl: './purchase-order-list.css',
})
export class PurchaseOrderList implements OnInit {
  purchaseOrders: PurchaseOrderDto[] = [];
  isLoading = false;

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
}
