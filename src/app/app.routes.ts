import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';
import { AuthLayout } from './layout/authLayout/auth-layout';
import { authGuard } from './pages/apps/security/guards/auth-guard';

export const routes: Routes = [
  // Auth routes (without sidebar)
  {
    path: 'auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/apps/security/login-component/login-component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },

  // Main app routes (with sidebar) - Protected by authGuard
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/apps/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'product-types',
        loadComponent: () =>
          import('./pages/apps/inventory/product-type/product-type').then((m) => m.ProductType),
      },
      {
        path: 'purchase-orders',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/purchase-order-list/purchase-order-list'
          ).then((m) => m.PurchaseOrderList),
      },
      {
        path: 'create-purchase-orders',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/create-purchase-order/create-purchase-order'
          ).then((m) => m.CreatePurchaseOrder),
      },
      {
        path: 'view-purchase-order',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/view-purchase-order/view-purchase-order'
          ).then((m) => m.ViewPurchaseOrder),
      },
      {
        path: 'sales-orders',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/list-sales-order/list-sales-order').then(
            (m) => m.ListSalesOrder
          ),
      },
      {
        path: 'create-sales-order',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/create-sales-order/create-sales-order').then(
            (m) => m.CreateSalesOrder
          ),
      },
      {
        path: 'view-sales-order',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/view-sales-order/view-sales-order').then(
            (m) => m.ViewSalesOrder
          ),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },

  // Redirect root to auth/login
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // Wildcard route
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
