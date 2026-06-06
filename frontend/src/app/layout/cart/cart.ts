import { Component, OnInit, OnDestroy } from '@angular/core';
import { CartService } from '../../core/services/cart.service';
import { ICart, IDelivery, IProductInCart } from '../../core/models/cart.model';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { LoginService } from '../../core/services/login.service';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  imports: [CommonModule, RouterLink, ImageUrlPipe]
})
export class Cart implements OnInit, OnDestroy {
  cartData!: ICart;
  subtotal = 0;
  deliveryFee = 0;
  total = 0;
  private subs = new Subscription();
  deliveryOptions!: IDelivery[];

  constructor(
    private cartService: CartService,
    private loginService: LoginService,
    private router: Router,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.generateDeliveryOptions();

    // ✅ Always load cart fresh from backend
    this.subs.add(
      this.cartService.getCart().subscribe({
        next: res => {
          this.cartData = res.data;
          if (this.ensureDefaultDelivery()) {
            this.syncCartSilently();
          }
          this.recalculateTotals();
        },
        error: err => {
          console.error('Error fetching cart:', err);
          this.toastService.error('Failed to load cart');
        }
      })
    );
  }

  ngOnDestroy() {
    if (this.cartData) {
      this.ensureDefaultDelivery();
      this.subs.add(
        this.cartService.syncCartToBackend(this.cartData).subscribe({
          error: () => {},
        })
      );
    }
  }

  generateDeliveryOptions() {
    const now = new Date();
    const buildOption = (id: string, label: string, days: number, fee: number): IDelivery => {
      const arrival = new Date(now);
      arrival.setDate(now.getDate() + days);
      return {
        id,
        label,
        etaDays: days,
        date: arrival.toISOString(),
        dateLabel: arrival.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        }),
        fee,
      };
    };
    this.deliveryOptions = [
      buildOption('option1', 'Standard Delivery', 7, 0),
      buildOption('option2', 'Express Delivery', 3, 4.99),
      buildOption('option3', 'Next-Day Delivery', 1, 9.99),
    ];
  }

  /** Persist first delivery option when cart has none (UI showed default but DB did not). */
  private ensureDefaultDelivery(): boolean {
    if (!this.cartData || this.cartData.delivery?.id) return false;
    if (!this.deliveryOptions?.length) return false;

    const defaultOption = this.deliveryOptions[0];
    this.cartData.delivery = { ...defaultOption };
    this.deliveryFee = defaultOption.fee ?? 0;
    return true;
  }

  private syncCartSilently(): void {
    if (!this.cartData) return;
    this.subs.add(
      this.cartService.syncCartToBackend(this.cartData).subscribe({
        error: (err) => {
          console.error('Error syncing cart:', err);
          this.toastService.error(err?.error?.message || 'Failed to update cart');
        },
      })
    );
  }

  formatDeliveryFee(fee: number): string {
    return fee === 0 ? 'FREE' : `$${fee.toFixed(2)}`;
  }

  updateQuantity(item: IProductInCart, newQuantity: number) {
    if(newQuantity < 1) return;
    item.quantity = newQuantity;
    this.recalculateTotals();
    this.updateCart();
  }

  deleteItem(item: IProductInCart) {
    if (!this.cartData) return;

    const productId = item.product._id;
    const color = item.color || '';
    const size = item.size || '';

    this.cartService.deleteFromCart(productId, color, size).subscribe({
      next: (res) => {
        this.cartData = res.data;
        this.recalculateTotals();
        this.toastService.info('Item removed from cart');
      },
      error: (err) => {
        console.error('❌ Error deleting product:', err);
        this.toastService.error('Failed to remove item');
      }
    });
  }

  selectDelivery(option: IDelivery) {
    this.cartData.delivery = option;
    this.deliveryFee = option.fee || 0;
    this.recalculateTotals();
    this.updateCart();
  }

  recalculateTotals() {
    this.subtotal = this.cartData.products.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    this.deliveryFee = this.cartData.delivery?.fee || 0;
    this.total = this.subtotal + this.deliveryFee;
  }

  updateCart() {
    if (!this.cartData) return;
    this.ensureDefaultDelivery();

    this.subs.add(
      this.cartService.syncCartToBackend(this.cartData).subscribe({
        error: (err) => {
          console.error('Error syncing cart:', err);
          this.toastService.error(err?.error?.message || 'Failed to update cart quantity');
          this.cartService.getCart().subscribe({
            next: (res) => {
              this.cartData = res.data;
              this.recalculateTotals();
            },
          });
        },
      })
    );
  }

  checkout() {
    if (!this.cartData.products || this.cartData.products.length === 0) {
      this.toastService.error('Your cart is empty');
      return;
    }
    if (this.loginService.isLoggedInWithRole('admin')) {
      this.toastService.error('Admin cannot checkout');
      return;
    }

    this.ensureDefaultDelivery();

    if (!this.loginService.isLoggedInWithRole('user')) {
      this.cartService.syncCartToBackend(this.cartData).subscribe({
        next: () => {
          this.toastService.info('Please sign in to complete your order.');
          this.router.navigate(['/login'], { queryParams: { returnUrl: '/checkout' } });
        },
      });
      return;
    }

    this.cartService.syncCartToBackend(this.cartData).subscribe({
      next: () => this.router.navigate(['/checkout']),
      error: () => this.toastService.error('Failed to sync cart before checkout'),
    });
  }
}
