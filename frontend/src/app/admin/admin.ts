import { Component } from '@angular/core';
import { RouterOutlet, RouterModule, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginService } from '../core/services/login.service';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {

  constructor(private loginService:LoginService ){}

    get username(): string {
    const userData = this.loginService.getUserData();
    return userData ? userData.name : '';
  }

    logout() {
    this.loginService.logout();
  }
}
