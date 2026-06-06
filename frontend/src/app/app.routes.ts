import { Routes } from '@angular/router';

// layout (user) components
import { Layout } from './layout/layout';
import { Home } from './layout/home/home';
import { Productslist } from './layout/productslist/productslist';
import { Cart } from './layout/cart/cart';
import { Orders } from './layout/orders/orders';
import { Profile } from './layout/profile/profile';
import { ProductDetail } from './layout/product-detail/product-detail';
import { CheckoutComponent } from './layout/checkout/checkout';

// admin components
import { Dashboard } from './admin/dashboard/dashboard';
import { Users as AdminUsers } from './admin/users/users';
import { Orders as AdminOrders } from './admin/orders/orders';
import { Products as AdminProducts } from './admin/products/products';
import { Faq as AdminFaq } from './admin/faq/faq';
import { Testimonials as AdminTestimonials } from './admin/testimonials/testimonials';
import { AdminCategoriesComponent } from './admin/categories/categories';
import { AdminSubcategoriesComponent } from './admin/subcategories/subcategories';

// auth components
import { Login } from './auth/login/login';
import { Signup } from './auth/signup/signup';

// not found
import { Notfound } from './notfound/notfound';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { Admin } from './admin/admin';

export const routes: Routes = [
  // ============= USER AREA =============
  {
    path: '',
    component: Layout,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'products', component: Productslist },
      { path: 'cart', component: Cart },
      { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },
      { path: 'orders', component: Orders, canActivate: [authGuard] },
      { path: 'profile', component: Profile, canActivate: [authGuard] },
      { path: 'product/:slug', component: ProductDetail },
    ],
  },

  // ============= ADMIN AREA =============
  {
    path: 'dashboard',
    component:Admin,
    canActivate: [adminGuard],
    children: [
      { path: '', component: Dashboard }, // Default dashboard page
      { path: 'users', component: AdminUsers },
      { path: 'orders', component: AdminOrders },
      { path: 'products', component: AdminProducts },
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'subcategories', component: AdminSubcategoriesComponent },
      { path: 'faq', component: AdminFaq },
      { path: 'testimonials', component: AdminTestimonials },
    ],
  },

  // ============= AUTH ROUTES =============
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },

  // ============= NOT FOUND =============
  { path: '**', component: Notfound },
];
