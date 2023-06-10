import { Carousel } from './carousel';
import { visibilityEvent } from './interfaces';

export class SliderResponsive {
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
  totalSlides = 0;
  prevLimit = 0;
  nextLimit = 0;
  initialSlideToShow = 1;

  constructor(
    private carousel: Carousel,
    private readonly slideToScroll: number,
    private slidingLimitBeforeScroll: number,
    private strechingLimit: number,
    private autoSlide: boolean
  ) {
    this.init();
  }

  init() {
    this.lastSlide = this.carousel.numberDots - 1;
  }

  dragStart(event: MouseEvent | TouchEvent) {
    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    this.previousX = this.startX;
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

  dragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;

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
    if (this.autoSlide) {
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

    if (-this.currentTranslation >= this.nextLimit) {
      this.currentSlide++;
    } else if (
      -this.currentTranslation < this.prevLimit &&
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
    if (this.currentSlide - this.slideToScroll < 0) {
      this.currentSlide = 0;
      return;
    }

    // if (!this.autoSlide) {
    //   if (this.goingBackNoAutoSlide()) return;
    // }

    return (this.currentSlide -= this.slideToScroll);
  }

  // goingBackNoAutoSlide() {
  //   const absTranslation = Math.abs(this.currentTranslation);
  //   if (
  //     absTranslation < this.nextLimit &&
  //     absTranslation > this.prevLimit &&
  //     this.direction === 'left'
  //   ) {
  //     this.currentSlide = this.currentSlide - this.slideToScroll + 1;
  //     return true;
  //   }

  //   return false;
  // }

  next() {
    this.direction = 'right';

    (this.currentSlide += this.slideToScroll) > this.lastSlide
      ? (this.currentSlide = this.lastSlide)
      : this.currentSlide;
    this.computeTransformation(this.currentSlide);
  }

  computeTransformation(slide: number) {
    const transformation = this.carousel.slideWidthWithGap * slide;

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

  updateDirectionNavWithBullet(bullet: number) {
    this.currentSlide < bullet
      ? (this.direction = 'right')
      : (this.direction = 'left');
  }
}
