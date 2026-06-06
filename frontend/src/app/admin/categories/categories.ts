import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService, ICategory } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { sortByLatest } from '../shared/admin-sort.util';
import { ADMIN_PAGE_SIZE, paginateSlice } from '../shared/admin-pagination.util';
import { AdminPaginationComponent } from '../shared/admin-pagination.component';
import { resolveImageUrl } from '../../core/pipes/image-url.pipe';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import { AdminModalBackdropDirective } from '../shared/admin-modal-backdrop.directive';
import { ToastService } from '../../core/services/toast.service';
import { FormFieldErrorComponent } from '../../core/components/form-field-error/form-field-error.component';
import {
  adminValidators,
  fieldInvalid,
  markFormTouched,
  sanitizeCategoryForm,
} from '../../core/utils/form-validators.util';

@Component({
  selector: 'app-admin-categories',
  imports: [CommonModule, ReactiveFormsModule, AdminPaginationComponent, ImageUrlPipe, AdminModalBackdropDirective, FormFieldErrorComponent],
  standalone: true,
  templateUrl: './categories.html',
  styleUrls: ['../shared/admin-modal.css']
})
export class AdminCategoriesComponent implements OnInit {
  categories: ICategory[] = [];
  page = 1;
  readonly pageSize = ADMIN_PAGE_SIZE;

  get paginatedCategories(): ICategory[] {
    return paginateSlice(this.categories, this.page, this.pageSize);
  }
  categoryForm!: FormGroup;
  isEditing = false;
  showFormModal = false;
  selectedCategoryId: string | null = null;
  staticUrl = environment.staticURL;
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
  }

  private initForm(): void {
    this.categoryForm = new FormGroup({
      name: new FormControl('', adminValidators.name),
      desc: new FormControl('', adminValidators.desc),
    });
  }

  invalid(name: string): boolean {
    return fieldInvalid(this.categoryForm, name);
  }

  loadCategories(): void {
    this.categoryService.adminGetAllCategories().subscribe({
      next: (res) => {
        this.categories = sortByLatest(res.data);
        this.page = 1;
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  openAddModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  editCategory(category: ICategory): void {
    this.isEditing = true;
    this.showFormModal = true;
    this.selectedCategoryId = category._id;
    this.categoryForm.patchValue({
      name: category.name,
      desc: category.desc
    });
    this.imagePreview = category.imgUrl ? resolveImageUrl(category.imgUrl) : null;
    this.selectedFile = null;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) {
      markFormTouched(this.categoryForm);
      this.toastService.error('Please fix the form errors before saving.');
      return;
    }

    const clean = sanitizeCategoryForm(this.categoryForm.getRawValue());
    const formData = new FormData();
    formData.append('name', clean.name);
    formData.append('desc', clean.desc);

    if (this.selectedFile) {
      formData.append('img', this.selectedFile);
    }

    if (this.isEditing && this.selectedCategoryId) {
      this.categoryService.adminUpdateCategory(this.selectedCategoryId, formData).subscribe({
        next: () => {
          this.toastService.success('Category updated successfully');
          this.closeFormModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'Update failed'),
      });
    } else {
      this.categoryService.adminAddCategory(formData).subscribe({
        next: () => {
          this.toastService.success('Category added successfully');
          this.closeFormModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'Failed to add category'),
      });
    }
  }

  deleteCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this category?')) return;
    this.categoryService.adminDeleteCategory(id).subscribe({
      next: () => {
        this.toastService.success('Category deleted');
        this.loadCategories();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Delete failed'),
    });
  }

  restoreCategory(id: string): void {
    if (!confirm('Are you sure you want to restore this category?')) return;
    this.categoryService.adminRestoreCategory(id).subscribe({
      next: () => {
        this.toastService.success('Category restored successfully');
        this.loadCategories();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Restore failed'),
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.selectedCategoryId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.categoryForm.reset();
  }
}
