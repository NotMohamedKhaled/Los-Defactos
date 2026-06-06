import { Component, Input } from '@angular/core';
import { IProducts } from '../../../core/models/products.model';
import { CartService } from '../../../core/services/cart.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterModule, ImageUrlPipe],
  templateUrl: './product.html',
  styleUrl: './product.css'
})
export class Product {
  @Input() myProd!:IProducts
  isAdding = false;

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastService: ToastService
  ) {}

  get needsVariantSelection(): boolean {
    const colors = this.myProd.colors?.filter(Boolean) ?? [];
    const sizes = this.myProd.sizes?.filter(Boolean) ?? [];
    return colors.length > 1 || sizes.length > 1;
  }

  get cartButtonLabel(): string {
    if (this.isAdding) return 'Adding...';
    if (!this.myProd.isInStock) return 'Out of Stock';
    return this.needsVariantSelection ? 'Choose Options' : 'Add to Cart';
  }

  private getVariants() {
    return this.myProd.variants?.length
      ? this.myProd.variants
      : [{ color: '', size: '', stock: this.myProd.stock ?? 0, sku: '' }];
  }

  private resolveDefaultVariant(): { color: string; size: string } | null {
    const inStock = this.getVariants().find((v) => v.stock > 0);
    if (!inStock) return null;
    return { color: inStock.color || '', size: inStock.size || '' };
  }

  addItemToCart(_productId: string) {
    if (!this.myProd.isInStock) {
      this.toastService.error('This product is currently out of stock.');
      return;
    }

    if (this.needsVariantSelection) {
      this.toastService.info('Select a color and size on the product page.');
      this.router.navigate(['/product', this.myProd.slug]);
      return;
    }

    const variant = this.resolveDefaultVariant();
    if (!variant) {
      this.toastService.error('This product is currently out of stock.');
      return;
    }

    this.isAdding = true;
    this.cartService
      .addToCart(this.myProd, variant.color || '', variant.size || '')
      .subscribe({
        next: () => {
          this.isAdding = false;
          this.toastService.success(`Added "${this.myProd.title}" to cart!`);
        },
        error: (err) => {
          this.isAdding = false;
          this.toastService.error(err?.error?.message || 'Failed to add item to cart. Please try again.');
          console.error(err);
        }
      });
  }
}
