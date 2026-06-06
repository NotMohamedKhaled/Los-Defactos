import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginService } from './login.service';
import { IUser } from '../models/user.model';
import { IAdminListParams, IAdminPaginatedResponse } from '../../admin/shared/admin-api.model';
import { IOrder } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiURL}user`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  // ✅ Helper for auth headers
  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    if (!token) throw new Error('User not logged in');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  /** Get users (Admin). Pass page/limit for server pagination; omit for full list. */
  adminGetAll(params: IAdminListParams = {}) {
    const headers = this.getAuthHeaders();
    const query = new URLSearchParams();
    if (params.page != null) query.append('page', String(params.page));
    if (params.limit != null) query.append('limit', String(params.limit));
    if (params.excludeId) query.append('excludeId', params.excludeId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return this.http.get<IAdminPaginatedResponse<IUser> | { message: string; data: IUser[] }>(
      `${this.baseUrl}/admin${qs}`,
      { headers }
    );
  }

  /** Lazy-load orders for a user in admin user management */
  adminGetUserOrders(userId: string) {
    const headers = this.getAuthHeaders();
    return this.http.get<{ message: string; data: IOrder[] }>(
      `${this.baseUrl}/admin/${userId}/orders`,
      { headers }
    );
  }

adminDelete(id: string) {
  const headers = this.getAuthHeaders();
  return this.http.delete<{ message: string }>(
    `${this.baseUrl}/${id}`,
    { headers }
  );
}


  /** 🔍 Get a single user by ID (Admin only) */
  adminGetById(id: string) {
    const headers = this.getAuthHeaders();
    return this.http.get<{ message: string; data: IUser }>(
      `${this.baseUrl}/${id}`,
      { headers }
    );
  }

  /** ✏️ Update user (Admin only) */
  adminUpdate(id: string, userData: Partial<IUser>) {
    const headers = this.getAuthHeaders();
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/${id}`,
      userData,
      { headers }
    );
  }

  /** 🗑️ Soft delete user (set isDeleted=true) */
  // adminDelete(id: string) {
  //   const headers = this.getAuthHeaders();
  //   return this.http.delete<{ message: string }>(
  //     `${this.baseUrl}/${id}`,
  //     { headers }
  //   );
  // }

  /** ♻️ Restore deleted user (set isDeleted=false) */
adminRestore(id: string) {
  const headers = this.getAuthHeaders();
  return this.http.put<{ message: string }>(
    `${this.baseUrl}/restore/${id}`,
    {},
    { headers }
  );
}

}
