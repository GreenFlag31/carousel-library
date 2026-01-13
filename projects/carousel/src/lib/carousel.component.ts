import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ContentChild,
  ElementRef,
  Inject,
  input,
  PLATFORM_ID,
  Signal,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Carousel } from './carousel';
import { isPlatformBrowser } from '@angular/common';
import { Validation } from './validation';
import { CarouselService } from './carousel.service';
import { AnimationsTiming } from './interfaces';
import { InfiniteSlider } from './infiniteSlider';
import { FiniteSlider } from './finiteSlider';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  imports: [],
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
  private carousel!: Carousel;
  slider!: InfiniteSlider | FiniteSlider;

  // view container and template reference for infinite
  @ContentChild('carouselViewContainer', { read: ViewContainerRef })
  carouselViewContainer!: ViewContainerRef;
  @ContentChild('carouselTemplateRef', { read: TemplateRef })
  carouselTemplateRef!: TemplateRef<any>;

  // Template variables
  carouselDots: Signal<number> = signal(0);
  carouselMaxScrollableContent: Signal<number> = signal(0);
  carouselArrayNumberDots: Signal<number[]> = signal<number[]>([]);
  sliderCurrentSlide: Signal<number> = signal(0);
  sliderCurrentTranslation: Signal<number> = signal(0);
  sliderPlayActive: Signal<boolean> = signal(false);
  sliderPlayButtonDisabled: Signal<boolean> = signal(false);
  sliderDragging: Signal<boolean> = signal(false);

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

    if (this.carouselViewContainer && this.carouselTemplateRef) {
      this.carouselViewContainer.createEmbeddedView(this.carouselTemplateRef);
    }

    new Validation(
      carouselContainer,
      this.slideWidth(),
      this.slideMaxWidth(),
      this.gapBetweenSlides(),
      this.slideToScroll(),
      this.carouselViewContainer,
      this.carouselTemplateRef
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

    this.instantiateSlider();
    this.listeners();
    this.cd.detectChanges();
  }

  instantiateSlider() {
    if (this.infinite()) {
      this.slider = new InfiniteSlider(
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
        this.autoPlay(),
        this.autoPlayInterval(),
        this.autoPlayAtStart(),
        this.autoPlayDirection(),
        this.autoPlaySlideToScroll(),
        this.carouselService,
        this.carouselViewContainer,
        this.carouselTemplateRef
      );
    } else {
      this.slider = new FiniteSlider(
        this.carousel,
        this.responsive(),
        this.slideToScroll(),
        this.autoslideLimitPercentCard(),
        this.strechingLimit(),
        this.autoSlide(),
        this.animationTimingFn(),
        this.animationTimingMs(),
        this.enableMouseDrag(),
        this.enableTouch(),
        this.autoPlay(),
        this.autoPlayInterval(),
        this.autoPlayAtStart(),
        this.autoPlayDirection(),
        this.autoPlaySlideToScroll(),
        this.carouselService
      );
    }

    this.carouselDots = computed(() => this.carousel.numberDots());
    this.carouselMaxScrollableContent = computed(() =>
      this.carousel.maxScrollableContent()
    );
    this.carouselArrayNumberDots = computed(() =>
      this.carousel.arrayNumberDots()
    );

    this.sliderCurrentSlide = computed(() => this.slider.currentSlide());
    this.sliderCurrentTranslation = computed(() =>
      this.slider.currentTranslation()
    );
    this.sliderCurrentTranslation = computed(() =>
      this.slider.currentTranslation()
    );
    this.sliderPlayActive = computed(() => this.slider.playActive());
    this.sliderPlayButtonDisabled = computed(() =>
      this.slider.playButtonDisabled()
    );
    this.sliderDragging = computed(() => this.slider.dragging());
  }

  listeners() {
    this.mouseUpEvent = (event) => {
      if (!this.sliderDragging()) return;

      this.slider.dragStop(event);
      this.slider.relaunchAutoPlay();
      this.cd.markForCheck();
    };

    this.visibilityEvent = (event) => {
      const visibility = event.target.visibilityState;
      this.slider.dragStop(event);

      if (visibility === 'hidden') {
        clearInterval(this.slider.autoInterval);
      }

      if (visibility === 'visible') {
        this.slider.relaunchAutoPlay();
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
   * Reinitialize variables at resize
   */
  resize() {
    // on smartphones a vertical scroll triggers a resize event
    this.currentWidth = window.innerWidth;
    if (this.currentWidth === this.previousWidth) return;

    this.previousWidth = window.innerWidth;
    this.carousel.updateProperties();
    this.slider.updateProperties();

    this.slider.stopAutoPlay();
    const slideNumberBeforeChange = this.slider.currentSlide();
    this.slider.currentSlide.set(0);
    const slideHasChanged =
      slideNumberBeforeChange !== this.slider.currentSlide();
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
    if (!this.isBrowser) return;

    this.carouselViewContainer.clear();
    window.removeEventListener('resize', this.resizeEvent);
    window.removeEventListener('mouseup', this.mouseUpEvent);
    document.removeEventListener('visibilitychange', this.visibilityEvent);
    this.slider.stopAutoPlay();
  }
}
