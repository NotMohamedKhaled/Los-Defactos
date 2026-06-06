import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-faq',
  imports: [CommonModule],
  templateUrl: './faq.html',
  styleUrl: './faq.css'
})
export class Faq {
@Input() myFaq:any;
isOpen = false;

toggleFaq() {
  this.isOpen = !this.isOpen;
}
}
