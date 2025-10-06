import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  stats = {
    totalValue: 245680,
    totalItems: 1234,
    lowStock: 8,
    monthlyRevenue: 89420,
  };

  recentTransactions = [
    {
      id: 1,
      product: 'iPhone 15 Pro',
      type: 'Stock In',
      quantity: 20,
      amount: 19999,
      time: '2 hours ago',
      isPositive: true,
    },
    {
      id: 2,
      product: 'MacBook Pro M3',
      type: 'Sale',
      quantity: 3,
      amount: 5997,
      time: '5 hours ago',
      isPositive: false,
    },
    {
      id: 3,
      product: 'Purchase Order #PO-2024-145',
      type: 'Received',
      quantity: 0,
      amount: 45000,
      time: '1 day ago',
      isPositive: true,
    },
  ];

  lowStockItems = [
    { name: 'iPhone 15 Pro Max', sku: 'IP15PM-256-BLK', current: 5, minimum: 20 },
    { name: 'AirPods Pro 2', sku: 'APP2-WHT', current: 12, minimum: 30 },
    { name: 'iPad Air M2', sku: 'IPA-M2-128-GRY', current: 8, minimum: 15 },
  ];

  topProducts = [
    {
      name: 'iPhone 15 Pro',
      sku: 'IP15P-128-BLK',
      stock: 87,
      sold: 143,
      revenue: 142857,
      status: 'In Stock',
    },
    {
      name: 'MacBook Air M2',
      sku: 'MBA-M2-256-SLV',
      stock: 34,
      sold: 89,
      revenue: 106710,
      status: 'In Stock',
    },
    {
      name: 'AirPods Pro 2',
      sku: 'APP2-WHT',
      stock: 12,
      sold: 267,
      revenue: 66483,
      status: 'Low Stock',
    },
    {
      name: 'Apple Watch Series 9',
      sku: 'AWS9-45-BLK',
      stock: 56,
      sold: 178,
      revenue: 71022,
      status: 'In Stock',
    },
    {
      name: 'iPad Pro 12.9" M2',
      sku: 'IPP-M2-256-SG',
      stock: 23,
      sold: 67,
      revenue: 73263,
      status: 'In Stock',
    },
  ];
}
