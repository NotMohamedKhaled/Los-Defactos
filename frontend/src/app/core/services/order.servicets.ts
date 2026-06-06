import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { LoginService } from './login.service';
import { IOrder } from '../models/order.model';
import { IAdminListParams, IAdminPaginatedResponse } from '../../admin/shared/admin-api.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = `${environment.apiURL}order`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
  getOrders(params: { page?: number; limit?: number } = {}) {
    const headers = this.getAuthHeaders();
    const query = new URLSearchParams();
    if (params.page != null) query.append('page', String(params.page));
    if (params.limit != null) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<IAdminPaginatedResponse<IOrder> | { message: string; data: IOrder[] }>(
      `${this.baseUrl}${qs}`,
      { headers }
    );
  }

  cancelOrder(id: string) {
    const headers = this.getAuthHeaders();
    return this.http.put<{ message: string; data: IOrder }>(
      `${this.baseUrl}/${id}`,
      {},
      { headers }
    );
  }

  /** Get all orders (Admin). Pass page/limit for server pagination; omit for full list. */
  adminGetAllOrders(params: IAdminListParams = {}) {
    const headers = this.getAuthHeaders();
    const query = new URLSearchParams();
    if (params.page != null) query.append('page', String(params.page));
    if (params.limit != null) query.append('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<IAdminPaginatedResponse<IOrder> | { message: string; data: IOrder[] }>(
      `${this.baseUrl}/admin${qs}`,
      { headers }
    );
  }

  /** ✏️ Update order status (Admin only) */
// in core/services/order.service.ts
adminUpdateOrderStatus(id: string, newStatus: string) {
  const headers = this.getAuthHeaders();
  // adjust endpoint to your backend (PUT/PATCH and path)
  return this.http.put<{ message: string; data: any }>(
    `${this.baseUrl}/admin/update/${id}`,
    { updatedStat: newStatus },
    { headers }
  );
}


  /** 🗑️ Soft delete an order */
  adminDeleteOrder(id: string) {
    const headers = this.getAuthHeaders();
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/admin/delete/${id}`,
      {},
      { headers }
    );
  }

  /** ♻️ Restore deleted order */
  adminRestoreOrder(id: string) {
    const headers = this.getAuthHeaders();
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/admin/restore/${id}`,
      {},
      { headers }
    );
  }
}
