import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Closes a modal only when the user presses and releases on the backdrop itself.
 * Prevents accidental close when selecting text and the pointer leaves the panel.
 */
@Directive({
  selector: '[adminModalBackdrop]',
  standalone: true,
})
export class AdminModalBackdropDirective {
  @Output() backdropClose = new EventEmitter<void>();

  private pointerDownOnBackdrop = false;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    this.pointerDownOnBackdrop = event.target === event.currentTarget;
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.pointerDownOnBackdrop && event.target === event.currentTarget) {
      this.backdropClose.emit();
    }
    this.pointerDownOnBackdrop = false;
  }
}
