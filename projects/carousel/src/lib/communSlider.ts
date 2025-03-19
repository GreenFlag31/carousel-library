import { ChangeDetectorRef, signal } from '@angular/core';
import { Carousel } from './carousel';
import { CarouselService } from './carousel.service';

export class CommunSlider {
  dragging = signal(false);
  currentSlide = signal(0);
  lastWindow = 0;
  currentTranslation = signal(0);
  previousTranslation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  previousX = 0;
  currentX = 0;
  positionChange = 0;
  prevLimit = 0;
  nextLimit = 0;
  slidesContainer!: HTMLDivElement;
  arrayOfSlides!: HTMLDivElement[];
  totalAmountOfSlides!: number;
  fullWidthInf = 0;
  lastWindowTranslation = 0;
  totalSlides = 0;
  DOMLimitReached = false;
  visibleOffsetCardNotResponsive = 0;
  invisibleOffsetCardNotResponsive = 0;
  accumulatedSlide = 0;
  currentCarouselID = 0;
  autoInterval!: number;
  playActive = signal(false);
  playButtonDisabled = signal(false);
  directionAutoPlay = (slides: number) => {};

  constructor(
    readonly carousel: Carousel,
    readonly responsive: boolean,
    readonly slideToScroll: number,
    readonly LIMIT_AUTO_SLIDE: number,
    readonly strechingLimit: number,
    readonly autoSlide: boolean,
    readonly animationTimingFn: string,
    readonly animationTimingMs: number,
    readonly enableMouseDrag: boolean,
    readonly enableTouch: boolean,
    readonly autoPlay: boolean,
    readonly autoPlayInterval: number,
    readonly autoPlayAtStart: boolean,
    readonly playDirection: string,
    readonly autoplaySlideToScroll: number,
    public carouselService: CarouselService,
    public cd: ChangeDetectorRef
  ) {
    this.initProperties();
    this.updateProperties();
  }

  initProperties() {
    this.slidesContainer = this.carousel.slidesContainer;
    this.arrayOfSlides = this.carousel.arrayOfSlides;

    this.totalSlides = this.carousel.totalSlides;
    this.totalAmountOfSlides = this.totalSlides;

    this.nextLimit = Math.floor(this.carousel.slideWidthWithGap);
    this.prevLimit = -this.carousel.slideWidthWithGap;

    if (this.autoPlayAtStart) this.launchAutoPlay();
  }

  launchAutoPlay() {
    if (!this.autoPlay) return;

    this.playActive.set(true);

    this.autoInterval = window.setInterval(() => {
      this.directionAutoPlay(this.autoplaySlideToScroll);
      this.cd.markForCheck();
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (!this.autoPlay) return;

    this.playActive.set(false);
    clearInterval(this.autoInterval);
  }

  /**
   * Update properties of the slider
   * Fired at start and at resizing.
   */
  updateProperties() {
    this.updateNotResponsive();

    this.lastWindow = this.carousel.numberDots() - 1;
    this.fullWidthInf = this.totalSlides * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation =
      this.slidesContainer.clientWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap +
      this.carousel.gap;

    this.lastWindowTranslation += this.responsive
      ? 0
      : -this.visibleOffsetCardNotResponsive - this.carousel.gap;

    const maxScrollable =
      this.carousel.widthSlideContainer -
      this.carousel.carouselWidth +
      this.carousel.paddingCarousel;
    this.carousel.maxScrollableContent.set(maxScrollable);

    if (this.carousel.numberDots() === 1) {
      // if all slides visible in one window, max scrollable content equals 0
      this.carousel.maxScrollableContent.set(0);
    }
  }

  updateNotResponsive() {
    if (this.responsive) return;

    // visible part of the offset of the card in px
    this.visibleOffsetCardNotResponsive =
      this.carousel.carouselWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap -
      this.carousel.paddingCarousel;

    this.invisibleOffsetCardNotResponsive =
      this.carousel.slideWidth - this.visibleOffsetCardNotResponsive;
  }

  /**
   * Fired at drag start
   * Instantiate property of the starting drag point on the X axis. Used to compute the translation.
   * Disabling the transition while applying the transformation because of the attached animation.
   */
  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    clearInterval(this.autoInterval);

    this.dragging.set(true);
    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    // Useful for direction detection
    this.previousX = this.startX;
    this.slidesContainer.style.transition = 'none';
  }

  /**
   * Checks if current event is allowed by user.
   * TouchEvent partially supported on Firefox (and working on Safari despite the MDN docs).
   */
  currentEventIsDisabled(event: MouseEvent | TouchEvent) {
    const isMouseEvent = event instanceof MouseEvent;

    return (
      (isMouseEvent && !this.enableMouseDrag) ||
      (!isMouseEvent && !this.enableTouch)
    );
  }

  /**
   * Update the direction
   * Do not update the direction in case of the same previous position.
   */
  setDirection() {
    if (this.previousX > this.currentX) {
      this.direction = 'right';
    } else if (this.previousX < this.currentX) {
      this.direction = 'left';
    }
  }

  /**
   * Update the last window translation
   * Useful to get the max translation at the end of the slides.
   * In not responsive mode, there is possibly a not fully displayed card (card offset).
   */
  updateLastWindowTranslation() {
    const total = this.totalAmountOfSlides * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation =
      total - this.carousel.slideToShow * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation += this.responsive
      ? 0
      : -this.visibleOffsetCardNotResponsive - this.carousel.gap;
  }

  /**
   * Decrease limit (movement to the left)
   * In infinite mode, take full width of a set if on the first slide as new slides are created to the left (a whole set offset).
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  decreaseLimits(slidesCreatedOnTheLeft = false) {
    let translationCorrectionAfterClone = this.prevLimit;

    if (slidesCreatedOnTheLeft) {
      translationCorrectionAfterClone = this.fullWidthInf;
    }

    this.prevLimit =
      translationCorrectionAfterClone - this.carousel.slideWidthWithGap;

    this.nextLimit = this.prevLimit + 2 * this.carousel.slideWidthWithGap;

    this.prevLimit = Math.floor(this.prevLimit);
    this.nextLimit = Math.floor(this.nextLimit);
  }

  /**
   * Increase limit on basis of previous computed limits (movement to the right)
   * Schema: || previous | current || next
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  increaseLimits() {
    this.nextLimit += Math.floor(this.carousel.slideWidthWithGap);
    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    // console.log(this.prevLimit, this.nextLimit);
  }

  /**
   * Change prev and next limit on basis of the provided slide number
   * Prev and next limit are always calculated as the following:
   * || <= prev | current || <= next
   */
  changePrevAndNextLimits(slideNumber: number) {
    const limitInPX = slideNumber * this.carousel.slideWidthWithGap;
    this.nextLimit = Math.floor(limitInPX + this.carousel.slideWidthWithGap);

    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    // console.log(this.prevLimit, this.nextLimit);
  }

  fireSlideChangeEvent(slideHasChanged: boolean, slide: number) {
    if (!slideHasChanged) return;

    this.carouselService.emit(slide, this.carousel.carouselElement);
  }

  applyTransformation(transformation: number) {
    this.slidesContainer.style.transition = `transform ${this.animationTimingMs}ms ${this.animationTimingFn}`;

    this.applyTranslation(-transformation);

    this.dragging.set(false);
    this.previousTranslation = -transformation;
    this.currentTranslation.set(-transformation);
  }

  applyTranslation(transformation: number) {
    this.slidesContainer.style.transform = `translate3d(${transformation}px, 0, 0)`;
  }
}
