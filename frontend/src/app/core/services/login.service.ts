import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IAuthResponse, ICredentials, ITokenDecode } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private token_key = 'token';
  apiURL = environment.apiURL;
  onLogout = new Subject<void>();

  constructor(
    private _http: HttpClient,
    private _router: Router,
  ) {}

  /** Store token after successful login (navigation handled by caller) */
  login(credentials: ICredentials, rememberMe: boolean = false) {
    return this._http.post<IAuthResponse>(`${this.apiURL}login`, credentials).pipe(
      tap((res) => {
        this.storeToken(res.token, rememberMe);
      })
    );
  }

  /** ✅ Logout: just remove token & notify subscribers */
  logout() {
    localStorage.removeItem(this.token_key);
    sessionStorage.removeItem(this.token_key);
    this.onLogout.next();
    this._router.navigate(['/login']);
  }

  /** ✅ Store token locally */
  private storeToken(token: string, rememberMe: boolean) {
    if (rememberMe) {
      localStorage.setItem(this.token_key, token);
    } else {
      sessionStorage.setItem(this.token_key, token);
    }
  }

  /** ✅ Retrieve token */
  getToken(): string | null {
    return localStorage.getItem(this.token_key) || sessionStorage.getItem(this.token_key);
  }

  /** ✅ Check if token valid and has required role */
  isLoggedInWithRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;

    if (!this.isValidToken(token)) return false;

    const decodeRole = this.decodeToken(token).role;
    return decodeRole === role;
  }

  /** ✅ Check if any user is logged in regardless of role */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return this.isValidToken(token);
  }

  /** ✅ Decode JWT token */
  private decodeToken(token: string) {
    return jwtDecode<ITokenDecode>(token);
  }
   getUserData(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Split the JWT (header.payload.signature)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('❌ Failed to decode token:', error);
      return null;
    }
  }

  /** ✅ Validate expiration */
  private isValidToken(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      const expiry = decoded.exp * 1000;
      return Date.now() < expiry;
    } catch {
      return false;
    }
  }
}
