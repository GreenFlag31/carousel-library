import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-scroll-carousel',
  templateUrl: './scroll-carousel.component.html',
  styleUrls: ['./scroll-carousel.component.css'],
})
export class ScrollCarouselComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  isDragging = false;
  startX = 0;
  startScrollLeft = 0;
  positionDiff = 0;
  scrollSteps!: number[];
  dotsNumber!: number;
  correctionBiggerThanAThird = false;
  previousWindow = 1;
  currentWindow = 1;
  previous = false;
  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;
  @ViewChild('firstCard') firstCard!: ElementRef<HTMLDivElement>;
  mouseUpSubscription!: Subscription;
  resizeSubscription!: Subscription;

  constructor() {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.mouseUpSubscription = fromEvent(window, 'mouseup')
      .pipe(debounceTime(300))
      .subscribe((event: any) => {
        if (!this.isDragging) return;

        this.onDraggingStop(event);
      });

    // Responsive will be broken if resize, back to first element
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.carousel.nativeElement.scrollLeft = 0;
        this.currentWindow = 1;
        this.setOffset();
      });

    this.setOffset();
  }

  setOffset() {
    if (window.innerWidth <= 600) {
      this.dotsNumber = 5;
    } else if (window.innerWidth <= 900) {
      this.dotsNumber = 4;
    } else {
      this.dotsNumber = 3;
    }

    this.scrollSteps = Array(this.dotsNumber)
      .fill(1)
      .map((x, i) => ++i);
  }

  onDraggingStart(event: MouseEvent | TouchEvent) {
    this.isDragging = true;

    if (event instanceof MouseEvent) {
      this.startX = event.pageX;
    } else {
      this.startX = event.touches[0].pageX;
    }
    this.startScrollLeft = this.carousel.nativeElement.scrollLeft;
  }

  onDraggingStop(event: any) {
    if ((event?.pageX || event?.changedTouches[0].pageX) - this.startX === 0)
      return;

    this.isDragging = false;
    //  otherwise it will be applied too late (template update)
    this.carousel.nativeElement.classList.remove('dragging');

    const variation =
      -this.positionDiff / (this.firstCard.nativeElement.offsetWidth + 16);

    this.previousWindow = this.currentWindow;
    this.autoSlide(variation);

    // correction brings back to same index
    if (Math.abs(variation) < 1 / 3) return;

    if (variation - Math.floor(variation) < 1 / 3 || variation < 0) {
      this.currentWindow += Math.floor(variation);
    } else {
      this.currentWindow += Math.ceil(variation);
    }

    if (this.currentWindow > this.dotsNumber) {
      this.currentWindow = this.dotsNumber;
    } else if (this.currentWindow <= 0) {
      this.currentWindow = 1;
    }
  }

  autoSlide(variation: number) {
    // debugger;
    // Excluding last or first element
    if (
      this.previousWindow + variation > this.dotsNumber ||
      (variation < 0 && this.previousWindow === 1)
    )
      return;

    variation = Math.abs(variation);
    this.correctionBiggerThanAThird = variation - Math.floor(variation) > 1 / 3;
    let correction = 0;
    if (this.correctionBiggerThanAThird) {
      correction = Math.ceil(variation) - variation;
    } else {
      correction = Math.floor(variation) - variation;
    }

    if (this.carousel.nativeElement.scrollLeft > this.startScrollLeft) {
      return (this.carousel.nativeElement.scrollLeft +=
        correction * (this.firstCard.nativeElement.offsetWidth + 16));
    }

    return (this.carousel.nativeElement.scrollLeft -=
      correction * (this.firstCard.nativeElement.offsetWidth + 16));
  }

  onDragging(event: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    if (event instanceof MouseEvent) {
      this.positionDiff = event.pageX - this.startX;
    } else {
      this.positionDiff = event.touches[0].pageX - this.startX;
    }

    this.carousel.nativeElement.scrollLeft =
      this.startScrollLeft - this.positionDiff;
  }

  changeSlide(btn: HTMLButtonElement) {
    this.previous = btn.classList.contains('previous');
    if (this.previous && this.currentWindow === 1) return;

    if (this.previous) {
      this.carousel.nativeElement.scrollLeft +=
        -this.firstCard.nativeElement.offsetWidth - 16;
      this.currentWindow--;
    } else {
      this.carousel.nativeElement.scrollLeft +=
        this.firstCard.nativeElement.offsetWidth + 16;
      this.currentWindow++;
    }

    // not allowing fast slides change because scroll animation not finished
    btn.setAttribute('disabled', 'disabled');
    setTimeout(() => {
      btn.removeAttribute('disabled');
    }, 200);
  }

  ngOnDestroy() {
    this.mouseUpSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }
}
