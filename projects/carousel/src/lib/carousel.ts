import { visibilityEvent } from './interfaces';

export class Carousel {
  slides!: NodeListOf<HTMLDivElement>;
  slideWidth!: number;
  numberDots!: number;
  arrayNumberDots!: number[];
  dragging = false;
  currentSlide = 0;
  currentTranslation = 0;
  previousTranslation = 0;
  transformation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  slidesContainer!: HTMLDivElement;
  positionChange = 0;
  maxScrollableContent = 0;
  draggingTranslation = false;
  correctionMultipleSlides = 0;
  limitReached = false;
  totalSlides = 0;
  prevLimit = 0;
  nextLimit = 0;
  initialSlideToShow = 1;
  paddingCarousel = 0;

  constructor(
    private carousel: HTMLDivElement,
    private slideToShow: number,
    private minWidthSlide: number,
    private width: number,
    private gap: number,
    private strechingLimit: number,
    private slidingLimit: number
  ) {
    this.init();
  }

  init() {
    this.paddingCarousel = this.getPaddingCarousel();
    this.initialSlideToShow = this.slideToShow;
    this.slidesContainer = this.selectSlideContainer();
    this.slides = this.selectSlides();
    this.totalSlides = this.slides.length;
    this.numberDots = this.setNumberDots();
    this.arrayNumberDots = [...Array(this.numberDots).keys()];
    this.setWidthSlides();
    this.correctionMultipleSlides = this.multipleSlides() ? this.gap : 0;
    this.updateNumberDots();
    this.slideWidth = this.slides[0].offsetWidth;
    this.maxScrollableContent = this.getMaxScroll();
    this.setMaxWidthCarousel();
    this.setWidthSlideContainer();
  }

  setWidthSlides() {
    this.slides.forEach((slide) => {
      // slide.style.width = this.width + '%';
      slide.style.minWidth = this.minWidthSlide + 'px';
    });
  }

  updateSlideToShow() {
    if (window.innerWidth <= 632) {
      this.slideToShow = 1;
    } else if (window.innerWidth <= 932) {
      this.slideToShow = this.initialSlideToShow - 1;
    } else {
      this.slideToShow = this.initialSlideToShow;
    }
  }

  updateNumberDots() {
    this.updateSlideToShow();
    this.numberDots = this.setNumberDots();
    this.arrayNumberDots = [...Array(this.numberDots).keys()];
    this.setMaxWidthCarousel();
    this.setAutoColumnSlideContainer();
    this.setWidthSlideContainer();
    this.maxScrollableContent = this.getMaxScroll();
  }

  getPaddingCarousel() {
    const padding = window
      .getComputedStyle(this.carousel)
      .getPropertyValue('padding');
    return parseFloat(padding) * 2;
  }

  setAutoColumnSlideContainer() {
    const widthCarousel =
      this.carousel.clientWidth -
      this.paddingCarousel -
      (this.slideToShow - 1) * this.correctionMultipleSlides;

    this.slidesContainer.style.gridAutoColumns =
      widthCarousel / this.slideToShow + 'px';
  }

  setWidthSlideContainer() {
    this.slideWidth = this.slides[0].offsetWidth;
    this.slidesContainer.style.minWidth =
      this.totalSlides * (this.slideWidth + this.correctionMultipleSlides) +
      'px';
  }

  selectSlides(): NodeListOf<HTMLDivElement> {
    return this.carousel.querySelectorAll('.carousel-slide');
  }

  selectSlideContainer() {
    return this.carousel.querySelector('.slides-container') as HTMLDivElement;
  }

  setMaxWidthCarousel() {
    this.carousel.style.maxWidth =
      this.slideToShow * this.slideWidth +
      this.minSlideToShowValue() * this.gap +
      this.paddingCarousel +
      'px';
  }

  minSlideToShowValue() {
    if (this.slideToShow - 1 <= 0) {
      return 1;
    }

    return this.slideToShow;
  }

  setNumberDots() {
    return this.multipleSlides()
      ? this.totalSlides - this.slideToShow + 1
      : this.totalSlides;
  }

  multipleSlides() {
    return this.slideToShow > 1;
  }

  dragStart(event: MouseEvent | TouchEvent) {
    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.screenX : event.touches[0].screenX;

    this.slidesContainer.style.transition = 'none';
  }

  dragStop() {
    this.dragging = false;

    this.previousTranslation = this.currentTranslation;
    const limit =
      (this.currentSlide === 0 && this.currentTranslation > 0) ||
      (this.currentSlide === this.numberDots - 1 && this.positionChange < 0);

    if (this.draggingTranslation && limit) {
      this.computeTransformation(this.currentSlide);
      this.previousTranslation =
        this.direction === 'left' && this.currentSlide === 0
          ? 0
          : -this.maxScrollableContent;
    }
  }

  getMaxScroll() {
    return (
      (this.numberDots - 1) * (this.slideWidth + this.correctionMultipleSlides)
    );
  }

  getLimitSlide(index: number) {
    const limit =
      (this.currentSlide + index) * this.correctionMultipleSlides +
      (this.currentSlide + index) * this.slideWidth;
    return limit === 0
      ? this.slideWidth + this.correctionMultipleSlides
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

    // const previousTranslation =
    //   (this.currentSlide + 1) * this.correctionMultipleSlides +
    //   (this.currentSlide + 1) * this.slideWidth;
    // this.currentTranslation = this.positionChange - previousTranslation;
    this.currentTranslation = this.positionChange + this.previousTranslation;
    console.log(this.currentTranslation);

    // First or last slide
    if (
      (this.currentTranslation > this.strechingLimit &&
        this.currentSlide === 0) ||
      this.currentTranslation < -this.maxScrollableContent - this.strechingLimit
    ) {
      return;
    }

    this.transformation = this.currentTranslation;
    if (-this.currentTranslation >= this.nextLimit) {
      this.currentSlide++;
    } else if (
      -this.currentTranslation < this.prevLimit &&
      this.currentSlide > 0
    ) {
      this.currentSlide--;
    }

    this.slidesContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

    this.draggingTranslation = true;
    // if (this.slideToShow === 1) {
    //   this.autoSlide();
    // }
  }

  autoSlide() {
    const moveComparedToSlide = (this.positionChange / this.slideWidth) * 100;
    if (moveComparedToSlide < -this.slidingLimit) {
      // Going right, next slide
      this.computeTransformation(++this.currentSlide);
    } else if (moveComparedToSlide > this.slidingLimit) {
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
    if (this.currentSlide - 1 < 0) {
      return;
    }

    const absTranslation = Math.abs(this.currentTranslation);
    if (
      absTranslation < this.nextLimit &&
      absTranslation > this.prevLimit &&
      this.direction === 'left'
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
    // debugger;
    const transformation =
      (this.slideWidth + this.correctionMultipleSlides) * slide;
    this.changeSlide(transformation);
  }

  changeSlide(transformation: number) {
    this.slidesContainer.style.transition = `transform 0.3s ease-out`;

    this.slidesContainer.style.transform = `translate3d(${-transformation}px, 0, 0)`;

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
