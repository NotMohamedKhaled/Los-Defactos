import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginService } from '../../core/services/login.service';
import { CategoryService, ISubCategory } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

interface NavCategory {
  name: string;
  subCategories: ISubCategory[];
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isMenuOpen = false;
  userMenuOpen = false;
  hoveredCategory: string | null = null;

  navCategories: NavCategory[] = [
    { name: 'Kids', subCategories: [] },
    { name: 'Women', subCategories: [] },
    { name: 'Men', subCategories: [] },
  ];

  constructor(
    private loginService: LoginService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Load subcategories for each nav category
    this.categoryService.getCategories().subscribe(res => {
      const requests = this.navCategories.map(nav => {
        const match = res.data.find(c => c.name.toLowerCase() === nav.name.toLowerCase());
        return match
          ? this.categoryService.getSubCategories(match._id)
          : null;
      });

      requests.forEach((req, i) => {
        if (req) {
          req.subscribe(subRes => {
            this.navCategories[i].subCategories = subRes.data;
          });
        }
      });
    });
  }

  get isLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  get username(): string {
    const userData = this.loginService.getUserData();
    return userData ? userData.name : '';
  }

  get isAdmin(): boolean {
    const userData = this.loginService.getUserData();
    return userData ? userData.role === 'admin' : false;
  }

  logout() {
    this.loginService.logout();
    this.closeMenu();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  openMegaMenu(catName: string) {
    this.hoveredCategory = catName;
  }

  closeMegaMenu() {
    this.hoveredCategory = null;
  }
}
