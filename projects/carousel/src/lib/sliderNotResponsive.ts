import { Carousel } from './carousel';
import { visibilityEvent } from './interfaces';

export class SliderNotResponsive {
  dragging = false;
  currentSlide = 0;
  lastSlide = 0;
  currentTranslation = 0;
  previousTranslation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  previousX = 0;
  currentX = 0;
  positionChange = 0;
  draggingTranslation = false;
  prevLimit = 0;
  nextLimit = 0;
  offsetNotResponsive!: number;

  constructor(
    private carousel: Carousel,
    private readonly slideToScroll: number,
    private readonly slidingLimitBeforeScroll: number,
    private readonly strechingLimit: number,
    private readonly autoSlide: boolean,
    private readonly animationTimingFn: string,
    private readonly animationTimingMs: number,
    private readonly enableMouseDrag: boolean,
    private readonly enableTouch: boolean,
    private readonly loop: boolean
  ) {
    this.updateProperties();
  }

  updateProperties() {
    this.lastSlide = this.carousel.numberDots - 1;

    // visible part of the offset of the card in px
    this.offsetNotResponsive =
      this.carousel.carouselWidth -
      this.carousel.slideDisplayed * this.carousel.slideWidthWithGap -
      this.carousel.paddingCarousel;
    // non visible part of the offset of the card
    this.offsetNotResponsive =
      this.carousel.slideWidth - this.offsetNotResponsive;

    this.offsetNotResponsive +=
      (this.carousel.totalSlides - this.carousel.slideDisplayed - 1) *
      this.carousel.slideWidthWithGap;
    console.log(this.offsetNotResponsive);
    this.carousel.maxScrollableContent = this.offsetNotResponsive;
  }

  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;

    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    this.previousX = this.startX;
    this.carousel.slidesContainer.style.transition = 'none';
  }

  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;

    this.dragging = false;

    this.previousTranslation = this.currentTranslation;
    const limit =
      (this.currentSlide === 0 && this.direction === 'left') ||
      (this.currentSlide === this.lastSlide && this.direction === 'right');

    if (this.draggingTranslation && limit) {
      this.computeTransformation(this.currentSlide);
    }
  }

  getLimitSlide(index: number) {
    let limit = (this.currentSlide + index) * this.carousel.slideWidthWithGap;

    if (index === 0) {
      limit -= this.carousel.slideWidthWithGap;
    }

    return limit < 0 ? 0 : limit;
  }

  getDirection() {
    if (this.previousX > this.currentX) {
      this.direction = 'right';
    } else if (this.previousX < this.currentX) {
      this.direction = 'left';
    }
  }

  currentEventIsDisabled(event: MouseEvent | TouchEvent) {
    if (
      (event instanceof MouseEvent && !this.enableMouseDrag) ||
      (event instanceof TouchEvent && !this.enableTouch)
    ) {
      return true;
    }

    return false;
  }

  dragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    if (this.currentEventIsDisabled(event)) return;

    this.currentX =
      event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;

    this.getDirection();
    this.previousX = this.currentX;

    this.nextLimit = this.getLimitSlide(1);
    this.prevLimit = this.getLimitSlide(0);
    // console.log(
    //   this.direction,
    //   'prev:' + this.prevLimit,
    //   'next:' + this.nextLimit
    // );

    this.positionChange = this.currentX - this.startX;
    this.currentTranslation = this.positionChange + this.previousTranslation;
    // console.log(this.currentTranslation);

    // First or last slide exceeding limit
    if (
      (this.currentTranslation > this.strechingLimit &&
        this.currentSlide === 0) ||
      this.currentTranslation <
        -this.carousel.maxScrollableContent - this.strechingLimit
    ) {
      return;
    }

    this.draggingTranslation = true;
    this.carousel.slidesContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

    this.modifyCurrentSlide();
  }

  modifyCurrentSlide() {
    const limit =
      (this.currentSlide === this.lastSlide - 1 &&
        this.direction === 'right') ||
      (this.currentSlide === this.lastSlide && this.direction === 'right'); // && !this.responsive

    if (this.autoSlide && !limit) {
      // Percent of mouse mouvement to card width
      const moveComparedToSlide =
        (this.positionChange / this.carousel.slideWidth) * 100;

      if (moveComparedToSlide < -this.slidingLimitBeforeScroll) {
        this.currentSlide++;
        this.computeTransformation(this.currentSlide);
      } else if (moveComparedToSlide > this.slidingLimitBeforeScroll) {
        this.currentSlide--;
        this.computeTransformation(this.currentSlide);
      }

      return;
    }

    if (
      -this.currentTranslation >= this.nextLimit ||
      (-this.currentTranslation >= this.offsetNotResponsive &&
        this.currentSlide < this.lastSlide)
    ) {
      this.currentSlide++;
      console.log(this.currentSlide);
    } else if (
      -this.currentTranslation < this.prevLimit &&
      -this.currentTranslation < this.offsetNotResponsive &&
      this.currentSlide > 0
    ) {
      this.currentSlide--;
    }
  }

  unActiveTab(event: any) {
    if (
      event.target.visibilityState === 'visible' &&
      this.draggingTranslation
    ) {
      this.dragStop(event);
    }
  }

  prev() {
    this.direction = 'left';
    if ((this.currentSlide -= this.slideToScroll) < 0) {
      this.currentSlide = 0;
    }

    this.computeTransformation(this.currentSlide);
  }

  next() {
    this.direction = 'right';
    if ((this.currentSlide += this.slideToScroll) > this.lastSlide) {
      this.currentSlide = this.lastSlide;
    }

    this.computeTransformation(this.currentSlide);
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
    this.carousel.slidesContainer.style.transition = `transform ${this.animationTimingMs}ms ${this.animationTimingFn}`;

    this.carousel.slidesContainer.style.transform = `translate3d(${-transformation}px, 0, 0)`;

    this.dragging = false;
    this.draggingTranslation = false;
    this.previousTranslation = -transformation;
    this.currentTranslation = -transformation;
  }

  goTo(bullet: number) {
    this.currentSlide < bullet
      ? (this.direction = 'right')
      : (this.direction = 'left');
    this.currentSlide = bullet;
    this.computeTransformation(bullet);
  }
}
