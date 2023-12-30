import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewEncapsulation,
  isDevMode,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { Slider } from './slider';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [CommonModule],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
})
export class CarouselComponent implements OnInit {
  @Input() maxWidthCarousel!: number;
  @Input() slideToShow = 5;
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
  @Input() maxDomSize = 4;
  @Input() animationTimingFn: AnimationTimingFn = 'ease-out';
  @Input() loop = true;
  @Input() responsive = true;
  @Input() autoSlide = false;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;
  slider!: Slider;
  isBrowser = true;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    // console.log(isDevMode());
    if (!this.isBrowser) return;

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

    this.slider = new Slider(
      this.carousel,
      this.responsive,
      this.slideToScroll,
      this.slidingLimitBeforeScroll,
      this.strechingLimit,
      this.autoSlide,
      this.animationTimingFn,
      this.animationTimingMs,
      this.maxDomSize,
      this.enableMouseDrag,
      this.enableTouch,
      this.loop
    );

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
    ).subscribe((event) => {
      this.slider.unActiveTab(event);
    });

    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.resize();
    });
  }

  /**
   * Reinitialise variables at resize
   */
  resize() {
    this.slider.currentSlide = 0;
    this.slider.computeTransformation(0);

    this.carousel.updateProperties();
    this.slider.updateProperties();

    if (this.loop) {
      this.slider.changePrevAndNextLimits(0);
    }
  }

  ngOnDestroy() {
    this.mouseupSubscription?.unsubscribe();
    this.VChangeSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
  }
}
