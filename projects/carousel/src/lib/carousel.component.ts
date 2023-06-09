import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { SliderResponsive } from './slider';
import { SliderNoResponsive } from './sliderNoResponsive';
import { Helper } from './helper';

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
  @Input() autoSlide = true;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;
  slider!: SliderResponsive | SliderNoResponsive;
  helper!: Helper;

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
      ? new SliderResponsive(
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

    this.helper = new Helper(this.carousel, this.slider);
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
        this.resize();
      });
  }

  resize() {
    this.carousel.updateProperties();
    if (this.slider.currentSlide > 0) {
      this.slider.currentSlide = 0;
      this.slider.computeTransformation(0);
    }

    if (this.slider instanceof SliderNoResponsive) {
      this.slider.offset();
    } else {
      this.slider.init();
    }
  }

  ngOnDestroy() {
    this.mouseupSubscription.unsubscribe();
    this.VChangeSubscription.unsubscribe();
    this.resizeSubscription.unsubscribe();
  }
}
