import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../core/services/login.service';
import { ProductlistService } from '../../core/services/productlist.service';
import { OrderService } from '../../core/services/order.servicets';
import { ToastService } from '../../core/services/toast.service';
import { IProducts, IProductVariant } from '../../core/models/products.model';
import { IOrder } from '../../core/models/order.model';
import { sortByLatest } from '../shared/admin-sort.util';
import { environment } from '../../../environments/environment';
import { AdminModalBackdropDirective } from '../shared/admin-modal-backdrop.directive';
import { getOrderAddressView } from '../../core/utils/order-address.util';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, CommonModule, AdminModalBackdropDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css', '../shared/admin-modal.css']
})
export class Dashboard implements OnInit {
  products: IProducts[] = [];
  orders: IOrder[] = [];
  loadingProducts = false;
  loadingOrders = false;

  showRestockModal = false;
  restockTarget: IProducts | null = null;
  restockVariantMatrix: IProductVariant[] = [];

  readonly productPageSize = 8;
  readonly orderPageSize = 5;
  productPage = 1;
  selectedOrder: IOrder | null = null;
  showAddressInModal = false;
  staticUrl = environment.staticURL;
  
  orderPage = 1;

  constructor(
    private loginService: LoginService,
    private productService: ProductlistService,
    private orderService: OrderService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadOrders();
  }

  get isLoggedIn(): boolean {
    return this.loginService.isLoggedInWithRole('user');
  }

  logout(): void {
    this.loginService.logout();
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.adminGetAll().subscribe({
      next: (res) => {
        this.products = sortByLatest(res.data.filter((p) => !p.isDeleted));
        this.productPage = 1;
        this.loadingProducts = false;
      },
      error: () => {
        this.loadingProducts = false;
        this.toastService.error('Failed to load products');
      }
    });
  }

  loadOrders(): void {
    this.loadingOrders = true;
    this.orderService.adminGetAllOrders().subscribe({
      next: (res) => {
        this.orders = sortByLatest(res.data.filter((o) => !o.isDeleted));
        this.orderPage = 1;
        this.loadingOrders = false;
      },
      error: () => {
        this.loadingOrders = false;
        this.toastService.error('Failed to load orders');
      }
    });
  }

  get orderCount(): number {
    return this.orders.length;
  }

  totalStock(product: IProducts): number {
    if (product.variants?.length) {
      return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
    }
    return Number(product.stock) || 0;
  }

  isLowStock(product: IProducts): boolean {
    const total = this.totalStock(product);
    if (total === 0) return false;
    if (total <= 5) return true;
    return (product.variants || []).some((v) => {
      const stock = Number(v.stock) || 0;
      return stock > 0 && stock <= 5;
    });
  }

  isOutOfStock(product: IProducts): boolean {
    return this.totalStock(product) === 0;
  }

  get lowStockCount(): number {
    return this.products.filter((p) => this.isLowStock(p)).length;
  }

  get outOfStockCount(): number {
    return this.products.filter((p) => this.isOutOfStock(p)).length;
  }

  get paginatedProducts(): IProducts[] {
    const start = (this.productPage - 1) * this.productPageSize;
    return this.products.slice(start, start + this.productPageSize);
  }

  get productTotalPages(): number {
    return Math.max(1, Math.ceil(this.products.length / this.productPageSize));
  }

  get paginatedOrders(): IOrder[] {
    const start = (this.orderPage - 1) * this.orderPageSize;
    return this.orders.slice(start, start + this.orderPageSize);
  }

  get orderTotalPages(): number {
    return Math.max(1, Math.ceil(this.orders.length / this.orderPageSize));
  }

  prevProductPage(): void {
    if (this.productPage > 1) this.productPage--;
  }

  nextProductPage(): void {
    if (this.productPage < this.productTotalPages) this.productPage++;
  }

  prevOrderPage(): void {
    if (this.orderPage > 1) this.orderPage--;
  }

  nextOrderPage(): void {
    if (this.orderPage < this.orderTotalPages) this.orderPage++;
  }

  primarySku(product: IProducts): string {
    return product.variants?.[0]?.sku || '—';
  }

  getProductStatus(product: IProducts): { label: string; class: string } {
    if (product.isDeleted) {
      return { label: 'Deleted', class: 'bg-surface-variant text-on-surface-variant' };
    }
    if (this.isOutOfStock(product)) {
      return { label: 'Out of Stock', class: 'bg-surface-variant text-on-surface-variant' };
    }
    if (this.isLowStock(product)) {
      return { label: 'Low Stock', class: 'bg-error-container text-on-error-container' };
    }
    return { label: 'Active', class: 'bg-primary-fixed text-primary' };
  }

  getOrderProgress(status: IOrder['orderStat']): number {
    const map: Record<IOrder['orderStat'], number> = {
      pending: 25,
      preparing: 50,
      shipping: 75,
      recieved: 90,
      delivered: 100,
      cancelled: 100,
      'rejected by admin': 100
    };
    return map[status] ?? 25;
  }

  getOrderProgressClass(status: IOrder['orderStat']): string {
    if (status === 'cancelled' || status === 'rejected by admin') return 'bg-error-container';
    if (status === 'delivered' || status === 'recieved') return 'bg-outline';
    if (status === 'pending') return 'bg-sale-red';
    return 'bg-primary';
  }

  getOrderItemCount(order: IOrder): number {
    return order.products?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }

  getVariantLabel(variant: IProductVariant): string {
    if (variant.color && variant.size) return `${variant.color} / ${variant.size}`;
    if (variant.color) return variant.color;
    if (variant.size) return variant.size;
    return 'Default';
  }


   get restockTotalStock(): number {
    return this.restockVariantMatrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  openRestockModal(product: IProducts): void {
    this.restockTarget = product;
    this.restockVariantMatrix = (product.variants || []).map((v) => ({ ...v }));
    this.showRestockModal = true;
  }

  closeRestockModal(): void {
    this.showRestockModal = false;
    this.restockTarget = null;
    this.restockVariantMatrix = [];
  }

  updateRestockVariantStock(index: number, value: string | number): void {
    this.restockVariantMatrix[index].stock = Math.max(0, Number(value) || 0);
  }

  private getCategoryId(category: IProducts['category']): string {
    if (!category) return '';
    return typeof category === 'object' ? category._id : category;
  }

  private getSubCategoryId(subCategory: IProducts['subCategory']): string {
    if (!subCategory) return '';
    return typeof subCategory === 'object' ? subCategory._id : subCategory;
  }

  

  saveRestock(): void {
    if (!this.restockTarget) return;

    const product = this.restockTarget;
    const formData = new FormData();
    formData.append('title', product.title);
    formData.append('desc', product.desc);
    formData.append('price', String(product.price));
    formData.append('keywords', product.keywords?.join(', ') || '');
    formData.append('tags', product.tags?.join(', ') || '');
    formData.append('specs', product.specs?.join(', ') || '');
    formData.append('category', this.getCategoryId(product.category));
    formData.append('subCategory', this.getSubCategoryId(product.subCategory));
    formData.append('colors', product.colors?.join(', ') || '');
    formData.append('sizes', product.sizes?.join(', ') || '');
    formData.append('variants', JSON.stringify(this.restockVariantMatrix));

    this.productService.adminUpdate(product._id, formData).subscribe({
      next: () => {
        this.toastService.success('Stock updated successfully');
        this.closeRestockModal();
        this.loadProducts();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Failed to update stock');
      }
    });
  }



  openOrderModal(order: IOrder): void {
    this.selectedOrder = order;
    this.showAddressInModal = false;
  }

  closeOrderModal(): void {
    this.selectedOrder = null;
    this.showAddressInModal = false;
  }

  toggleAddressInModal(): void {
    this.showAddressInModal = !this.showAddressInModal;
  }

  getSelectedOrderAddress() {
    return this.selectedOrder ? getOrderAddressView(this.selectedOrder) : { lines: [], hasAddress: false };
  }

  getProductImage(imgUrl: string): string {
    if (!imgUrl) return '';
    return imgUrl.startsWith('http') ? imgUrl : this.staticUrl + imgUrl;
  }
}

 
