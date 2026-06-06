import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LoginService } from '../../../core/services/login.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  constructor(private LoginService:LoginService, private router:Router){}
  logout(){
    this.LoginService.logout()
    this.router.navigate(['/login']);


  }
}
