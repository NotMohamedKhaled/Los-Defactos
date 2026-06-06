import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getFieldError } from '../../utils/form-validators.util';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <p *ngIf="message" class="text-sale-red font-body-md text-[12px] mt-1" role="alert">{{ message }}</p>
  `,
})
export class FormFieldErrorComponent {
  @Input({ required: true }) control!: AbstractControl | null;

  get message(): string | null {
    return getFieldError(this.control);
  }
}
