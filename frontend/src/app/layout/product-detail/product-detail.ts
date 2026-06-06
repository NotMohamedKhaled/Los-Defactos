import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductlistService } from '../../core/services/productlist.service';
import { CartService } from '../../core/services/cart.service';
import { IProducts, IProductVariant } from '../../core/models/products.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, RouterLink, RouterModule, ImageUrlPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  product: IProducts | null = null;
  loading = true;
  addedMessage = '';
  selectedColor = '';
  selectedSize = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductlistService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loading = true;
        this.productService.getProductBySlug(slug).subscribe({
          next: (res) => {
            this.product = res.data;
            this.setDefaultSelections();
            this.loading = false;
          },
          error: () => {
            this.loading = false;
          }
        });
      }
    });
  }

  private getVariants(): IProductVariant[] {
    if (!this.product) return [];
    return this.product.variants?.length
      ? this.product.variants
      : [{ color: '', size: '', stock: 0, sku: '' }];
  }

  get availableColors(): string[] {
    if (!this.product) return [];
    if (this.product.colors?.length) return this.product.colors;
    return [...new Set(this.getVariants().map((v) => v.color).filter(Boolean))];
  }

  get availableSizes(): string[] {
    if (!this.product) return [];
    if (this.product.sizes?.length) return this.product.sizes;
    return [...new Set(this.getVariants().map((v) => v.size).filter(Boolean))];
  }

  private setDefaultSelections(): void {
    if (!this.product) return;

    const variants = this.getVariants();
    const inStockVariant = variants.find((v) => v.stock > 0) || variants[0];

    if (this.availableColors.length) {
      const defaultColor =
        this.availableColors.find((c) => this.isColorAvailable(c)) ||
        inStockVariant?.color ||
        this.availableColors[0];
      this.selectedColor = defaultColor;
    } else {
      this.selectedColor = inStockVariant?.color || '';
    }

    if (this.availableSizes.length) {
      const defaultSize =
        this.availableSizes.find((s) => this.isSizeAvailable(s, this.selectedColor)) ||
        inStockVariant?.size ||
        this.availableSizes[0];
      this.selectedSize = defaultSize;
    } else {
      this.selectedSize = inStockVariant?.size || '';
    }
  }

  getVariantStock(color = this.selectedColor, size = this.selectedSize): number {
    const variant = this.getVariants().find(
      (v) => v.color === (color || '') && v.size === (size || '')
    );
    return variant?.stock ?? 0;
  }

  isVariantInStock(color = this.selectedColor, size = this.selectedSize): boolean {
    return this.getVariantStock(color, size) > 0;
  }

  isVariantLowStock(color = this.selectedColor, size = this.selectedSize): boolean {
    const stock = this.getVariantStock(color, size);
    return stock > 0 && stock <= 5;
  }

  /** Color is OOS only when it has no stock in any size. */
  isColorAvailable(color: string): boolean {
    if (!this.availableSizes.length) {
      return this.isVariantInStock(color, '');
    }
    return this.availableSizes.some((size) => this.isVariantInStock(color, size));
  }

  /** Size OOS is evaluated for the active color (or globally when no colors). */
  isSizeAvailable(size: string, color: string = this.selectedColor): boolean {
    if (this.availableColors.length) {
      return this.isVariantInStock(color, size);
    }
    return this.isVariantInStock('', size);
  }

  getColorHex(color: string): string {
    const map: Record<string, string> = {
      black: '#1a1a1a',
      white: '#ffffff',
      red: '#c62828',
      blue: '#1565c0',
      navy: '#1a237e',
      green: '#2e7d32',
      yellow: '#f9a825',
      orange: '#ef6c00',
      pink: '#ec407a',
      purple: '#7b1fa2',
      brown: '#6d4c41',
      beige: '#d7ccc8',
      cream: '#fffdd0',
      grey: '#9e9e9e',
      gray: '#9e9e9e',
      gold: '#c9a227',
      silver: '#bdbdbd',
      maroon: '#800000',
      teal: '#00897b',
      khaki: '#c3b091',
      olive: '#808000',
      coral: '#ff7043',
      burgundy: '#800020',
      tan: '#d2b48c',
      ivory: '#fffff0',
      charcoal: '#36454f',
    };

    const key = color.trim().toLowerCase();
    if (map[key]) return map[key];
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(key)) return key;
    if (/^(rgb|hsl)a?\(/i.test(key)) return color;
    return '#bdbdbd';
  }

  isLightColor(color: string): boolean {
    const hex = this.getColorHex(color).replace('#', '');
    if (hex.length !== 6) return false;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.75;
  }

  get categoryName(): string {
    if (!this.product?.category) return '';
    return typeof this.product.category === 'object'
      ? this.product.category.name
      : '';
  }

  get subCategoryName(): string {
    if (!this.product?.subCategory) return '';
    return typeof this.product.subCategory === 'object'
      ? this.product.subCategory.name
      : '';
  }

  get subCategoryId(): string {
    if (!this.product?.subCategory) return '';
    return typeof this.product.subCategory === 'object'
      ? this.product.subCategory._id
      : this.product.subCategory;
  }

  get categoryQueryParams(): Record<string, string> {
    return this.categoryName ? { category: this.categoryName } : {};
  }

  get subCategoryQueryParams(): Record<string, string> {
    const params: Record<string, string> = {};
    if (this.categoryName) params['category'] = this.categoryName;
    if (this.subCategoryId) params['subCategory'] = this.subCategoryId;
    return params;
  }

  get stockStatusMessage(): string {
    const stock = this.getVariantStock();
    if (stock <= 0) {
      const label = [this.selectedColor, this.selectedSize].filter(Boolean).join(' / ');
      return label ? `Out of Stock for ${label}` : 'Out of Stock';
    }
    if (this.isVariantLowStock()) {
      return `Low Stock — Only ${stock} left!`;
    }
    return `In Stock — ${stock} available`;
  }

  selectColor(color: string): void {
    if (!this.isColorAvailable(color)) return;
    this.selectedColor = color;

    if (this.availableSizes.length && !this.isVariantInStock(color, this.selectedSize)) {
      const availableSize = this.availableSizes.find((size) => this.isVariantInStock(color, size));
      if (availableSize) {
        this.selectedSize = availableSize;
      }
    }
  }

  selectSize(size: string): void {
    if (!this.isSizeAvailable(size, this.selectedColor)) return;
    this.selectedSize = size;
  }

  addToCart() {
    if (!this.product || !this.isVariantInStock()) return;

    this.cartService
      .addToCart(this.product, this.selectedColor || '', this.selectedSize || '')
      .subscribe({
        next: () => {
          this.addedMessage = 'Added to cart!';
          setTimeout(() => (this.addedMessage = ''), 3000);
        },
        error: (err) => {
          this.addedMessage = err?.error?.message || 'Could not add to cart.';
          setTimeout(() => (this.addedMessage = ''), 3000);
        }
      });
  }
}
