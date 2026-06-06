import { Component, Input } from '@angular/core';
import { ICategory } from '../../../core/models/home.model';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../core/pipes/image-url.pipe';

@Component({
  selector: 'app-category',
  imports: [RouterLink, ImageUrlPipe],
  templateUrl: './category.html',
  styleUrl: './category.css'
})
export class Category {
@Input() myCat!:ICategory
}
