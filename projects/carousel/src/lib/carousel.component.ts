import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { Slider } from './slider';
import { SliderNoResponsive } from './sliderNoResponsive';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent implements OnInit {
  @Input() maxWidth!: number;
  @Input() slideToShow = 3;
  @Input() slideToScroll = 1;
  @Input() slidingLimitBeforeScroll = 30;
  @Input() strechingLimit = 60;
  @Input() slideWidth = 300;
  @Input() slideMinWidth = 300;
  @Input() dots = true;
  @Input() arrows = true;
  @Input() counter = false;
  @Input() gapBetweenSlides = 16;
  @Input() animationTimingMs = 300;
  @Input() animationTimingFn: AnimationTimingFn = 'ease-out';
  @Input() responsive = true;
  @Input() autoSlide = false;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;
  slider!: Slider | SliderNoResponsive;

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
      this.responsive
    );

    this.slider = this.responsive
      ? new Slider(
          this.carousel,
          this.slideToScroll,
          this.slidingLimitBeforeScroll,
          this.strechingLimit,
          this.autoSlide
        )
      : new SliderNoResponsive(
          this.carousel,
          this.slideToScroll,
          this.slidingLimitBeforeScroll,
          this.strechingLimit,
          this.autoSlide
        );

    this.listeners();
  }

  listeners() {
    this.mouseupSubscription = fromEvent(window, 'mouseup').subscribe(() => {
      if (!this.slider.dragging) return;

      this.slider.dragStop();
    });
    this.VChangeSubscription = fromEvent(
      document,
      'visibilitychange'
    ).subscribe((event: any) => {
      this.slider.unActiveTab(event);
    });

    this.resizeSubscription = fromEvent(window, 'resize')
      // .pipe(debounceTime(300))
      .subscribe(() => {
        if (this.slider.currentSlide > 0) {
          this.slider.currentSlide = 0;
          this.slider.computeTransformation(0);
        }
        this.carousel.updateProperties();
      });
  }

  ngOnDestroy() {
    this.mouseupSubscription.unsubscribe();
    this.VChangeSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }
}
