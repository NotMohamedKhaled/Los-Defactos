import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService, ICategory, ISubCategory } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { sortByLatest } from '../shared/admin-sort.util';
import { ADMIN_PAGE_SIZE, paginateSlice } from '../shared/admin-pagination.util';
import { AdminPaginationComponent } from '../shared/admin-pagination.component';
import { AdminModalBackdropDirective } from '../shared/admin-modal-backdrop.directive';
import { ToastService } from '../../core/services/toast.service';
import { FormFieldErrorComponent } from '../../core/components/form-field-error/form-field-error.component';
import {
  adminValidators,
  fieldInvalid,
  markFormTouched,
  sanitizeSubCategoryForm,
} from '../../core/utils/form-validators.util';

@Component({
  selector: 'app-admin-subcategories',
  imports: [CommonModule, ReactiveFormsModule, AdminPaginationComponent, AdminModalBackdropDirective, FormFieldErrorComponent],
  standalone: true,
  templateUrl: './subcategories.html',
  styleUrls: ['../shared/admin-modal.css']
})
export class AdminSubcategoriesComponent implements OnInit {
  subCategories: ISubCategory[] = [];
  page = 1;
  readonly pageSize = ADMIN_PAGE_SIZE;

  get paginatedSubCategories(): ISubCategory[] {
    return paginateSlice(this.subCategories, this.page, this.pageSize);
  }
  categories: ICategory[] = [];
  subCategoryForm!: FormGroup;
  isEditing = false;
  showFormModal = false;
  selectedSubCategoryId: string | null = null;
  selectedFilterCategoryId: string = '';

  constructor(
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadSubCategories();
  }

  private initForm(): void {
    this.subCategoryForm = new FormGroup({
      name: new FormControl('', adminValidators.name),
      description: new FormControl('', adminValidators.optionalDesc),
      category: new FormControl('', [Validators.required]),
    });
  }

  invalid(name: string): boolean {
    return fieldInvalid(this.subCategoryForm, name);
  }

  loadCategories(): void {
    this.categoryService.adminGetAllCategories().subscribe({
      next: (res) => {
        this.categories = sortByLatest(res.data);
      },
      error: (err) => console.error('Failed to load categories:', err)
    });
  }

  loadSubCategories(): void {
    this.categoryService.getSubCategories(this.selectedFilterCategoryId).subscribe({
      next: (res) => {
        this.subCategories = sortByLatest(res.data);
        this.page = 1;
      },
      error: (err) => console.error('Failed to load subcategories:', err)
    });
  }

  onFilterChange(event: Event): void {
    this.selectedFilterCategoryId = (event.target as HTMLSelectElement).value;
    this.loadSubCategories();
  }

  openAddModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  editSubCategory(subCat: ISubCategory): void {
    this.isEditing = true;
    this.showFormModal = true;
    this.selectedSubCategoryId = subCat._id;
    this.subCategoryForm.patchValue({
      name: subCat.name,
      description: subCat.description,
      category: typeof subCat.category === 'object' ? subCat.category._id : subCat.category
    });
  }

  saveSubCategory(): void {
    if (this.subCategoryForm.invalid) {
      markFormTouched(this.subCategoryForm);
      this.toastService.error('Please fix the form errors before saving.');
      return;
    }

    const data = sanitizeSubCategoryForm(this.subCategoryForm.getRawValue());

    if (this.isEditing && this.selectedSubCategoryId) {
      this.categoryService.adminUpdateSubCategory(this.selectedSubCategoryId, data).subscribe({
        next: () => {
          this.toastService.success('Subcategory updated successfully');
          this.closeFormModal();
          this.loadSubCategories();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'Update failed'),
      });
    } else {
      this.categoryService.adminAddSubCategory(data).subscribe({
        next: () => {
          this.toastService.success('Subcategory added successfully');
          this.closeFormModal();
          this.loadSubCategories();
        },
        error: (err) => this.toastService.error(err?.error?.message || 'Failed to add subcategory'),
      });
    }
  }

  deleteSubCategory(id: string): void {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    this.categoryService.adminDeleteSubCategory(id).subscribe({
      next: () => {
        this.toastService.success('Subcategory deleted');
        this.loadSubCategories();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Delete failed'),
    });
  }

  restoreSubCategory(id: string): void {
    if (!confirm('Are you sure you want to restore this subcategory?')) return;
    this.categoryService.adminUpdateSubCategory(id, { isDeleted: false }).subscribe({
      next: () => {
        this.toastService.success('Subcategory restored successfully');
        this.loadSubCategories();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Restore failed'),
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.selectedSubCategoryId = null;
    this.subCategoryForm.reset({
      name: '',
      description: '',
      category: ''
    });
  }
}
