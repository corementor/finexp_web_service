import { Routes } from '@angular/router';
import { ManageProductTypes } from './pages/apps/inventory/product-type/product-type';
// import { PurchaseOrder } from './pages/apps/inventory/purchase-order/purchase-order';
import { ProductOrderItem } from './pages/apps/inventory/product-order-item/product-order-item';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  //dashboard route
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/apps/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard - FinExp',
  },

  //product order route

  { path: 'product-order-items', component: ProductOrderItem },

  //product type route
  {
    path: 'product-types',
    loadComponent: () =>
      import('./pages/apps/inventory/product-type/product-type').then((m) => m.ManageProductTypes),
    title: 'Product Types - FinExp',
  },
  //purchase order routes
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./pages/apps/inventory/purchase-orders/purchase-order-list/purchase-order-list').then(
        (m) => m.PurchaseOrderList
      ),
    title: 'Purchase Orders - FinExp',
  },
  //create purchase order route
  {
    path: 'create-purchase-orders',
    loadComponent: () =>
      import(
        './pages/apps/inventory/purchase-orders/create-purchase-order/create-purchase-order'
      ).then((m) => m.CreatePurchaseOrder),
    title: 'Purchase Orders - FinExp',
  },
  //view purchase order route
  {
    path: 'view-purchase-order',
    loadComponent: () =>
      import('./pages/apps/inventory/purchase-orders/view-purchase-order/view-purchase-order').then(
        (m) => m.ViewPurchaseOrder
      ),
    title: 'Purchase Orders - FinExp',
  },

  //sales order routes
  //sales order list route
  {
    path: 'sales-orders',
    loadComponent: () =>
      import('../app/pages/apps/inventory/salesOrder/list-sales-order/list-sales-order').then(
        (m) => m.ListSalesOrder
      ),
    title: 'Sales Orders - FinExp',
  },
  //create sales order route
  {
    path: 'create-sales-order',
    loadComponent: () =>
      import('../app/pages/apps/inventory/salesOrder/create-sales-order/create-sales-order').then(
        (m) => m.CreateSalesOrder
      ),
    title: 'Create Sales Order - FinExp',
  },
  //view sales order route
  {
    path: 'view-sales-order',
    loadComponent: () =>
      import('../app/pages/apps/inventory/salesOrder/view-sales-order/view-sales-order').then(
        (m) => m.ViewSalesOrder
      ),
    title: 'View Sales Order - FinExp',
  },
];
