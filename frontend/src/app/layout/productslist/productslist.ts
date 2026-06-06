import { Component, OnInit } from '@angular/core';
import { ProductlistService } from '../../core/services/productlist.service';
import { IProducts } from '../../core/models/products.model';
import { CommonModule } from '@angular/common';
import { Product } from './product/product';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CategoryService, ICategory, ISubCategory } from '../../core/services/category.service';

@Component({
  selector: 'app-productslist',
  imports: [CommonModule, Product, RouterLink, FormsModule],
  templateUrl: './productslist.html',
  styleUrl: './productslist.css'
})
export class Productslist implements OnInit {
  products: any[] = [];
  page = 1;
  limit = 10;
  totalPages = 0;
  sort = '-createdAt';
  search = '';
  categoryName: string = '';
  activeSubCategoryId: string = '';
  activeSubCategoryName: string = '';
  subCategories: ISubCategory[] = [];
  categories: ICategory[] = [];
  showAllSubCategories = false;
  readonly maxSubCategoriesPreview = 5;
  readonly maxSidebarCategories = 5;
  isLoading = true;

  // Price filter state
  minPrice: number | null = null;
  maxPrice: number | null = null;
  appliedMinPrice: number | null = null;
  appliedMaxPrice: number | null = null;

  constructor(
    private productlistService: ProductlistService,
    private route: ActivatedRoute,
    private router: Router,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe(res => {
      this.categories = res.data || [];
    });

    this.route.queryParams.subscribe(params => {
      this.categoryName = params['category'] || '';
      this.activeSubCategoryId = params['subCategory'] || '';
      this.page = 1;
      this.activeSubCategoryName = '';
      this.showAllSubCategories = false;

      if (this.categoryName) {
        this.loadSubCategoriesForCategory(this.categoryName);
      } else {
        this.subCategories = [];
        this.showAllSubCategories = false;
      }

      this.loadProducts();
    });
  }

  loadSubCategoriesForCategory(catName: string) {
    this.showAllSubCategories = false;
    this.categoryService.getCategories().subscribe(res => {
      const match = res.data.find(c => c.name.toLowerCase() === catName.toLowerCase());
      if (match) {
        this.categoryService.getSubCategories(match._id).subscribe(subRes => {
          this.subCategories = subRes.data;
          // Resolve the active subcategory name for the breadcrumb
          if (this.activeSubCategoryId) {
            const found = this.subCategories.find(s => s._id === this.activeSubCategoryId);
            this.activeSubCategoryName = found ? found.name : '';
          }
        });
      }
    });
  }

  loadAllSubCategories() {
    // No longer used on "All Products" — subcategory pills only when a category is selected.
  }

  get sidebarCategories(): ICategory[] {
    return this.categories.slice(0, this.maxSidebarCategories);
  }

  get visibleSubCategories(): ISubCategory[] {
    if (!this.categoryName) return [];
    if (this.showAllSubCategories || this.subCategories.length <= this.maxSubCategoriesPreview) {
      return this.subCategories;
    }
    return this.subCategories.slice(0, this.maxSubCategoriesPreview);
  }

  get hasMoreSubCategories(): boolean {
    return !!this.categoryName && this.subCategories.length > this.maxSubCategoriesPreview && !this.showAllSubCategories;
  }

  toggleShowAllSubCategories(): void {
    this.showAllSubCategories = !this.showAllSubCategories;
  }

  setSubCategory(subCatId: string) {
    this.activeSubCategoryId = subCatId;
    this.activeSubCategoryName = subCatId
      ? (this.subCategories.find(s => s._id === subCatId)?.name ?? '')
      : '';
    this.page = 1;
    this.loadProducts();
  }

  applyFilters() {
    this.appliedMinPrice = this.minPrice;
    this.appliedMaxPrice = this.maxPrice;
    this.page = 1;
    this.loadProducts();
  }

  clearFilters() {
    this.minPrice = null;
    this.maxPrice = null;
    this.appliedMinPrice = null;
    this.appliedMaxPrice = null;
    this.page = 1;
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.productlistService.getProducts({
      page: this.page,
      limit: this.limit,
      sort: this.sort,
      search: this.search,
      category: this.categoryName,
      subCategory: this.activeSubCategoryId,
      minPrice: this.appliedMinPrice,
      maxPrice: this.appliedMaxPrice
    }).subscribe({
      next: (res: any) => {
        this.products = res.data;
        this.totalPages = res.pagination.pages;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading products:', err);
        this.isLoading = false;
      }
    });
  }

  onSearchChange(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
    this.page = 1;
    this.loadProducts();
  }

  onSortChange(event: Event): void {
    this.sort = (event.target as HTMLSelectElement).value;
    this.loadProducts();
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadProducts();
    }
  }
}
