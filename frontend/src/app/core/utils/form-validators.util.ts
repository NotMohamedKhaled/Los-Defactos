import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** Strip HTML-like markup and dangerous characters from plain text. */
export function sanitizeText(value: unknown, maxLength = 500): string {
  if (value == null) return '';
  return String(value)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEmail(value: unknown): string {
  return sanitizeText(value, 120).toLowerCase();
}

export function sanitizePhone(value: unknown): string {
  return String(value ?? '')
    .replace(/[^\d+()\-\s]/g, '')
    .trim()
    .slice(0, 20);
}

export function sanitizeZip(value: unknown): string {
  return sanitizeText(value, 12).replace(/\s/g, '');
}

export function sanitizeCommaList(value: unknown, maxLength = 300): string {
  return sanitizeText(value, maxLength)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');
}

export const noHtmlValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  return /<[^>]*>|[<>]/.test(value) ? { noHtml: true } : null;
};

export const personNameValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return /^[A-Za-z][A-Za-z\s'.-]{1,79}$/.test(value) ? null : { personName: true };
};

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 8 && digits.length <= 15 ? null : { phone: true };
};

export const zipValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  return /^[A-Za-z0-9][A-Za-z0-9\s\-]{2,11}$/.test(value) ? null : { zip: true };
};

export const passwordStrengthValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) return null;
  if (value.length < 8) return { passwordMinLength: true };
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) return { passwordWeak: true };
  return null;
};

const ERROR_MESSAGES: Record<string, string> = {
  required: 'This field is required.',
  email: 'Enter a valid email address.',
  minlength: 'Value is too short.',
  maxlength: 'Value is too long.',
  min: 'Value is too low.',
  max: 'Value is too high.',
  noHtml: 'HTML tags are not allowed.',
  personName: 'Use letters only (2–80 characters).',
  phone: 'Enter a valid phone number (8–15 digits).',
  zip: 'Enter a valid postal / ZIP code.',
  passwordMinLength: 'Password must be at least 8 characters.',
  passwordWeak: 'Password must include a letter and a number.',
};

export function getFieldError(control: AbstractControl | null): string | null {
  if (!control?.errors || !(control.touched || control.dirty)) return null;

  const errors = control.errors;
  if (errors['required']) return ERROR_MESSAGES['required'];
  if (errors['email']) return ERROR_MESSAGES['email'];
  if (errors['minlength']) {
    return `Minimum ${errors['minlength'].requiredLength} characters required.`;
  }
  if (errors['maxlength']) {
    return `Maximum ${errors['maxlength'].requiredLength} characters allowed.`;
  }
  if (errors['min']) return ERROR_MESSAGES['min'];
  if (errors['max']) return ERROR_MESSAGES['max'];
  if (errors['noHtml']) return ERROR_MESSAGES['noHtml'];
  if (errors['personName']) return ERROR_MESSAGES['personName'];
  if (errors['phone']) return ERROR_MESSAGES['phone'];
  if (errors['zip']) return ERROR_MESSAGES['zip'];
  if (errors['passwordMinLength']) return ERROR_MESSAGES['passwordMinLength'];
  if (errors['passwordWeak']) return ERROR_MESSAGES['passwordWeak'];

  return 'Invalid value.';
}

export function markFormTouched(form: FormGroup): void {
  Object.values(form.controls).forEach((c) => c.markAsTouched());
}

export function fieldInvalid(form: FormGroup, name: string): boolean {
  const c = form.get(name);
  return !!(c && c.invalid && (c.touched || c.dirty));
}

export function sanitizeRegisterPayload(raw: Record<string, unknown>) {
  return {
    name: sanitizeText(raw['name'], 80),
    email: sanitizeEmail(raw['email']),
    phone: sanitizePhone(raw['phone']),
    password: String(raw['password'] ?? ''),
  };
}

export function sanitizeCheckoutPayload(raw: Record<string, unknown>) {
  return {
    fullName: sanitizeText(raw['fullName'], 80),
    email: sanitizeEmail(raw['email']),
    address: sanitizeText(raw['address'], 200),
    city: sanitizeText(raw['city'], 80),
    zip: sanitizeZip(raw['zip']),
  };
}

export const registerValidators = {
  name: [Validators.required, Validators.minLength(2), Validators.maxLength(80), personNameValidator, noHtmlValidator],
  email: [Validators.required, Validators.email, Validators.maxLength(120)],
  phone: [Validators.required, phoneValidator],
  password: [Validators.required, Validators.maxLength(128), passwordStrengthValidator],
};

export const checkoutValidators = {
  fullName: [Validators.required, Validators.minLength(2), Validators.maxLength(80), personNameValidator, noHtmlValidator],
  email: [Validators.required, Validators.email, Validators.maxLength(120)],
  address: [Validators.required, Validators.minLength(5), Validators.maxLength(200), noHtmlValidator],
  city: [Validators.required, Validators.minLength(2), Validators.maxLength(80), noHtmlValidator],
  zip: [Validators.required, zipValidator],
};

export const adminValidators = {
  name: [Validators.required, Validators.minLength(2), Validators.maxLength(80), noHtmlValidator],
  desc: [Validators.required, Validators.minLength(5), Validators.maxLength(500), noHtmlValidator],
  productTitle: [Validators.required, Validators.minLength(2), Validators.maxLength(120), noHtmlValidator],
  productDesc: [Validators.required, Validators.minLength(5), Validators.maxLength(2000), noHtmlValidator],
  optionalDesc: [Validators.maxLength(500), noHtmlValidator],
  price: [Validators.required, Validators.min(1), Validators.max(999999)],
  faqQuestion: [Validators.required, Validators.minLength(5), Validators.maxLength(200), noHtmlValidator],
  faqAnswer: [Validators.required, Validators.minLength(5), Validators.maxLength(1000), noHtmlValidator],
};

export function sanitizeProductForm(raw: Record<string, unknown>) {
  return {
    title: sanitizeText(raw['title'], 120),
    desc: sanitizeText(raw['desc'], 2000),
    price: Math.min(999999, Math.max(1, Number(raw['price']) || 0)),
    keywords: sanitizeCommaList(raw['keywords'], 300),
    tags: sanitizeCommaList(raw['tags'], 300),
    colors: sanitizeCommaList(raw['colors'], 200),
    sizes: sanitizeCommaList(raw['sizes'], 200),
    specs: sanitizeCommaList(raw['specs'], 500),
    category: String(raw['category'] ?? ''),
    subCategory: String(raw['subCategory'] ?? ''),
  };
}

export function sanitizeCategoryForm(raw: Record<string, unknown>) {
  return {
    name: sanitizeText(raw['name'], 80),
    desc: sanitizeText(raw['desc'], 500),
  };
}

export function sanitizeSubCategoryForm(raw: Record<string, unknown>) {
  return {
    name: sanitizeText(raw['name'], 80),
    description: sanitizeText(raw['description'], 500),
    category: String(raw['category'] ?? ''),
  };
}

export function sanitizeFaqForm(raw: Record<string, unknown>) {
  return {
    question: sanitizeText(raw['question'], 200),
    answer: sanitizeText(raw['answer'], 1000),
  };
}
