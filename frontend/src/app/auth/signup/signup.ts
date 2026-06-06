import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SignupService } from '../../core/services/signup.service';
import { CommonModule } from '@angular/common';
import { FormFieldErrorComponent } from '../../core/components/form-field-error/form-field-error.component';
import {
  fieldInvalid,
  markFormTouched,
  registerValidators,
  sanitizeRegisterPayload,
} from '../../core/utils/form-validators.util';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, CommonModule, FormFieldErrorComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {
  constructor(private signupService: SignupService, private router: Router) {}

  registerForm = new FormGroup({
    name: new FormControl('', registerValidators.name),
    email: new FormControl('', registerValidators.email),
    phone: new FormControl('', registerValidators.phone),
    password: new FormControl('', registerValidators.password),
  });

  message: string | null = null;
  messageType: 'success' | 'error' | 'warning' | null = null;

  invalid(name: string): boolean {
    return fieldInvalid(this.registerForm, name);
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      markFormTouched(this.registerForm);
      return;
    }

    this.message = null;
    const payload = sanitizeRegisterPayload(this.registerForm.getRawValue());

    this.signupService.signup(payload).subscribe({
      next: () => {
        this.message = 'Account created successfully! Redirecting to login...';
        this.messageType = 'success';
      },
      error: (err) => {
        this.message = err.error?.message || 'Registration failed. Please try again.';
        this.messageType = 'error';
      }
    });
  }
}
