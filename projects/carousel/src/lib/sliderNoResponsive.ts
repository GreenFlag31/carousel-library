import { Carousel } from './carousel';
import { visibilityEvent } from './interfaces';

export class SliderNoResponsive {
  dragging = false;
  currentSlide = 0;
  lastSlide = 0;
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
    this.offset();
  }

  offset() {
    this.lastSlide = this.carousel.numberDots - 1;

    // Get N of full cards visible without offset, not responsive mode calculated previously
    // visible part of the offset in px
    this.offsetNotResponsive =
      this.carousel.carouselWidth -
      this.carousel.slideDisplayed * this.carousel.slideWidthWithGap -
      20;
    // non visible part of the offset
    this.offsetNotResponsive =
      this.carousel.slideWidth - this.offsetNotResponsive;

    this.offsetNotResponsive +=
      (this.carousel.totalSlides - this.carousel.slideDisplayed - 1) *
      this.carousel.slideWidthWithGap;
    console.log(this.offsetNotResponsive);
    this.carousel.maxScrollableContent = this.offsetNotResponsive;
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
      (this.currentSlide === this.lastSlide && this.positionChange < 0);

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

    return limit === 0 ? this.carousel.slideWidthWithGap : limit;
  }

  getDirection() {
    this.direction = this.positionChange < 0 ? 'right' : 'left';
  }

  updateDirectionNavWithBullet(bullet: number) {
    this.currentSlide < bullet
      ? (this.direction = 'right')
      : (this.direction = 'left');
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

    // Percent of mouse mouvement to card width
    const moveComparedToSlide =
      (this.positionChange / this.carousel.slideWidth) * 100;
    this.modifyCurrentSlide(moveComparedToSlide);

    this.draggingTranslation = true;
    this.carousel.slidesContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

    if (this.autoSlide) {
      this.autoSlideFn(moveComparedToSlide);
    }
  }

  autoSlideFn(moveComparedToSlide: number) {
    if (
      moveComparedToSlide < -this.slidingLimitBeforeScroll ||
      moveComparedToSlide > this.slidingLimitBeforeScroll
    ) {
      this.computeTransformation(this.currentSlide);
    }
  }

  modifyCurrentSlide(moveComparedToSlide: number) {
    if (
      this.autoSlide &&
      moveComparedToSlide < -this.slidingLimitBeforeScroll &&
      this.currentSlide < this.lastSlide
    ) {
      this.currentSlide++;
      return;
    }

    if (
      -this.currentTranslation >= this.nextLimit ||
      (-this.currentTranslation >= this.offsetNotResponsive &&
        this.currentSlide < this.lastSlide)
    ) {
      this.currentSlide++;
    } else if (
      -this.currentTranslation < this.prevLimit &&
      -this.currentTranslation < this.offsetNotResponsive &&
      this.currentSlide > 0
    ) {
      this.currentSlide--;
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
      this.currentSlide < this.lastSlide
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
    if (slide === this.lastSlide && this.direction === 'right') {
      transformation = this.offsetNotResponsive;
    } else {
      transformation = this.carousel.slideWidthWithGap * slide;
    }

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
    this.updateDirectionNavWithBullet(bullet);
    this.currentSlide = bullet;
    this.computeTransformation(bullet);
  }
}
