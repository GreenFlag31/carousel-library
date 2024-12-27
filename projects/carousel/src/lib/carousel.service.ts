import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CarouselService {
  emit(slide: number, carouselElement: HTMLDivElement) {
    const event = new CustomEvent('slideChange', { detail: slide });

    // dispatch event on the parent
    carouselElement.parentElement?.dispatchEvent(event);
  }
}
