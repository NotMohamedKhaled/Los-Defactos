import { Component, Input } from '@angular/core';
import { ITestimonial } from '../../../core/models/home.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-testimonial',
  imports: [],
  templateUrl: './testimonial.html',
  styleUrl: './testimonial.css'
})
export class Testimonial {
@Input() myTest!:ITestimonial;
staticUrl = environment.staticURL; 
}
