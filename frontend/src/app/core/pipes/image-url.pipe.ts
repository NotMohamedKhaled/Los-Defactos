import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

export function resolveImageUrl(imgUrl: string | null | undefined, staticUrl = environment.staticURL): string {
  if (!imgUrl) return '';
  return imgUrl.startsWith('http') ? imgUrl : `${staticUrl}${imgUrl}`;
}

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(imgUrl: string | null | undefined): string {
    return resolveImageUrl(imgUrl);
  }
}
