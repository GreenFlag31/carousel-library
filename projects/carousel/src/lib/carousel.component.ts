import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { Slider } from './slider';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Validation } from './validation';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements OnInit {
  @Input() maxWidthCarousel!: number;
  @Input() infinite = true;
  @Input() responsive = true;
  @Input() autoSlide = false;
  @Input() slideToShow = 3;
  @Input() slideToScroll = 2;
  @Input() autoslideLimitPercentCard = 30;
  @Input() strechingLimit = 60;
  @Input() slideWidth = 300;
  @Input() slideMaxWidth = 500;
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
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel;
  slider!: Slider;
  isBrowser = true;

  constructor(
    private elementRef: ElementRef,
    private changeDetection: ChangeDetectorRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    const carouselContainer: HTMLDivElement =
      this.elementRef.nativeElement.children[0];

    new Validation(
      carouselContainer,
      this.slideWidth,
      this.slideMaxWidth,
      this.gapBetweenSlides
    );

    this.carousel = new Carousel(
      carouselContainer,
      this.maxWidthCarousel,
      this.slideToShow,
      this.slideWidth,
      this.slideMaxWidth,
      this.gapBetweenSlides,
      this.responsive,
      this.infinite
    );

    this.slider = new Slider(
      this.carousel,
      this.responsive,
      this.slideToScroll,
      this.autoslideLimitPercentCard,
      this.strechingLimit,
      this.autoSlide,
      this.animationTimingFn,
      this.animationTimingMs,
      this.maxDomSize,
      this.enableMouseDrag,
      this.enableTouch,
      this.infinite
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
    this.carousel.updateProperties();
    this.slider.updateProperties();

    this.slider.currentSlide = 0;
    this.slider.accumulatedSlide = 0;
    this.slider.computeTransformation(0);

    if (this.infinite) {
      this.slider.changePrevAndNextLimits(0);
    }

    this.changeDetection.detectChanges();
  }

  ngOnDestroy() {
    this.mouseupSubscription?.unsubscribe();
    this.VChangeSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
  }
}
