import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
} from '@angular/core';
import { Subscription, debounceTime, fromEvent } from 'rxjs';
import { Carousel } from './carousel';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent implements OnInit, AfterViewInit {
  @Input() slideToShow = 3;
  @Input() slidingLimit = 30;
  @Input() strechingLimit = 60;
  @Input() slideWidth!: number;
  @Input() slideMinWidth = 300;
  @Input() dots = true;
  @Input() arrows = true;
  @Input() counter = false;
  @Input() gapBetweenSlides = 16;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const carouselContainer: HTMLDivElement =
      this.elementRef.nativeElement.children[0];

    this.carousel = new Carousel(
      carouselContainer,
      this.slideToShow,
      this.slideMinWidth,
      this.slideWidth,
      this.gapBetweenSlides,
      this.strechingLimit,
      this.slidingLimit
    );

    this.listeners();
  }

  listeners() {
    this.mouseupSubscription = fromEvent(window, 'mouseup').subscribe(() => {
      if (!this.carousel.dragging) return;

      this.carousel.dragStop();
    });
    this.VChangeSubscription = fromEvent(
      document,
      'visibilitychange'
    ).subscribe((event: any) => {
      this.carousel.unActiveTab(event);
    });

    this.resizeSubscription = fromEvent(window, 'resize')
      // .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.carousel.currentSlide > 0) {
          this.carousel.currentSlide = 0;
          this.carousel.computeTransformation(0);
        }
        this.carousel.updateNumberDots();
        // back to index 0 at resize
      });
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.mouseupSubscription.unsubscribe();
    this.VChangeSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }
}
