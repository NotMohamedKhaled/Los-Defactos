import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Route, Router } from '@angular/router';
import { ISignup, ISignupResponse } from '../models/signup.model';
import { environment } from '../../../environments/environment';
import { IAuthResponse, ICredentials } from '../models/auth.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  
  constructor(private http:HttpClient , private router:Router){}
  apiURL  =environment.apiURL
  signup(signupData:ISignup){

      return this.http.post<ISignupResponse>(`${this.apiURL}user`, signupData).pipe(
        tap(() => {
           this.router.navigate(['/login']);
        })
      );
    
  }
}
