import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ICart, ICartResponse, IDelivery, IProductInCart } from '../models/cart.model';
import { IProducts } from '../models/products.model';
import { LoginService } from './login.service';

const GUEST_CART_KEY = 'guest_cart';

interface IGuestCartLine {
  product: Pick<IProducts, '_id' | 'title' | 'price' | 'imgUrl' | 'slug'>;
  quantity: number;
  color: string;
  size: string;
  linePrice: number;
}

interface IGuestCartStored {
  products: IGuestCartLine[];
  delivery: IDelivery;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = environment.apiURL + 'cart';
  private cartUpdated$ = new BehaviorSubject<number>(0);

  constructor(
    private http: HttpClient,
    private loginService: LoginService
  ) {}

  /** Emits total item count whenever the cart changes */
  readonly cartCount$ = this.cartUpdated$.asObservable();

  private isAuthenticatedUser(): boolean {
    return this.loginService.isLoggedInWithRole('user');
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    if (!token) throw new Error('User not logged in');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private emptyCart(): ICart {
    return {
      user: '',
      products: [],
      totalPrice: 0,
      totalItems: 0,
      delivery: { id: null, date: null, fee: 0 },
    };
  }

  private notifyCartUpdate(cart: ICart): void {
    const count = cart.products?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    this.cartUpdated$.next(count);
  }

  private variantKey(productId: string, color: string, size: string): string {
    return `${productId}::${color}::${size}`;
  }

  private resolveLinePrice(product: IProducts, color: string, size: string): number {
    const variant = product.variants?.find(
      (v) => v.color === (color || '') && v.size === (size || '')
    );
    return variant?.price ?? product.price;
  }

  private readGuestStored(): IGuestCartStored {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return { products: [], delivery: { id: null, date: null, fee: 0 } };
      const parsed = JSON.parse(raw) as IGuestCartStored;
      return {
        products: parsed.products ?? [],
        delivery: parsed.delivery ?? { id: null, date: null, fee: 0 },
      };
    } catch {
      return { products: [], delivery: { id: null, date: null, fee: 0 } };
    }
  }

  private guestStoredToICart(stored: IGuestCartStored): ICart {
    const products: IProductInCart[] = stored.products.map((line) => ({
      product: { ...line.product, desc: '', keywords: [], tags: [], stock: 0, isInStock: true, isAboutToBeOut: false, colors: [], sizes: [], specs: [], variants: [], isDeleted: false } as IProducts,
      quantity: line.quantity,
      color: line.color,
      size: line.size,
    }));

    const cart: ICart = {
      user: '',
      products,
      totalPrice: stored.products.reduce((sum, l) => sum + l.linePrice * l.quantity, 0),
      totalItems: stored.products.reduce((sum, l) => sum + l.quantity, 0),
      delivery: stored.delivery,
    };
    return cart;
  }

  private writeGuestFromICart(cart: ICart): void {
    const stored: IGuestCartStored = {
      products: cart.products.map((item) => ({
        product: {
          _id: item.product._id,
          title: item.product.title,
          price: item.product.price,
          imgUrl: item.product.imgUrl,
          slug: item.product.slug,
        },
        quantity: item.quantity,
        color: item.color || '',
        size: item.size || '',
        linePrice: item.product.price,
      })),
      delivery: cart.delivery,
    };
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(stored));
    this.notifyCartUpdate(cart);
  }

  clearGuestCart(): void {
    localStorage.removeItem(GUEST_CART_KEY);
    this.cartUpdated$.next(0);
  }

  hasGuestCart(): boolean {
    const stored = this.readGuestStored();
    return stored.products.length > 0;
  }

  getCart(): Observable<ICartResponse> {
    if (this.isAuthenticatedUser()) {
      return this.http.get<ICartResponse>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
        tap((res) => this.notifyCartUpdate(res.data))
      );
    }

    const cart = this.guestStoredToICart(this.readGuestStored());
    this.notifyCartUpdate(cart);
    return of({ message: 'Guest cart', data: cart });
  }

  addToCart(product: IProducts, color = '', size = ''): Observable<ICartResponse> {
    if (this.isAuthenticatedUser()) {
      return this.http
        .post<ICartResponse>(`${this.apiUrl}/${product._id}`, { color, size }, { headers: this.getAuthHeaders() })
        .pipe(
          switchMap(() => this.getCart()),
          tap((res) => this.notifyCartUpdate(res.data))
        );
    }

    const stored = this.readGuestStored();
    const linePrice = this.resolveLinePrice(product, color, size);
    const key = this.variantKey(product._id, color, size);
    const existing = stored.products.find(
      (l) => this.variantKey(l.product._id, l.color, l.size) === key
    );

    if (existing) {
      existing.quantity += 1;
    } else {
      stored.products.push({
        product: {
          _id: product._id,
          title: product.title,
          price: product.price,
          imgUrl: product.imgUrl,
          slug: product.slug,
        },
        quantity: 1,
        color: color || '',
        size: size || '',
        linePrice,
      });
    }

    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(stored));
    const cart = this.guestStoredToICart(stored);
    this.notifyCartUpdate(cart);
    return of({ message: 'Added to guest cart', data: cart });
  }

  private formatCartForMerge(cart: ICart) {
    const delivery = this.resolveDeliveryForSync(cart.delivery);
    return {
      products: cart.products.map((item) => ({
        product: typeof item.product === 'object' ? item.product._id : item.product,
        quantity: item.quantity,
        price: item.product?.price ?? 0,
        color: item.color || '',
        size: item.size || '',
      })),
      delivery,
    };
  }

  private resolveDeliveryForSync(delivery: IDelivery): IDelivery {
    if (delivery?.id) {
      return {
        id: delivery.id,
        date: delivery.date,
        fee: delivery.fee ?? 0,
      };
    }
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 7);
    return {
      id: 'option1',
      date: arrival.toISOString(),
      fee: 0,
    };
  }

  syncCartToBackend(cart: ICart): Observable<ICartResponse> {
    if (!this.isAuthenticatedUser()) {
      this.writeGuestFromICart(cart);
      return of({ message: 'Guest cart saved locally', data: cart });
    }

    return this.http
      .post<ICartResponse>(`${this.apiUrl}/merge`, this.formatCartForMerge(cart), {
        headers: this.getAuthHeaders(),
      })
      .pipe(tap((res) => this.notifyCartUpdate(res.data)));
  }

  deleteFromCart(productId: string, color = '', size = ''): Observable<ICartResponse> {
    if (this.isAuthenticatedUser()) {
      return this.http
        .delete<ICartResponse>(`${this.apiUrl}/${productId}`, { headers: this.getAuthHeaders() })
        .pipe(switchMap(() => this.getCart()));
    }

    const stored = this.readGuestStored();
    const key = this.variantKey(productId, color, size);
    stored.products = stored.products.filter(
      (l) => this.variantKey(l.product._id, l.color, l.size) !== key
    );
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(stored));
    const cart = this.guestStoredToICart(stored);
    this.notifyCartUpdate(cart);
    return of({ message: 'Removed from guest cart', data: cart });
  }

  /** After login/signup: merge local guest cart into the user's server cart */
  mergeGuestCartAfterAuth(): Observable<ICartResponse> {
    if (!this.isAuthenticatedUser()) {
      return this.getCart();
    }

    const stored = this.readGuestStored();
    if (!stored.products.length) {
      return this.getCart();
    }

    const guestCart = this.guestStoredToICart(stored);

    return this.http.get<ICartResponse>(this.apiUrl, { headers: this.getAuthHeaders() }).pipe(
      switchMap((res) => {
        const merged = this.combineCarts(res.data, guestCart);
        return this.syncCartToBackend(merged);
      }),
      tap(() => this.clearGuestCart()),
      switchMap(() => this.getCart())
    );
  }

  private combineCarts(serverCart: ICart, guestCart: ICart): ICart {
    const lines: IProductInCart[] = serverCart.products.map((item) => ({ ...item }));

    for (const guestLine of guestCart.products) {
      const gColor = guestLine.color || '';
      const gSize = guestLine.size || '';
      const key = this.variantKey(guestLine.product._id, gColor, gSize);
      const existing = lines.find(
        (l) => this.variantKey(l.product._id, l.color || '', l.size || '') === key
      );

      if (existing) {
        existing.quantity += guestLine.quantity;
      } else {
        lines.push({ ...guestLine });
      }
    }

    const delivery =
      guestCart.delivery?.id && guestCart.delivery.id !== null
        ? guestCart.delivery
        : serverCart.delivery;

    return { ...serverCart, products: lines, delivery };
  }

  cartCheckout(shipping?: {
    fullName: string;
    email: string;
    address: string;
    city: string;
    zip: string;
    phone?: string;
  }): Observable<unknown> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/checkout`, shipping ?? {}, { headers });
  }

  refreshCartCount(): void {
    this.getCart().subscribe({
      next: (res) => this.notifyCartUpdate(res.data),
      error: () => this.cartUpdated$.next(0),
    });
  }
}
