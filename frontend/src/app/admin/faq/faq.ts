import { Component, OnInit } from '@angular/core';
import { IFaq } from '../../core/models/home.model';
import { FaqService } from '../../core/services/faq.service';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  sanitizeFaqForm,
} from '../../core/utils/form-validators.util';

@Component({
  selector: 'app-faq',
  imports: [CommonModule, ReactiveFormsModule, AdminPaginationComponent, AdminModalBackdropDirective, FormFieldErrorComponent],
  templateUrl: './faq.html',
  styleUrls: ['../shared/admin-modal.css', './faq.css']
})
export class Faq implements OnInit {
  faqs: IFaq[] = [];
  loading = false;
  showFormModal = false;
  faqForm!: FormGroup;
  page = 1;
  readonly pageSize = ADMIN_PAGE_SIZE;

  get paginatedFaqs(): IFaq[] {
    return paginateSlice(this.faqs, this.page, this.pageSize);
  }

  constructor(
    private faqService: FaqService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadFaqs();
  }

  private initForm(): void {
    this.faqForm = new FormGroup({
      question: new FormControl('', adminValidators.faqQuestion),
      answer: new FormControl('', adminValidators.faqAnswer),
    });
  }

  invalid(name: string): boolean {
    return fieldInvalid(this.faqForm, name);
  }

  loadFaqs() {
    this.loading = true;
    this.faqService.adminGetAll().subscribe({
      next: (res) => {
        this.faqs = sortByLatest(res.data);
        this.page = 1;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.toastService.error('Failed to load FAQs');
      },
    });
  }

  openAddModal(): void {
    this.faqForm.reset();
    this.showFormModal = true;
  }

  closeAddModal(): void {
    this.showFormModal = false;
    this.faqForm.reset();
  }

  addFaq(): void {
    if (this.faqForm.invalid) {
      markFormTouched(this.faqForm);
      this.toastService.error('Please fix the form errors before saving.');
      return;
    }

    const payload = sanitizeFaqForm(this.faqForm.getRawValue());
    this.faqService.adminAdd(payload).subscribe({
      next: () => {
        this.toastService.success('FAQ added successfully');
        this.closeAddModal();
        this.loadFaqs();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Failed to add FAQ'),
    });
  }

  togglePost(faq: IFaq & { _id?: string }) {
    if (!faq._id) return;
    this.faqService.adminToggle(faq._id, faq.isPosted).subscribe({
      next: () => {
        this.toastService.success(faq.isPosted ? 'FAQ unpublished' : 'FAQ published');
        this.loadFaqs();
      },
      error: (err) => this.toastService.error(err?.error?.message || 'Failed to update FAQ'),
    });
  }
}
