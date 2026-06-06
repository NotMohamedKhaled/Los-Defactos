import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.servicets';
import { IOrder } from '../../core/models/order.model';
import { FormsModule } from '@angular/forms';
import { ADMIN_PAGE_SIZE } from '../shared/admin-pagination.util';
import { AdminPaginationComponent } from '../shared/admin-pagination.component';
import { IAdminPaginatedResponse } from '../shared/admin-api.model';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';
import { AdminModalBackdropDirective } from '../shared/admin-modal-backdrop.directive';
import { getOrderAddressView } from '../../core/utils/order-address.util';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPaginationComponent, AdminModalBackdropDirective],
  templateUrl: './orders.html',
  styleUrls: ['./orders.css', '../shared/admin-modal.css'],
})
export class Orders implements OnInit {
  orders: IOrder[] = [];
  loading = false;
  page = 1;
  totalItems = 0;
  readonly pageSize = ADMIN_PAGE_SIZE;
  staticUrl = environment.staticURL;

  selectedOrder: IOrder | null = null;
  showAddressInModal = false;

  allowedStatuses: IOrder['orderStat'][] = [
    'pending',
    'preparing',
    'shipping',
    'recieved',
    'delivered',
    'cancelled',
    'rejected by admin',
  ];

  constructor(
    private orderService: OrderService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.adminGetAllOrders({ page: this.page, limit: this.pageSize }).subscribe({
      next: (res) => {
        const paginated = res as IAdminPaginatedResponse<IOrder>;
        if (paginated.data.length === 0 && this.page > 1) {
          this.page--;
          this.loadOrders();
          return;
        }
        this.orders = paginated.data;
        this.totalItems = paginated.pagination?.total ?? paginated.data.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load orders:', err);
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadOrders();
  }

  changeStatus(order: IOrder, newStatus: string) {
    if (!newStatus || order.orderStat === newStatus) return;

    if (!this.allowedStatuses.includes(newStatus as IOrder['orderStat'])) {
      console.warn('Invalid status chosen:', newStatus);
      return;
    }

    this.orderService.adminUpdateOrderStatus(order._id!, newStatus as IOrder['orderStat']).subscribe({
      next: () => {
        order.orderStat = newStatus as IOrder['orderStat'];
        this.toastService.success(`Order ${newStatus} successfully`);
      },
      error: (err) => {
        console.error('Failed to update status', err);
        this.toastService.error('Could not update order status');
      }
    });
  }

  deleteOrder(id: string) {
    this.orderService.adminDeleteOrder(id).subscribe({
      next: () => {
        this.toastService.success('Order deleted successfully');
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
        this.toastService.error('Failed to delete order');
      },
    });
  }

  restoreOrder(id: string) {
    this.orderService.adminRestoreOrder(id).subscribe({
      next: () => {
        this.toastService.success('Order restored successfully');
        this.loadOrders();
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // ── Order Detail Modal ──────────────────────────────────────
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
