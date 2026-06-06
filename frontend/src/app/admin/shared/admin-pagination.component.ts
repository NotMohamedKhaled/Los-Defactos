import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pageRangeEnd, totalPages } from './admin-pagination.util';

@Component({
  selector: 'app-admin-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="totalItems > 0"
      class="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-border-subtle pt-6"
    >
      <span class="font-body-sm text-body-sm text-on-surface-variant">
        {{ rangeStart }}–{{ rangeEnd }} of {{ totalItems }}
      </span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-DEFAULT text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          (click)="prevPage()"
          [disabled]="page === 1"
          aria-label="Previous page"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>
        <span class="font-body-sm text-body-sm text-on-surface-variant min-w-[5rem] text-center">
          Page {{ page }} / {{ pages }}
        </span>
        <button
          type="button"
          class="w-10 h-10 flex items-center justify-center border border-border-subtle rounded-DEFAULT text-on-surface-variant hover:text-on-surface hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          (click)="nextPage()"
          [disabled]="page === pages"
          aria-label="Next page"
        >
          <span class="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>
      </div>
    </div>
  `,
})
export class AdminPaginationComponent {
  @Input({ required: true }) page!: number;
  @Input({ required: true }) pageSize!: number;
  @Input({ required: true }) totalItems!: number;
  @Output() pageChange = new EventEmitter<number>();

  get pages(): number {
    return totalPages(this.totalItems, this.pageSize);
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return pageRangeEnd(this.page, this.pageSize, this.totalItems);
  }

  prevPage(): void {
    if (this.page > 1) this.pageChange.emit(this.page - 1);
  }

  nextPage(): void {
    if (this.page < this.pages) this.pageChange.emit(this.page + 1);
  }
}
