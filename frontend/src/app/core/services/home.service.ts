import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { forkJoin } from 'rxjs';
import { ICategoryResponse, IFaqResponse, ITestimonialResponse } from '../models/home.model';

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  constructor(private http:HttpClient){}
categoryURL = environment.apiURL +'category';
faqURL = environment.apiURL +'faq';
testimonialURL = environment.apiURL +'testimonials';
getCatFaqTest(){
return forkJoin({
  category: this.http.get<ICategoryResponse>(this.categoryURL),
  faq: this.http.get<IFaqResponse>(this.faqURL),
  testimonial: this.http.get<ITestimonialResponse>(this.testimonialURL)
})
}
  
}
