import { Component, OnInit } from '@angular/core';
import { ITestimonial } from '../../core/models/home.model';
import { TestimonialService } from '../../core/services/testimonials';
import { CommonModule } from '@angular/common';
import { sortByLatest } from '../shared/admin-sort.util';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-testimonials',
  imports: [CommonModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css'
})
export class Testimonials implements OnInit {
  testimonials: ITestimonial[] = [];
  loading = false;

  constructor(
    private testimonialService: TestimonialService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.loadTestimonials();
  }

  loadTestimonials() {
    this.loading = true;
    this.testimonialService.adminGetAll().subscribe({
      next: (res) => {
        this.testimonials = sortByLatest(res.data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Failed to load testimonials');
      },
    });
  }

 togglePost(testimonial: ITestimonial) {
  if (!testimonial._id) return;

  this.testimonialService.adminToggle(testimonial._id, testimonial.isPosted).subscribe({
    next: () => {
      this.toastService.success(
        testimonial.isPosted ? 'Testimonial hidden from storefront' : 'Testimonial published'
      );
      this.loadTestimonials();
    },
    error: (err) => this.toastService.error(err?.error?.message || 'Failed to update testimonial'),
  });
}
}