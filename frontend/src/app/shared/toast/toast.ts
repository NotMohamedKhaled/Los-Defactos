import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full sm:px-0 px-4">
      <div
        *ngFor="let toast of toasts$ | async; trackBy: trackByFn"
        class="flex items-center gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-md transition-all duration-300 pointer-events-auto transform translate-y-0 opacity-100 animate-slide-in"
        [ngClass]="{
          'bg-emerald-500/90 text-white border-emerald-400': toast.type === 'success',
          'bg-rose-500/90 text-white border-rose-400': toast.type === 'error',
          'bg-slate-800/90 text-white border-slate-700': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <span class="material-symbols-outlined text-[24px] shrink-0">
          {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
        </span>

        <!-- Message -->
        <div class="flex-grow font-body-md text-sm font-medium">
          {{ toast.message }}
        </div>

        <!-- Dismiss button -->
        <button
          (click)="dismiss(toast.id)"
          class="text-white/80 hover:text-white transition-colors shrink-0 focus:outline-none"
        >
          <span class="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    .animate-slide-in {
      animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts$!: Observable<Toast[]>;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toasts$ = this.toastService.getToasts();
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }

  trackByFn(index: number, item: Toast): number {
    return item.id;
  }
}
