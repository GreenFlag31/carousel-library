import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { SliderResponsive } from './sliderResponsive';
import { SliderNotResponsive } from './sliderNotResponsive';
// import { Helper } from './helper';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent implements OnInit {
  @Input() maxWidthCarousel!: number;
  @Input() slideToShow = 3;
  @Input() slideToScroll = 2;
  @Input() slidingLimitBeforeScroll = 30;
  @Input() strechingLimit = 60;
  @Input() slideWidth = 300;
  @Input() slideMinWidth = 300;
  @Input() dots = true;
  @Input() arrows = true;
  @Input() counter = true;
  @Input() enableMouseDrag = true;
  @Input() enableTouch = true;
  @Input() counterSeparator = '/';
  @Input() gapBetweenSlides = 16;
  @Input() animationTimingMs = 300;
  @Input() animationTimingFn: AnimationTimingFn = 'ease-out';
  @Input() loop = true;
  @Input() responsive = true;
  @Input() autoSlide = false;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;
  slider!: SliderResponsive | SliderNotResponsive;
  // helper!: Helper;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    const carouselContainer: HTMLDivElement =
      this.elementRef.nativeElement.children[0];

    this.carousel = new Carousel(
      carouselContainer,
      this.maxWidthCarousel,
      this.slideToShow,
      this.slideMinWidth,
      this.slideWidth,
      this.gapBetweenSlides,
      this.responsive,
      this.loop
    );

    this.slider = this.responsive
      ? new SliderResponsive(
          this.carousel,
          this.slideToScroll,
          this.slidingLimitBeforeScroll,
          this.strechingLimit,
          this.autoSlide,
          this.animationTimingFn,
          this.animationTimingMs,
          this.enableMouseDrag,
          this.enableTouch,
          this.loop
        )
      : new SliderNotResponsive(
          this.carousel,
          this.slideToScroll,
          this.slidingLimitBeforeScroll,
          this.strechingLimit,
          this.autoSlide,
          this.animationTimingFn,
          this.animationTimingMs,
          this.enableMouseDrag,
          this.enableTouch,
          this.loop
        );

    // this.helper = new Helper(this.carousel, this.slider);
    this.listeners();
  }

  listeners() {
    this.mouseupSubscription = fromEvent(window, 'mouseup').subscribe(
      (event: any) => {
        if (!this.slider.dragging) return;

        this.slider.dragStop(event);
      }
    );
    this.VChangeSubscription = fromEvent(
      document,
      'visibilitychange'
    ).subscribe((event: any) => {
      this.slider.unActiveTab(event);
    });

    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.resize();
    });
  }

  resize() {
    // put back to start
    this.slider.currentSlide = 0;
    this.slider.computeTransformation(0);
    if (this.loop && this.slider instanceof SliderResponsive) {
      this.slider.changePrevAndNextLimits(0);
    }

    this.carousel.updateProperties();
    this.slider.updateProperties();
  }

  ngOnDestroy() {
    this.mouseupSubscription.unsubscribe();
    this.VChangeSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }
}
