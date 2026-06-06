import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { LoginService } from '../../core/services/login.service';
import { IUser } from '../../core/models/user.model';
import { ADMIN_PAGE_SIZE } from '../shared/admin-pagination.util';
import { AdminPaginationComponent } from '../shared/admin-pagination.component';
import { IAdminPaginatedResponse } from '../shared/admin-api.model';
import { ToastService } from '../../core/services/toast.service';

type AdminUserRow = IUser & { showOrders?: boolean; ordersLoaded?: boolean };

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdminPaginationComponent],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  users: AdminUserRow[] = [];
  currentUserId: string | null = null;
  page = 1;
  totalItems = 0;
  loading = false;
  loadingOrdersFor: string | null = null;
  readonly pageSize = ADMIN_PAGE_SIZE;

  constructor(
    private userService: UserService,
    private loginService: LoginService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const userData = this.loginService.getUserData();
    this.currentUserId = userData?._id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService
      .adminGetAll({ page: this.page, limit: this.pageSize, excludeId: this.currentUserId })
      .subscribe({
        next: (res) => {
          const paginated = res as IAdminPaginatedResponse<IUser>;
          if (paginated.data.length === 0 && this.page > 1) {
            this.page--;
            this.loadUsers();
            return;
          }
          this.users = paginated.data.map((u) => ({
            ...u,
            showOrders: false,
            ordersLoaded: false,
          }));
          this.totalItems = paginated.pagination?.total ?? paginated.data.length;
          this.loading = false;
        },
        error: () => {
          this.toastService.error('Failed to load users');
          this.loading = false;
        },
      });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadUsers();
  }

  deleteUser(id: string) {
    this.userService.adminDelete(id).subscribe({
      next: () => {
        this.toastService.success('User deleted');
        this.loadUsers();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Failed to delete user'),
    });
  }

  restoreUser(id: string) {
    this.userService.adminRestore(id).subscribe({
      next: () => {
        this.toastService.success('User restored');
        this.loadUsers();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Failed to restore user'),
    });
  }

  toggleOrders(user: AdminUserRow): void {
    if (user.showOrders) {
      user.showOrders = false;
      return;
    }

    user.showOrders = true;

    if (user.ordersLoaded || !user._id) return;

    this.loadingOrdersFor = user._id;
    this.userService.adminGetUserOrders(user._id).subscribe({
      next: (res) => {
        user.orders = res.data;
        user.ordersLoaded = true;
        this.loadingOrdersFor = null;
      },
      error: () => {
        this.toastService.error('Failed to load user orders');
        this.loadingOrdersFor = null;
      },
    });
  }
}
