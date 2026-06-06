import { Injectable } from '@angular/core';
import { ITestimonialResponse } from '../models/home.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginService } from './login.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private baseUrl = `${environment.apiURL}testimonials`;

  constructor(private http: HttpClient, private loginService: LoginService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.loginService.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // 🧍 User creates testimonial
  userCreate(content: string) {
    const headers = this.getAuthHeaders();
    return this.http.post<{ message: string }>(`${this.baseUrl}`, { content }, { headers });
  }

  // 🧑‍💼 Admin gets all
  adminGetAll() {
    const headers = this.getAuthHeaders();
    return this.http.get<ITestimonialResponse>(`${this.baseUrl}/admin`, { headers });
  }

  // 🧑‍💼 Admin toggles post/unpost
  adminToggle(id: string, isPosted: boolean) {
  const headers = this.getAuthHeaders();
  // Send the current state, backend will invert it
  return this.http.put<{ message: string }>(
    `${this.baseUrl}/admin/${id}`,
    { isPosted:!isPosted }, // send current state
    { headers }
  );
}

}