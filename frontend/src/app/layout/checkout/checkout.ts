import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { ICart } from '../../core/models/cart.model';
import { Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { ProfileService } from '../../core/services/profile.service';
import { CommonModule, DOCUMENT } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginService } from '../../core/services/login.service';
import { FormFieldErrorComponent } from '../../core/components/form-field-error/form-field-error.component';
import {
  checkoutValidators,
  fieldInvalid,
  markFormTouched,
  sanitizeCheckoutPayload,
} from '../../core/utils/form-validators.util';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  checkoutForm!: FormGroup;
  cartData!: ICart | null;
  subtotal = 0;
  deliveryFee = 0;
  readonly taxRate = 0.08;
  tax = 0;
  total = 0;
  isProcessing = false;
  paymentMethod: 'cod' | 'stripe' = 'cod';

  private stripeInstance: any = null;
  private cardElement: any = null;
  stripeReady = false;
  stripeCardError = '';

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService,
    private profileService: ProfileService,
    private http: HttpClient,
    private loginService: LoginService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    this.initForm();
    this.prefillShippingFromProfile();
    this.loadStripeScript();
    this.cartService
      .mergeGuestCartAfterAuth()
      .pipe(switchMap(() => this.cartService.getCart()))
      .subscribe({
        next: (res) => {
          this.cartData = res.data;
          if (!this.cartData || this.cartData.products.length === 0) {
            this.toastService.error('Your cart is empty');
            this.router.navigate(['/cart']);
            return;
          }
          this.calculateTotals();
        },
        error: () => {
          this.toastService.error('Failed to load cart');
          this.router.navigate(['/cart']);
        }
      });
  }

  ngOnDestroy() {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
  }

  /** Lazy-load Stripe.js from CDN */
  private loadStripeScript(): void {
    if ((window as any).Stripe) {
      this.stripeInstance = Stripe(environment.stripePublishableKey);
      return;
    }
    const existing = this.document.getElementById('stripe-js-cdn');
    if (existing) return;
    const script = this.document.createElement('script');
    script.id = 'stripe-js-cdn';
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      this.stripeInstance = Stripe(environment.stripePublishableKey);
    };
    this.document.head.appendChild(script);
  }

  private initForm() {
    this.checkoutForm = this.fb.group({
      fullName: ['', checkoutValidators.fullName],
      email: ['', checkoutValidators.email],
      address: ['', checkoutValidators.address],
      city: ['', checkoutValidators.city],
      zip: ['', checkoutValidators.zip],
    });
  }

  invalid(name: string): boolean {
    return fieldInvalid(this.checkoutForm, name);
  }

  private prefillShippingFromProfile(): void {
    try {
      this.profileService.getProfile().subscribe({
        next: (res) => {
          const profile = res.data;
          this.checkoutForm.patchValue({
            fullName: profile.name ?? '',
            email: profile.email ?? '',
            address: profile.address?.[0] ?? '',
            city: profile.address?.[1] ?? '',
            zip: profile.address?.[2] ?? '',
          });
        },
        error: () => {},
      });
    } catch {
      // Guest — checkout is auth-guarded, this should not happen
    }
  }

  private calculateTotals() {
    if (!this.cartData) return;
    this.subtotal = this.cartData.products.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    this.deliveryFee = this.cartData.delivery?.fee || 0;
    this.tax = Math.round(this.subtotal * this.taxRate * 100) / 100;
    this.total = this.subtotal + this.deliveryFee + this.tax;
  }

  setPaymentMethod(method: 'cod' | 'stripe') {
    this.paymentMethod = method;
    if (method === 'stripe') {
      setTimeout(() => this.mountCardElement(), 120);
    } else {
      this.destroyCardElement();
    }
  }

  private mountCardElement(): void {
    this.destroyCardElement();
    if (!this.stripeInstance) {
      this.stripeCardError = 'Stripe failed to load — please refresh and try again.';
      return;
    }
    const elements = this.stripeInstance.elements();
    this.cardElement = elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '15px',
          color: '#1c1c2e',
          fontFamily: '"Outfit", sans-serif',
          '::placeholder': { color: '#9e9e9e' },
        },
        invalid: { color: '#e53935' },
      },
    });
    const container = this.document.getElementById('stripe-card-element');
    if (container) {
      this.cardElement.mount(container);
      this.cardElement.on('ready', () => { this.stripeReady = true; });
      this.cardElement.on('change', (ev: any) => {
        this.stripeCardError = ev.error ? ev.error.message : '';
      });
    }
  }

  private destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.stripeReady = false;
    this.stripeCardError = '';
  }

  placeOrder() {
    if (this.checkoutForm.invalid) {
      markFormTouched(this.checkoutForm);
      this.toastService.error('Please fix the errors in your shipping details.');
      return;
    }

    this.isProcessing = true;

    if (this.paymentMethod === 'stripe') {
      this.processStripePayment();
    } else {
      this.finalizeOrder();
    }
  }

  private processStripePayment(): void {
    if (!this.stripeInstance || !this.cardElement) {
      this.toastService.error('Stripe is not ready yet — please wait a moment and try again.');
      this.isProcessing = false;
      return;
    }

    const token = this.loginService.getToken();
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .post<{ data: { clientSecret: string } }>(
        `${environment.apiURL}payment/create-payment-intent`,
        {},
        { headers }
      )
      .subscribe({
        next: (res) => {
          const clientSecret = res.data.clientSecret;
          this.stripeInstance
            .confirmCardPayment(clientSecret, {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  name: this.checkoutForm.value.fullName,
                  email: this.checkoutForm.value.email,
                },
              },
            })
            .then((result: any) => {
              if (result.error) {
                this.toastService.error(result.error.message || 'Payment failed');
                this.isProcessing = false;
              } else if (result.paymentIntent?.status === 'succeeded') {
                this.toastService.success('Payment confirmed!');
                this.finalizeOrder();
              }
            });
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Failed to create payment — try again.');
          this.isProcessing = false;
        },
      });
  }

  private finalizeOrder() {
    const shipping = sanitizeCheckoutPayload(this.checkoutForm.getRawValue());
    this.cartService.cartCheckout(shipping).subscribe({
      next: () => {
        this.isProcessing = false;
        this.toastService.success('Order placed successfully!');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        this.isProcessing = false;
        this.toastService.error(err.error?.message || 'Checkout failed');
      }
    });
  }
}
