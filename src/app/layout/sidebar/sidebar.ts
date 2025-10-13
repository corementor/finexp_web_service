import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  menuItems = [
    // {
    //   icon: '📊',
    //   label: 'Dashboard',
    //   active: true,
    //   badge: null,
    //   routerLink: '/dashboard',
    // },

    {
      icon: '🗂️',
      label: 'Product Types ',
      active: false,
      badge: '5',
      routerLink: '/product-types',
    },
    {
      icon: '🛒',
      label: 'Purchase Orders',
      active: false,
      badge: '12',
      routerLink: '/purchase-orders',
    },

    {
      icon: '👥',
      label: 'Sales Orders',
      active: false,
      badge: null,
      routerLink: '/sales-orders',
    },
  ];

  onMenuItemClick(item: any) {
    this.selectItem(this.menuItems.indexOf(item));
    // Remove console.log and any navigation logic - let RouterLink handle it
  }

  selectItem(index: number) {
    this.menuItems.forEach((item, i) => {
      item.active = i === index;
    });
  }
}
