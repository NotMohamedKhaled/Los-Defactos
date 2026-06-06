import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IProducts, IProductVariant } from '../../core/models/products.model';
import { ProductlistService } from '../../core/services/productlist.service';
import { CategoryService, ICategory, ISubCategory } from '../../core/services/category.service';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ToastService } from '../../core/services/toast.service';
import { ADMIN_PAGE_SIZE } from '../shared/admin-pagination.util';
import { AdminPaginationComponent } from '../shared/admin-pagination.component';
import { IAdminPaginatedResponse } from '../shared/admin-api.model';
import { ImageUrlPipe } from '../../core/pipes/image-url.pipe';
import { AdminModalBackdropDirective } from '../shared/admin-modal-backdrop.directive';
import { FormFieldErrorComponent } from '../../core/components/form-field-error/form-field-error.component';
import {
  adminValidators,
  fieldInvalid,
  markFormTouched,
  noHtmlValidator,
  sanitizeProductForm,
} from '../../core/utils/form-validators.util';

@Component({
  selector: 'app-products',
  imports: [CommonModule, ReactiveFormsModule, AdminPaginationComponent, ImageUrlPipe, AdminModalBackdropDirective, FormFieldErrorComponent],
  standalone: true,
  templateUrl: './products.html',
  styleUrls: ['./products.css', '../shared/admin-modal.css']
})
export class Products {
  products: IProducts[] = [];
  page = 1;
  totalItems = 0;
  loadingProducts = false;
  readonly pageSize = ADMIN_PAGE_SIZE;
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];
  variantMatrix: IProductVariant[] = [];
  productForm!: FormGroup;
  isEditing = false;
  showFormModal = false;
  showRestockModal = false;
  restockTarget: IProducts | null = null;
  restockVariantMatrix: IProductVariant[] = [];
  selectedProductId: string | null = null;
  staticUrl = environment.staticURL;

  constructor(
    private productService: ProductlistService,
    private categoryService: CategoryService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    this.loadProducts();
    this.buildVariantMatrix();
  }

  private initForm(): void {
    this.productForm = new FormGroup({
      title: new FormControl('', adminValidators.productTitle),
      desc: new FormControl('', adminValidators.productDesc),
      price: new FormControl(0, adminValidators.price),
      keywords: new FormControl('', [Validators.maxLength(300), noHtmlValidator]),
      tags: new FormControl('', [Validators.maxLength(300), noHtmlValidator]),
      colors: new FormControl('', [Validators.maxLength(200), noHtmlValidator]),
      sizes: new FormControl('', [Validators.maxLength(200), noHtmlValidator]),
      specs: new FormControl('', [Validators.maxLength(500), noHtmlValidator]),
      category: new FormControl('', [Validators.required]),
      subCategory: new FormControl('', [Validators.required]),
    });
  }

  invalid(name: string): boolean {
    return fieldInvalid(this.productForm, name);
  }

  private parseCommaList(value: string): string[] {
    return (value || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  variantKey(color: string, size: string): string {
    return `${color}::${size}`;
  }

  buildVariantMatrix(existingVariants: IProductVariant[] = this.variantMatrix): void {
    const colors = this.parseCommaList(this.productForm?.get('colors')?.value || '');
    const sizes = this.parseCommaList(this.productForm?.get('sizes')?.value || '');
    const existingMap = new Map(
      existingVariants.map((v) => [this.variantKey(v.color, v.size), v])
    );

    const combinations: IProductVariant[] = [];
    const baseSlug = this.slugify(this.productForm?.get('title')?.value || 'product');

    const makeVariant = (color: string, size: string): IProductVariant => {
      const existing = existingMap.get(this.variantKey(color, size));
      return {
        color,
        size,
        stock: existing?.stock ?? 0,
        sku: existing?.sku || this.generateSku(baseSlug, color, size),
        price: existing?.price,
      };
    };

    if (colors.length && sizes.length) {
      colors.forEach((color) => {
        sizes.forEach((size) => combinations.push(makeVariant(color, size)));
      });
    } else if (colors.length) {
      colors.forEach((color) => combinations.push(makeVariant(color, '')));
    } else if (sizes.length) {
      sizes.forEach((size) => combinations.push(makeVariant('', size)));
    } else {
      combinations.push(makeVariant('', ''));
    }

    this.variantMatrix = combinations;
  }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'product';
  }

  private generateSku(baseSlug: string, color: string, size: string): string {
    const parts = [
      baseSlug,
      color ? this.slugify(color) : 'default',
      size ? this.slugify(size) : 'default',
    ];
    return parts.join('-').toUpperCase();
  }

  private deriveColorsFromVariants(variants: IProductVariant[]): string {
    return [...new Set(variants.map((v) => v.color).filter(Boolean))].join(', ');
  }

  private deriveSizesFromVariants(variants: IProductVariant[]): string {
    return [...new Set(variants.map((v) => v.size).filter(Boolean))].join(', ');
  }

  onColorsOrSizesChange(): void {
    this.buildVariantMatrix();
  }

  updateVariantStock(index: number, value: string | number): void {
    this.variantMatrix[index].stock = Math.max(0, Number(value) || 0);
  }

  getVariantStock(color: string, size: string): number {
    const variant = this.variantMatrix.find(
      (v) => v.color === color && v.size === size
    );
    return variant?.stock ?? 0;
  }

  updateVariantStockByKey(color: string, size: string, value: string | number): void {
    const index = this.variantMatrix.findIndex(
      (v) => v.color === color && v.size === size
    );
    if (index >= 0) {
      this.updateVariantStock(index, value);
    }
  }

  get totalVariantStock(): number {
    return this.variantMatrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  get matrixSizes(): string[] {
    return this.parseCommaList(this.productForm.get('sizes')?.value || '');
  }

  get matrixColors(): string[] {
    return this.parseCommaList(this.productForm.get('colors')?.value || '');
  }

  get hasMatrixGrid(): boolean {
    return this.matrixColors.length > 0 && this.matrixSizes.length > 0;
  }

  get restockTotalStock(): number {
    return this.restockVariantMatrix.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }

  getVariantLabel(variant: IProductVariant): string {
    if (variant.color && variant.size) return `${variant.color} / ${variant.size}`;
    if (variant.color) return variant.color;
    if (variant.size) return variant.size;
    return 'Default';
  }

  openAddModal(): void {
    this.resetForm();
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.resetForm();
  }

  openRestockModal(product: IProducts): void {
    this.restockTarget = product;
    this.restockVariantMatrix = (product.variants || []).map((v) => ({ ...v }));
    this.showRestockModal = true;
  }

  closeRestockModal(): void {
    this.showRestockModal = false;
    this.restockTarget = null;
    this.restockVariantMatrix = [];
  }

  updateRestockVariantStock(index: number, value: string | number): void {
    this.restockVariantMatrix[index].stock = Math.max(0, Number(value) || 0);
  }

  saveRestock(): void {
    if (!this.restockTarget) return;

    const product = this.restockTarget;
    const formData = new FormData();
    formData.append('title', product.title);
    formData.append('desc', product.desc);
    formData.append('price', String(product.price));
    formData.append('keywords', product.keywords?.join(', ') || '');
    formData.append('tags', product.tags?.join(', ') || '');
    formData.append('specs', product.specs?.join(', ') || '');
    formData.append('category', this.getCategoryId(product.category));
    formData.append('subCategory', this.getSubCategoryId(product.subCategory));
    formData.append('colors', product.colors?.join(', ') || '');
    formData.append('sizes', product.sizes?.join(', ') || '');
    formData.append('variants', JSON.stringify(this.restockVariantMatrix));

    this.productService.adminUpdate(product._id, formData).subscribe({
      next: () => {
        this.toastService.success('Stock updated successfully');
        this.closeRestockModal();
        this.loadProducts();
      },
      error: (err) => {
        this.toastService.error(err?.error?.message || 'Failed to update stock');
      }
    });
  }

  loadCategories(): void {
    this.categoryService.adminGetAllCategories().subscribe({
      next: (res) => {
        this.categories = res.data.filter((cat) => !cat.isDeleted);
      },
      error: () => {
        this.toastService.error('Failed to load categories');
      }
    });
  }

  loadSubCategories(categoryId: string): void {
    if (!categoryId) {
      this.subCategories = [];
      return;
    }

    this.categoryService.getSubCategories(categoryId).subscribe({
      next: (res) => {
        this.subCategories = res.data.filter((sub) => !sub.isDeleted);
      },
      error: () => {
        this.toastService.error('Failed to load subcategories');
      }
    });
  }

  onCategoryChange(event: Event): void {
    const categoryId = (event.target as HTMLSelectElement).value;
    this.productForm.patchValue({ subCategory: '' });
    this.loadSubCategories(categoryId);
  }

  private getCategoryId(category: IProducts['category']): string {
    if (!category) return '';
    return typeof category === 'object' ? category._id : category;
  }

  private getSubCategoryId(subCategory: IProducts['subCategory']): string {
    if (!subCategory) return '';
    return typeof subCategory === 'object' ? subCategory._id : subCategory;
  }

  loadProducts(): void {
    this.loadingProducts = true;
    this.productService.adminGetAll({ page: this.page, limit: this.pageSize }).subscribe({
      next: (res) => {
        const paginated = res as IAdminPaginatedResponse<IProducts>;
        if (paginated.data.length === 0 && this.page > 1) {
          this.page--;
          this.loadProducts();
          return;
        }
        this.products = paginated.data;
        this.totalItems = paginated.pagination?.total ?? paginated.data.length;
        this.loadingProducts = false;
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        this.toastService.error('Failed to load products');
        this.loadingProducts = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.page = page;
    this.loadProducts();
  }

  editProduct(product: IProducts): void {
    this.isEditing = true;
    this.showFormModal = true;
    this.selectedProductId = product._id;
    const categoryId = this.getCategoryId(product.category);
    const subCategoryId = this.getSubCategoryId(product.subCategory);

    const patchForm = () => {
      const existingVariants = product.variants?.length
        ? product.variants
        : [{ color: '', size: '', stock: 0, sku: '' }];

      this.productForm.patchValue({
        title: product.title,
        desc: product.desc,
        price: product.price,
        keywords: product.keywords?.join(', ') || '',
        tags: product.tags?.join(', ') || '',
        colors: product.colors?.length
          ? product.colors.join(', ')
          : this.deriveColorsFromVariants(existingVariants),
        sizes: product.sizes?.length
          ? product.sizes.join(', ')
          : this.deriveSizesFromVariants(existingVariants),
        specs: product.specs?.join(', ') || '',
        category: categoryId,
        subCategory: subCategoryId
      });

      this.buildVariantMatrix(existingVariants);
    };

    if (categoryId) {
      this.categoryService.getSubCategories(categoryId).subscribe({
        next: (res) => {
          this.subCategories = res.data.filter((sub) => !sub.isDeleted);
          patchForm();
        },
        error: () => {
          this.toastService.error('Failed to load subcategories');
          patchForm();
        }
      });
    } else {
      this.subCategories = [];
      patchForm();
    }
  }

  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  saveProduct(): void {
    if (this.productForm.invalid) {
      markFormTouched(this.productForm);
      this.toastService.error('Please fix the form errors before saving.');
      return;
    }

    const clean = sanitizeProductForm(this.productForm.getRawValue());
    const formData = new FormData();
    formData.append('title', clean.title);
    formData.append('desc', clean.desc);
    formData.append('price', String(clean.price));
    formData.append('keywords', clean.keywords);
    formData.append('tags', clean.tags);
    formData.append('colors', clean.colors);
    formData.append('sizes', clean.sizes);
    formData.append('specs', clean.specs);
    formData.append('category', clean.category);
    formData.append('subCategory', clean.subCategory);
    const baseSlug = this.slugify(clean.title || 'product');
    const variantsPayload = this.variantMatrix.map((variant) => ({
      color: variant.color,
      size: variant.size,
      stock: variant.stock,
      sku: variant.sku || this.generateSku(baseSlug, variant.color, variant.size),
      ...(variant.price != null ? { price: variant.price } : {}),
    }));

    formData.append('variants', JSON.stringify(variantsPayload));

    if (this.selectedFile) {
      formData.append('img', this.selectedFile);
    }

    if (this.isEditing && this.selectedProductId) {
      this.productService.adminUpdate(this.selectedProductId, formData).subscribe({
        next: () => {
          this.toastService.success('Product updated successfully');
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Update failed:', err);
          this.toastService.error(err?.error?.message || 'Update failed');
        }
      });
    } else {
      if (!this.selectedFile) {
        this.toastService.error('Product image is required');
        return;
      }

      this.productService.adminAdd(formData).subscribe({
        next: () => {
          this.toastService.success('Product added successfully');
          this.closeFormModal();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Add failed:', err);
          this.toastService.error(err?.error?.message || 'Failed to add product');
        }
      });
    }
  }

  restoreProduct(id: string): void {
    if (!confirm('Are you sure you want to restore this product?')) return;

    this.productService.adminRestore(id).subscribe({
      next: () => {
        this.toastService.success('Product restored successfully');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Restore failed:', err);
        this.toastService.error('Restore failed');
      }
    });
  }

  deleteProduct(id: string): void {
    if (!confirm('Are you sure you want to delete this product?')) return;

    this.productService.adminDelete(id).subscribe({
      next: () => {
        this.toastService.info('Product deleted');
        this.loadProducts();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        this.toastService.error('Delete failed');
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.selectedProductId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.subCategories = [];
    this.productForm.reset({
      title: '',
      desc: '',
      price: 0,
      keywords: '',
      tags: '',
      colors: '',
      sizes: '',
      specs: '',
      category: '',
      subCategory: ''
    });
    this.buildVariantMatrix([]);
  }
}
