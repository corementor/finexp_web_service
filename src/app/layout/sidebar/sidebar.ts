import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../pages/apps/security/service/auth-service';
import { Subscription } from 'rxjs';
import { PurchaseOrderService } from '../../pages/apps/inventory/purchase-orders/service/purchase-order-service';
import { SalesOrderService } from '../../pages/apps/inventory/salesOrder/service/sales-order-service';

interface MenuItem {
  icon: string;
  label: string;
  active: boolean;
  badge?: string | null;
  routerLink: string;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit, OnDestroy {
  private userSubscription?: Subscription;
  currentUserRole: string = '';

  allMenuItems: MenuItem[] = [
    {
      icon: '📊',
      label: 'Dashboard',
      active: false,
      badge: null,
      routerLink: '/dashboard',
      roles: ['ADMIN', 'STOCK_OFFICER', 'MANAGER', 'SALES_OFFICER'],
    },
    {
      icon: '🗂️',
      label: 'Product Types',
      active: false,
      badge: null,
      routerLink: '/product-types',
      roles: ['ADMIN', 'STOCK_OFFICER', 'MANAGER'],
    },
    {
      icon: '🛒',
      label: 'Purchase Orders',
      active: false,
      badge: null,
      routerLink: '/purchase-orders/list',
      roles: ['ADMIN', 'STOCK_OFFICER', 'MANAGER'],
    },
    {
      icon: '📦',
      label: 'Sales Orders',
      active: false,
      badge: null,
      routerLink: '/sales-orders/list',
      roles: ['ADMIN', 'SALES_OFFICER', 'MANAGER'],
    },
    {
      icon: '👤',
      label: 'Users',
      active: false,
      badge: null,
      routerLink: '/usermanagement/list',
      roles: ['ADMIN'],
    },
    // {
    //   icon: '📈',
    //   label: 'Reports',
    //   active: false,
    //   badge: null,
    //   routerLink: '/reports',
    //   roles: ['ADMIN', 'MANAGER'], // Admin and Manager only
    // },
    // {
    //   icon: '⚙️',
    //   label: 'Settings',
    //   active: false,
    //   badge: null,
    //   routerLink: '/settings',
    //   roles: ['ADMIN'], // Admin only
    // },
  ];

  // Filtered menu items based on user role
  menuItems: MenuItem[] = [];

  pendingApprovals: number = 0;
  pendingOrders: number = 0;
  pendingSalesApprovals: number = 0;

  constructor(
    private authService: AuthService,
    private purchaseOrderService: PurchaseOrderService,
    private salesOrderService: SalesOrderService
  ) {}

  ngOnInit() {
    // Subscribe to current user changes
    this.userSubscription = this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUserRole = user?.role || '';
        this.filterMenuItemsByRole();
      } else {
        // If no user, show empty menu or default items
        this.menuItems = [];
      }
    });

    // Also check on initial load
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.currentUserRole = currentUser?.role || '';
      this.filterMenuItemsByRole();
    }

    this.loadDynamicBadges();
  }

  ngOnDestroy() {
    // Clean up subscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  /**
   * Filter menu items based on user role
   */
  filterMenuItemsByRole() {
    this.menuItems = this.allMenuItems.filter((item) => item.roles.includes(this.currentUserRole));
  }

  onMenuItemClick(item: MenuItem) {
    this.selectItem(this.menuItems.indexOf(item));
  }

  selectItem(index: number) {
    this.menuItems.forEach((item, i) => {
      item.active = i === index;
    });
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.currentUserRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUserRole);
  }

  getUserDisplayName(): string {
    return this.authService.getCurrentUser()?.fullName || 'User';
  }
  loadDynamicBadges() {
    if (this.hasRole('ADMIN')) {
      // Load pending approvals count for admin
      this.purchaseOrderService.getPurchaseOrders().subscribe({
        next: (response: any) => {
          if (response.data) {
            const orders = response.data;
            this.pendingApprovals = orders.filter(
              (order: any) => order.status === 'SUBMITTED'
            ).length;

            // Update badge for Purchase Orders menu item
            const poMenuItem = this.menuItems.find(
              (item) => item.routerLink === '/purchase-orders/list'
            );
            if (poMenuItem) {
              poMenuItem.badge =
                this.pendingApprovals > 0 ? this.pendingApprovals.toString() : null;
            }
          }
        },
      });
      // Load pending sales approvals count for admin (Sales Orders)
      this.salesOrderService.getSalesOrders().subscribe({
        next: (response: any) => {
          console.log('Sales Orders Response:', response); // Debug log
          if (response && response.data) {
            const salesOrders = response.data;
            this.pendingSalesApprovals = salesOrders.filter(
              (order: any) => order.status === 'SUBMITTED'
            ).length;

            console.log('Pending Sales Order Approvals:', this.pendingSalesApprovals); // Debug log

            // Update badge for Sales Orders menu item
            const soMenuItem = this.menuItems.find(
              (item) => item.routerLink === '/sales-orders/list'
            );
            if (soMenuItem) {
              soMenuItem.badge =
                this.pendingSalesApprovals > 0 ? this.pendingSalesApprovals.toString() : null;
              console.log('Sales Order Badge Set:', soMenuItem.badge); // Debug log
            } else {
              console.warn('Sales Order menu item not found'); // Debug log
            }
          } else {
            console.warn('No sales orders data in response'); // Debug log
          }
        },
        error: (error) => {
          console.error('Error loading sales order badges:', error);
        },
      });
    }
  }
}
