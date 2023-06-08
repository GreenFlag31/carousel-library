import { Carousel } from './carousel';
import { visibilityEvent } from './interfaces';

export class SliderNoResponsive {
  dragging = false;
  currentSlide = 0;
  currentTranslation = 0;
  previousTranslation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  positionChange = 0;
  draggingTranslation = false;
  totalSlides = 0;
  prevLimit = 0;
  nextLimit = 0;
  initialSlideToShow = 1;
  offsetNotResponsive!: number;

  constructor(
    private carousel: Carousel,
    private readonly slideToScroll: number,
    private slidingLimitBeforeScroll: number,
    private strechingLimit: number,
    private autoSlide: boolean
  ) {
    // this.init();
  }

  init() {
    this.restOfTranslation();
  }

  restOfTranslation() {
    this.offsetNotResponsive =
      this.carousel.minWidthSlideContainer +
      this.currentTranslation -
      this.carousel.carouselWidth +
      this.carousel.paddingCarousel;

    this.carousel.maxScrollableContent =
      -this.previousTranslation + this.offsetNotResponsive;
  }

  dragStart(event: MouseEvent | TouchEvent) {
    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.screenX : event.touches[0].screenX;

    this.carousel.slidesContainer.style.transition = 'none';
  }

  dragStop() {
    this.dragging = false;

    this.previousTranslation = this.currentTranslation;
    const limit =
      (this.currentSlide === 0 && this.currentTranslation > 0) ||
      (this.currentSlide === this.carousel.numberDots - 1 &&
        this.positionChange < 0);

    if (this.draggingTranslation && limit) {
      this.computeTransformation(this.currentSlide);
      this.previousTranslation =
        this.direction === 'left' && this.currentSlide === 0
          ? 0
          : -this.carousel.maxScrollableContent;
    }
  }

  getLimitSlide(index: number) {
    const limit =
      (this.currentSlide + index) * this.carousel.correctionMultipleSlides +
      (this.currentSlide + index) * this.carousel.slideWidth;
    return limit === 0
      ? this.carousel.slideWidth + this.carousel.correctionMultipleSlides
      : limit;
  }

  getDirection() {
    this.direction = this.positionChange < 0 ? 'right' : 'left';
  }

  dragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;

    const XCoordinate =
      event instanceof MouseEvent
        ? event.screenX
        : event.changedTouches[0].screenX;
    this.positionChange = XCoordinate - this.startX;
    this.getDirection();

    this.nextLimit = this.getLimitSlide(1);
    this.prevLimit = this.getLimitSlide(0);

    this.currentTranslation = this.positionChange + this.previousTranslation;
    console.log(this.currentTranslation);

    // First or last slide
    if (
      (this.currentTranslation > this.strechingLimit &&
        this.currentSlide === 0) ||
      this.currentTranslation <
        -this.carousel.maxScrollableContent - this.strechingLimit
    ) {
      return;
    }

    if (-this.currentTranslation >= this.nextLimit) {
      this.currentSlide++;
    } else if (
      -this.currentTranslation < this.prevLimit &&
      this.currentSlide > 0
    ) {
      this.currentSlide--;
    }

    this.carousel.slidesContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

    this.draggingTranslation = true;
    // if (this.slideToShow === 1) {
    //   this.autoSlide();
    // }
  }

  autoSlideFn() {
    const moveComparedToSlide =
      (this.positionChange / this.carousel.slideWidth) * 100;
    if (moveComparedToSlide < -this.slidingLimitBeforeScroll) {
      // Going right, next slide
      this.computeTransformation(++this.currentSlide);
    } else if (moveComparedToSlide > this.slidingLimitBeforeScroll) {
      this.computeTransformation(--this.currentSlide);
    }
  }

  unActiveTab(event: visibilityEvent) {
    if (
      event.target.visibilityState === 'visible' &&
      this.draggingTranslation
    ) {
      this.dragStop();
    }
  }

  previous() {
    this.direction = 'left';
    this.checkGoingBack();
    this.computeTransformation(this.currentSlide);
  }

  checkGoingBack() {
    // debugger;
    if (this.currentSlide - 1 < 0) {
      return;
    }

    const absTranslation = Math.abs(this.currentTranslation);
    if (
      absTranslation < this.nextLimit &&
      absTranslation > this.prevLimit &&
      this.direction === 'left' &&
      this.currentSlide < this.carousel.numberDots - 1
    ) {
      return;
    }

    return this.currentSlide--;
  }

  next() {
    this.direction = 'right';
    this.computeTransformation(++this.currentSlide);
  }

  computeTransformation(slide: number) {
    let transformation!: number;
    if (slide === this.carousel.numberDots - 1 && this.direction === 'right') {
      this.restOfTranslation();
      transformation = -this.previousTranslation + this.offsetNotResponsive;
    } else {
      transformation =
        (this.carousel.slideWidth + this.carousel.correctionMultipleSlides) *
        slide;
    }

    console.log(transformation);

    this.changeSlide(transformation);
  }

  changeSlide(transformation: number) {
    this.carousel.slidesContainer.style.transition = `transform 0.3s ease-out`;

    this.carousel.slidesContainer.style.transform = `translate3d(${-transformation}px, 0, 0)`;

    this.dragging = false;
    this.draggingTranslation = false;
    this.previousTranslation = -transformation;
    this.currentTranslation = -transformation;
  }

  goTo(bullet: number) {
    this.currentSlide = bullet;
    this.computeTransformation(bullet);
  }
}
