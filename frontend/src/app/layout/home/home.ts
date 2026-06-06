import { Component, OnInit } from '@angular/core';
import { IProducts } from '../../core/models/products.model';
import { ProductlistService } from '../../core/services/productlist.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, RouterModule, ImageUrlPipe],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  constructor(
    private productService: ProductlistService
  ) {}

  newArrivals: IProducts[] = [];

  ngOnInit(): void {

    // Load newest products for "New Arrivals" section
    this.productService.getProducts({ sort: '-createdAt', limit: 5 }).subscribe(res => {
      this.newArrivals = res.data;
    });
  }
}
