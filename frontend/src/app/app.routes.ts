import { Routes } from '@angular/router';
import { Menu } from './pages/menu/menu';
import { Cart } from './pages/cart/cart';
import { Checkout } from './pages/checkout/checkout';
import { Admin } from './pages/admin/admin';
import { OrderTracking } from './pages/order-tracking/order-tracking';
import { Login } from './pages/login/login';
import { AuthGuard, AdminGuard, UserGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', component: Menu },
  { path: 'cart', component: Cart, canActivate: [UserGuard] },
  { path: 'checkout', component: Checkout, canActivate: [UserGuard] },
  { path: 'admin', component: Admin, canActivate: [AdminGuard] },
  { path: 'track', component: OrderTracking, canActivate: [UserGuard] },
  { path: '**', redirectTo: '' },
];
