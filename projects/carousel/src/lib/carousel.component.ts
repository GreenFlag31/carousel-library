import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { Carousel } from './carousel';
import { AnimationTimingFn } from './interfaces';
import { Slider } from './slider';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Validation } from './validation';
import { CarouselService } from './carousel.service';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterViewInit {
  @Input() maxWidthCarousel!: number;
  @Input() infinite = false;
  @Input() responsive = true;
  @Input() autoSlide = true;
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

  @Input() autoPlay = true;
  @Input() autoPlayTiming = 1500;
  @Input() autoPlayAtStart = false;
  @Input() autoPlaySlideToScroll = 1;
  @Input() playDirection: 'ltr' | 'rtl' = 'ltr';

  @ViewChild('carouselContainer')
  carouselContainer!: ElementRef<HTMLDivElement>;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;
  resizeSubscription!: Subscription;
  carousel!: Carousel | undefined;
  slider!: Slider | undefined;
  isBrowser = true;

  constructor(
    private cd: ChangeDetectorRef,
    private carouselService: CarouselService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;

    const carouselContainer = this.carouselContainer.nativeElement;

    new Validation(
      carouselContainer,
      this.slideWidth,
      this.slideMaxWidth,
      this.gapBetweenSlides,
      this.slideToScroll
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
      this.infinite,
      this.autoPlay,
      this.autoPlayTiming,
      this.autoPlayAtStart,
      this.playDirection,
      this.autoPlaySlideToScroll,
      this.carouselService,
      this.cd
    );

    this.listeners();
    this.cd.markForCheck();
  }

  listeners() {
    this.mouseupSubscription = fromEvent(window, 'mouseup').subscribe(
      (event: any) => {
        if (!this.slider?.dragging) return;

        this.slider?.dragStop(event);
      }
    );
    this.VChangeSubscription = fromEvent(
      document,
      'visibilitychange'
    ).subscribe((event) => {
      this.slider?.stopAutoPlay();
      this.slider?.unActiveTab(event);
    });

    this.resizeSubscription = fromEvent(window, 'resize').subscribe(() => {
      this.resize();
    });
  }

  /**
   * Reinitialise variables at resize
   */
  resize() {
    if (!this.slider) return;

    this.carousel?.updateProperties();
    this.slider.updateProperties();

    this.slider.stopAutoPlay();
    this.slider.currentSlide = 0;
    this.slider.accumulatedSlide = 0;
    this.slider.computeTransformation(0);
    this.slider.changePrevAndNextLimits(0);
    this.carouselService.onChange(
      this.slider.currentSlide,
      this.slider.currentCarouselID
    );

    this.cd.markForCheck();
  }

  ngOnDestroy() {
    this.mouseupSubscription?.unsubscribe();
    this.VChangeSubscription?.unsubscribe();
    this.resizeSubscription?.unsubscribe();
    this.slider?.stopAutoPlay();
  }
}
