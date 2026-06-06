import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { LoginService } from '../../core/services/login.service';
import { CartService } from '../../core/services/cart.service';
import { ICredentials } from '../../core/models/auth.model';

@Component({
  selector: 'app-login',
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  constructor(
    private loginService: LoginService,
    private cartService: CartService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  loginForm: FormGroup = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
    rememberMe: new FormControl(false)
  });

  message: string | null = null;
  messageType: 'success' | 'error' | 'warning' | null = null;

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.message = null;
    const { rememberMe, ...credentials } = this.loginForm.value;

    this.loginService
      .login(credentials as ICredentials, rememberMe)
      .pipe(switchMap(() => this.cartService.mergeGuestCartAfterAuth()))
      .subscribe({
        next: () => {
          this.message = 'Login successful! Redirecting...';
          this.messageType = 'success';
          this.navigateAfterAuth();
        },
        error: (err) => {
          this.message = err.error?.message || 'Login failed. Please check your credentials.';
          this.messageType = 'error';
        }
      });
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] as string | undefined;
    const role = this.loginService.getUserData()?.role;

    if (role === 'admin') {
      this.router.navigate(['/dashboard']);
      return;
    }

    if (returnUrl && returnUrl.startsWith('/')) {
      this.router.navigateByUrl(returnUrl);
      return;
    }

    this.router.navigate(['/']);
  }
}
