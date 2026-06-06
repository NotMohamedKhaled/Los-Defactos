import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginService } from './login.service';
import { environment } from '../../../environments/environment';
import { IProfileResponse } from '../models/profile.model';
import { ITestimonial } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  constructor(private http:HttpClient,private  loginService:LoginService){}
  apiUrl=environment.apiURL+'user'

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.loginService.getToken();
    if (!token) return null;
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getProfile(){
    const headers = this.getAuthHeaders();
     if (!headers) throw new Error("User not logged in");
    return this.http.get<IProfileResponse>(`${this.apiUrl}`,{headers}); 
  }

  updateProfile(data: { name: string; phone: string; address: string[] }) {
    const headers = this.getAuthHeaders();
    if (!headers) throw new Error('User not logged in');
    return this.http.put<IProfileResponse>(`${this.apiUrl}/profile`, data, { headers });
  }

 addTestimonial(testimonialData: { message: string }) {
  const headers = this.getAuthHeaders();
  if (!headers) throw new Error('User not logged in');
  return this.http.post<{ message: string; data: ITestimonial }>(
    'http://localhost:3000/testimonials',
    testimonialData,
    { headers }
  );
}

deleteTestimonial(id: string) {
  const headers = this.getAuthHeaders();
  if (!headers) throw new Error('User not logged in');
  return this.http.delete<{ message: string }>(`http://localhost:3000/testimonials/${id}`, { headers });
}


}
