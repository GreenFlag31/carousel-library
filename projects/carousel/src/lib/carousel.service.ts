import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Sliding } from './interfaces';

@Injectable({
  providedIn: 'root',
})
export class CarouselService {
  /**
   * An RXJS Subject that will be triggered at every slide change. Returns an object containing the zero indexed current slide number and the zero indexed carousel ID.
   */
  onSlideChange = new Subject<Sliding>();
  /**
   * Internal use only.
   */
  carouselID = -1;
  /**
   * Internal use only.
   */
  onChange(slide: number, currentCarouselID: number) {
    this.onSlideChange.next({ slide, carouselID: currentCarouselID });
  }
}
