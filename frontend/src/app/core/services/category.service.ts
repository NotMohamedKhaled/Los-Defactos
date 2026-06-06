import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LoginService } from './login.service';
import { Observable } from 'rxjs';

export interface ICategory {
  _id: string;
  name: string;
  desc: string;
  imgUrl?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ISubCategory {
  _id: string;
  name: string;
  description: string;
  category: string | any; // Could be populated object
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApiResponse<T> {
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrlCategory = environment.apiURL + 'category';
  private apiUrlSubCategory = environment.apiURL + 'subCategory';

  constructor(private http: HttpClient, private loginService: LoginService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    if (!token) throw new Error('User not logged in');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ===================== USER ROUTES ===================== //

  getCategories(): Observable<IApiResponse<ICategory[]>> {
    return this.http.get<IApiResponse<ICategory[]>>(`${this.apiUrlCategory}`);
  }

  getSubCategories(categoryId?: string): Observable<IApiResponse<ISubCategory[]>> {
    const query = categoryId ? `?category=${categoryId}` : '';
    return this.http.get<IApiResponse<ISubCategory[]>>(`${this.apiUrlSubCategory}${query}`);
  }

  // ===================== ADMIN ROUTES (Categories) ===================== //

  adminGetAllCategories(): Observable<IApiResponse<ICategory[]>> {
    const headers = this.getAuthHeaders();
    return this.http.get<IApiResponse<ICategory[]>>(`${this.apiUrlCategory}/admin`, { headers });
  }

  adminAddCategory(data: FormData): Observable<IApiResponse<ICategory>> {
    const headers = this.getAuthHeaders();
    return this.http.post<IApiResponse<ICategory>>(`${this.apiUrlCategory}/admin`, data, { headers });
  }

  adminUpdateCategory(id: string, data: FormData): Observable<IApiResponse<ICategory>> {
    const headers = this.getAuthHeaders();
    return this.http.put<IApiResponse<ICategory>>(`${this.apiUrlCategory}/admin/${id}`, data, { headers });
  }

  adminDeleteCategory(id: string): Observable<IApiResponse<ICategory>> {
    const headers = this.getAuthHeaders();
    return this.http.delete<IApiResponse<ICategory>>(`${this.apiUrlCategory}/admin/${id}`, { headers });
  }

  adminRestoreCategory(id: string): Observable<IApiResponse<ICategory>> {
    const headers = this.getAuthHeaders();
    return this.http.put<IApiResponse<ICategory>>(`${this.apiUrlCategory}/admin/restore/${id}`, {}, { headers });
  }

  // ===================== ADMIN ROUTES (SubCategories) ===================== //

  adminAddSubCategory(data: any): Observable<IApiResponse<ISubCategory>> {
    const headers = this.getAuthHeaders();
    return this.http.post<IApiResponse<ISubCategory>>(`${this.apiUrlSubCategory}/admin`, data, { headers });
  }

  adminUpdateSubCategory(id: string, data: any): Observable<IApiResponse<ISubCategory>> {
    const headers = this.getAuthHeaders();
    return this.http.put<IApiResponse<ISubCategory>>(`${this.apiUrlSubCategory}/admin/${id}`, data, { headers });
  }

  adminDeleteSubCategory(id: string): Observable<IApiResponse<ISubCategory>> {
    const headers = this.getAuthHeaders();
    return this.http.delete<IApiResponse<ISubCategory>>(`${this.apiUrlSubCategory}/admin/${id}`, { headers });
  }
}
