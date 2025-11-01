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
        path: 'purchase-orders/list',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/purchase-order-list/purchase-order-list'
          ).then((m) => m.PurchaseOrderList),
      },
      {
        path: 'purchase-orders/create-purchase-orders',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/create-purchase-order/create-purchase-order'
          ).then((m) => m.CreatePurchaseOrder),
      },
      {
        path: 'purchase-orders/view-purchase-order',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/view-purchase-order/view-purchase-order'
          ).then((m) => m.ViewPurchaseOrder),
      },
      {
        path: 'purchase-orders/purchase-order-history/:id',
        loadComponent: () =>
          import(
            './pages/apps/inventory/purchase-orders/purchase-order-history/purchase-order-history'
          ).then((m) => m.PurchaseOrderHistory),
      },
      {
        path: 'sales-orders/sales-order-history/:id',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/sales-order-history/sales-order-history').then(
            (m) => m.SalesOrderHistory
          ),
      },

      {
        path: 'sales-orders/list',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/list-sales-order/list-sales-order').then(
            (m) => m.ListSalesOrder
          ),
      },
      {
        path: 'sales-orders/create-sales-order',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/create-sales-order/create-sales-order').then(
            (m) => m.CreateSalesOrder
          ),
      },
      {
        path: 'sales-orders/view-sales-order',
        loadComponent: () =>
          import('./pages/apps/inventory/salesOrder/view-sales-order/view-sales-order').then(
            (m) => m.ViewSalesOrder
          ),
      },

      {
        path: 'usermanagement/list',
        loadComponent: () =>
          import('./pages/apps/usermanagement/list-user/list-user').then((m) => m.ListUser),
      },
      {
        path: 'usermanagement/create-user',
        loadComponent: () =>
          import('./pages/apps/usermanagement/create-user/create-user').then((m) => m.CreateUser),
      },
      {
        path: 'usermanagement/view-user/:id',
        loadComponent: () =>
          import('./pages/apps/usermanagement/view-user/view-user').then((m) => m.ViewUser),
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
