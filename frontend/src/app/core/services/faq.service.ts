import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { IFaq, IFaqResponse } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class FaqService {
   private baseUrl = `${environment.apiURL}faq`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  adminGetAll() {
    const headers = this.getAuthHeaders();
    return this.http.get<IFaqResponse>(`${this.baseUrl}/admin`, { headers });
  }

  adminAdd(faq: Partial<IFaq>) {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string }>(`${this.baseUrl}/admin`, faq, { headers });
  }

  adminToggle(id: string ,currentStatus: boolean) {
    const headers = this.getAuthHeaders();
    return this.http.put<{ message: string }>(`${this.baseUrl}/admin/${id}`, { isPosted: !currentStatus }, { headers });
  }
}

