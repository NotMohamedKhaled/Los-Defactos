import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from '../services/login.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  const user = loginService.isLoggedInWithRole("admin"); // You’ll implement this method next

  if (user) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
