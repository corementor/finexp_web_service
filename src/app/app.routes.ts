import { Routes } from '@angular/router';
import { ProductType } from './pages/apps/inventory/product-type/product-type';
// import { PurchaseOrder } from './pages/apps/inventory/purchase-order/purchase-order';
import { ProductOrderItem } from './pages/apps/inventory/product-order-item/product-order-item';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/apps/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard - FinExp',
  },

  { path: 'product-order-items', component: ProductOrderItem },
  {
    path: 'product-types',
    loadComponent: () =>
      import('./pages/apps/inventory/product-type/product-type').then((m) => m.ProductType),
    title: 'Product Types - FinExp',
  },
  {
    path: 'purchase-orders',
    loadComponent: () =>
      import('./pages/apps/inventory/purchase-orders/purchase-order-list/purchase-order-list').then(
        (m) => m.PurchaseOrderList
      ),
    title: 'Purchase Orders - FinExp',
  },
  {
    path: 'create-purchase-orders',
    loadComponent: () =>
      import(
        './pages/apps/inventory/purchase-orders/create-purchase-order/create-purchase-order'
      ).then((m) => m.CreatePurchaseOrder),
    title: 'Purchase Orders - FinExp',
  },
  {
    path: 'view-purchase-order',
    loadComponent: () =>
      import('./pages/apps/inventory/purchase-orders/view-purchase-order/view-purchase-order').then(
        (m) => m.ViewPurchaseOrder
      ),
    title: 'Purchase Orders - FinExp',
  },
];
