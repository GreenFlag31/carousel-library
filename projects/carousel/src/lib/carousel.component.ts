import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  input,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Carousel } from './carousel';
import { Slider } from './slider';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Validation } from './validation';
import { CarouselService } from './carousel.service';
import { AnimationsTiming } from './interfaces';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [CommonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent implements AfterViewInit {
  maxWidthCarousel = input<number>();
  infinite = input(false);
  responsive = input(true);
  autoSlide = input(true);
  slideToShow = input(3);
  slideToScroll = input(2);
  autoslideLimitPercentCard = input(30);
  strechingLimit = input(60);
  slideWidth = input(300);
  slideMaxWidth = input(500);
  dots = input(true);
  arrows = input(true);
  counter = input(true);
  enableMouseDrag = input(true);
  enableTouch = input(true);
  counterSeparator = input('/');
  gapBetweenSlides = input(16);
  animationTimingMs = input(300);
  maxDomSize = input(4);
  animationTimingFn = input<AnimationsTiming>('ease-out');

  autoPlay = input(false);
  autoPlayInterval = input(1500);
  autoPlayAtStart = input(false);
  displayAutoPlayControls = input(true);
  autoPlaySlideToScroll = input(1);
  autoPlayDirection = input<'ltr' | 'rtl'>('ltr');

  @ViewChild('carouselContainer')
  private carouselContainer!: ElementRef<HTMLDivElement>;
  private resizeEvent!: () => void;
  private mouseUpEvent!: (event: MouseEvent | TouchEvent) => void;
  private visibilityEvent!: (event: any) => void;
  private previousWidth = 0;
  private currentWidth = 0;
  private isBrowser = true;
  carousel!: Carousel | undefined;
  slider!: Slider | undefined;

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
    this.previousWidth = window.innerWidth;
    this.currentWidth = window.innerWidth;

    new Validation(
      carouselContainer,
      this.slideWidth(),
      this.slideMaxWidth(),
      this.gapBetweenSlides(),
      this.slideToScroll()
    );

    this.carousel = new Carousel(
      carouselContainer,
      this.maxWidthCarousel(),
      this.slideToShow(),
      this.slideWidth(),
      this.slideMaxWidth(),
      this.gapBetweenSlides(),
      this.responsive(),
      this.infinite()
    );

    this.slider = new Slider(
      this.carousel,
      this.responsive(),
      this.slideToScroll(),
      this.autoslideLimitPercentCard(),
      this.strechingLimit(),
      this.autoSlide(),
      this.animationTimingFn(),
      this.animationTimingMs(),
      this.maxDomSize(),
      this.enableMouseDrag(),
      this.enableTouch(),
      this.infinite(),
      this.autoPlay(),
      this.autoPlayInterval(),
      this.autoPlayAtStart(),
      this.autoPlayDirection(),
      this.autoPlaySlideToScroll(),
      this.carouselService,
      this.cd
    );

    this.listeners();
    this.cd.detectChanges();
  }

  listeners() {
    this.mouseUpEvent = (event) => {
      if (!this.slider!.dragging) return;

      this.slider!.dragStop(event);
      this.slider!.relaunchAutoPlay();
      this.cd.markForCheck();
    };
    this.visibilityEvent = (event) => {
      const visibility = event.target.visibilityState;
      this.slider!.dragStop(event);

      if (visibility === 'hidden') {
        clearInterval(this.slider!.autoInterval);
      }

      if (visibility === 'visible') {
        this.slider!.relaunchAutoPlay();
      }

      this.cd.markForCheck();
    };
    this.resizeEvent = () => {
      this.resize();
    };

    window.addEventListener('mouseup', this.mouseUpEvent);
    window.addEventListener('resize', this.resizeEvent);
    document.addEventListener('visibilitychange', this.visibilityEvent);
  }

  /**
   * Reinitialise variables at resize
   */
  resize() {
    if (!this.slider || !this.carousel) return;

    // on smartphones a vertical scroll triggers a resize event
    this.currentWidth = window.innerWidth;
    if (this.currentWidth === this.previousWidth) return;

    this.previousWidth = window.innerWidth;
    this.carousel.updateProperties();
    this.slider.updateProperties();

    this.slider.stopAutoPlay();
    const slideNumberBeforeChange = this.slider.currentSlide;
    this.slider.currentSlide = 0;
    const slideHasChanged =
      slideNumberBeforeChange !== this.slider.currentSlide;
    this.slider.accumulatedSlide = 0;
    this.slider.computeTransformation(0);
    this.slider.changePrevAndNextLimits(0);
    this.slider.fireSlideChangeEvent(slideHasChanged, 0);

    this.cd.markForCheck();
  }

  /**
   * Removes active subscriptions and clear interval autoplay.
   */
  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('visibilitychange', this.visibilityEvent);
    this.slider?.stopAutoPlay();
  }
}
