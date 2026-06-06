import { Component, OnInit } from '@angular/core';
import { IProfile } from '../../core/models/profile.model';
import { ProfileService } from '../../core/services/profile.service';
import { ITestimonial } from '../../core/models/home.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, DatePipe, CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile!: IProfile;
  isEditing = false;
  saving = false;
  profileForm!: FormGroup;
  testimonialForm!: FormGroup;

  constructor(
    private profileService: ProfileService,
  ) {
    this.testimonialForm = new FormGroup({
      message: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500)
      ]),
    });
    this.profileForm = new FormGroup({
      name: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.required),
      shippingStreet: new FormControl(''),
      shippingCity: new FormControl(''),
      shippingZip: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  get shippingStreet(): string {
    return this.profile?.address?.[0] ?? '';
  }

  get shippingCity(): string {
    return this.profile?.address?.[1] ?? '';
  }

  get shippingZip(): string {
    return this.profile?.address?.[2] ?? '';
  }

  get shippingLine(): string {
    const parts = [this.shippingStreet, this.shippingCity, this.shippingZip].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Not set';
  }

  private loadProfile(): void {
    this.profileService.getProfile().subscribe(res => {
      this.profile = res.data;
    });
  }

  startEdit(): void {
    this.profileForm.patchValue({
      name: this.profile.name,
      phone: this.profile.phone,
      shippingStreet: this.shippingStreet,
      shippingCity: this.shippingCity,
      shippingZip: this.shippingZip,
    });
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.profileForm.reset();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const { name, phone, shippingStreet, shippingCity, shippingZip } = this.profileForm.value;
    this.saving = true;

    this.profileService.updateProfile({
      name,
      phone,
      address: [shippingStreet || '', shippingCity || '', shippingZip || ''],
    }).subscribe({
      next: (res) => {
        this.profile = res.data;
        this.isEditing = false;
        this.saving = false;
      },
      error: () => {
        this.saving = false;
      },
    });
  }

  addTestimonial() {
    if (this.testimonialForm.invalid) {
      this.testimonialForm.markAllAsTouched();
      return;
    }

    const testimonialData = this.testimonialForm.value;

    this.profileService.addTestimonial(testimonialData).subscribe({
      next: (res) => {
        if (res.data) {
          this.profile.testimonials.unshift(res.data);
        }
        this.testimonialForm.reset();
      },
      error: (err) => {
        console.error('Error adding testimonial:', err);
      }
    });
  }

  deleteTestimonial(id: string) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    this.profileService.deleteTestimonial(id).subscribe({
      next: () => {
        this.profile.testimonials = this.profile.testimonials.filter(t => t._id !== id);
      },
      error: (err) => {
        console.error('Error deleting testimonial:', err);
      }
    });
  }
}
