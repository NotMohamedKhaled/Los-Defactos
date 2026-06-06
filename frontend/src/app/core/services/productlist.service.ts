import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IProducts, IProductsResponse } from '../models/products.model';
import { environment } from '../../../environments/environment';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';
import { IAdminListParams, IAdminPaginatedResponse } from '../../admin/shared/admin-api.model';

@Injectable({
  providedIn: 'root'
})
export class ProductlistService {
    private apiUrl = environment.apiURL + 'product';
    private apiUrlCart = environment.apiURL + 'cart';
  
    constructor(private http: HttpClient, private loginService: LoginService) {}
  
    // ✅ Helper for auth headers
    private getAuthHeaders(): HttpHeaders {
      const token = this.loginService.getToken();
      if (!token) throw new Error('User not logged in');
      return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }
  
    // ===================== USER ROUTES ===================== //
  
    /** Get paginated products for user */
    getProducts(params: {
      page?: number;
      limit?: number;
      sort?: string;
      search?: string;
      category?: string;
      subCategory?: string;
      minPrice?: number | null;
      maxPrice?: number | null;
    } = {}) {
      const queryParams = new URLSearchParams();
  
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.search) queryParams.append('keywords', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.subCategory) queryParams.append('subCategory', params.subCategory);
      // Price range — backend supports gte:/lte: operators on price field
      if (params.minPrice != null) queryParams.append('price', `gte:${params.minPrice}`);
      if (params.maxPrice != null) queryParams.append('price', `lte:${params.maxPrice}`);
  
      const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
      return this.http.get<IProductsResponse>(`${this.apiUrl}${query}`);
    }
  
    /** Get single product by slug */
    getProductBySlug(slug: string) {
      return this.http.get<{ message: string; data: IProducts }>(`${this.apiUrl}/${slug}`);
    }
  
    /** Add item to cart from products */
    addItemToCartFromProducts(productId: string, color?: string, size?: string) {
      const headers = this.getAuthHeaders();
      return this.http.post(`${this.apiUrlCart}/${productId}`, { color, size }, { headers });
    }
  
    // ===================== ADMIN ROUTES ===================== //
  // ===================== ADMIN ROUTES ===================== //

/** Get all products (admin). Pass page/limit for server pagination; omit for full list (e.g. dashboard). */
adminGetAll(params: IAdminListParams = {}): Observable<IAdminPaginatedResponse<IProducts> | { message: string; data: IProducts[] }> {
  const headers = this.getAuthHeaders();
  const query = new URLSearchParams();
  if (params.page != null) query.append('page', String(params.page));
  if (params.limit != null) query.append('limit', String(params.limit));
  const qs = query.toString() ? `?${query.toString()}` : '';
  return this.http.get<IAdminPaginatedResponse<IProducts> | { message: string; data: IProducts[] }>(
    `${this.apiUrl}/admin${qs}`,
    { headers }
  );
}
adminRestore(id: string) {
    const headers = this.getAuthHeaders();
  return this.http.put<{ message: string }>(
    `${environment.apiURL}product/admin/restore/${id}`,
    {}, {headers}
  );
}
/** Add a new product (admin) */
adminAdd(productData: FormData) {
  const headers = this.getAuthHeaders(); // only include token
  return this.http.post(`${this.apiUrl}/admin`, productData, { headers });
}

adminUpdate(id: string, productData: FormData) {
  const headers = this.getAuthHeaders();
  return this.http.put(`${this.apiUrl}/admin/${id}`, productData, { headers });
}


/** Delete product (admin) */
adminDelete(id: string) {
  const headers = this.getAuthHeaders();
  return this.http.delete<{ message: string }>(
    `${this.apiUrl}/admin/${id}`,
    { headers }
  );
}
}