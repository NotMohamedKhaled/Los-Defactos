import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../core/services/order.servicets';
import { IOrder } from '../../core/models/order.model';
import { Order } from './order/order';
import { RouterLink } from '@angular/router';
import { AdminPaginationComponent } from '../../admin/shared/admin-pagination.component';
import { IAdminPaginatedResponse } from '../../admin/shared/admin-api.model';

@Component({
  selector: 'app-orders',
  imports: [Order, RouterLink, AdminPaginationComponent],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class Orders implements OnInit {
  orders: IOrder[] = [];
  page = 1;
  pageSize = 5;
  totalItems = 0;
  loading = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders({ page: this.page, limit: this.pageSize }).subscribe({
      next: (res) => {
        const paginated = res as IAdminPaginatedResponse<IOrder>;
        this.orders = paginated.data ?? [];
        this.totalItems = paginated.pagination?.total ?? this.orders.length;
        this.loading = false;
      },
      error: () => {
        this.orders = [];
        this.totalItems = 0;
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadOrders();
  }
}
