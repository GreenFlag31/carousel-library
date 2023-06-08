import { visibilityEvent } from './interfaces';

export class Carousel {
  slides!: NodeListOf<HTMLDivElement>;
  slideWidth!: number;
  numberDots!: number;
  arrayNumberDots!: number[];
  slidesContainer!: HTMLDivElement;
  maxScrollableContent = 0;
  correctionMultipleSlides = 0;
  totalSlides = 0;
  initialSlideToShow = 1;
  paddingCarousel = 0;
  carouselWidth!: number;
  minWidthSlideContainer!: number;

  constructor(
    private carousel: HTMLDivElement,
    private slideToShow: number,
    private minWidthSlide: number,
    private width: number,
    private gap: number,
    private responsive: boolean
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
    this.slideWidth = this.slides[0].offsetWidth;
    this.updateProperties();
    this.carouselWidth = this.carousel.clientWidth;
    this.slidesContainer.style.gap = this.gap + 'px';
  }

  setWidthSlides() {
    this.slides.forEach((slide) => {
      slide.style.minWidth = this.minWidthSlide + 'px';
      if (this.responsive) return;
      slide.style.width = this.width + 'px';
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

  updateProperties() {
    this.updateSlideToShow();
    this.numberDots = this.setNumberDots();
    this.arrayNumberDots = [...Array(this.numberDots).keys()];
    // this.setMaxWidthCarousel();
    if (this.responsive) this.setAutoColumnSlideContainer();
    this.setMinWidthSlideContainer();
    this.maxScrollableContent = this.getMaxScroll();
  }

  getPaddingCarousel() {
    const padding = window
      .getComputedStyle(this.carousel)
      .getPropertyValue('padding');
    return parseFloat(padding) * 2;
  }

  setMaxWidthCarousel() {
    this.slideWidth = this.slides[0].offsetWidth;
    this.carousel.style.maxWidth =
      this.slideToShow * this.slideWidth +
      this.minSlideToShowValue() * this.gap +
      this.paddingCarousel +
      'px';
  }

  setAutoColumnSlideContainer() {
    const widthCarousel =
      this.carousel.clientWidth -
      this.paddingCarousel -
      (this.slideToShow - 1) * this.correctionMultipleSlides;

    this.slidesContainer.style.gridAutoColumns =
      widthCarousel / this.slideToShow + 'px';
  }

  setMinWidthSlideContainer() {
    this.slideWidth = this.slides[0].offsetWidth;
    this.minWidthSlideContainer =
      this.totalSlides * this.slideWidth +
      (this.totalSlides - 1) * this.correctionMultipleSlides;
    this.slidesContainer.style.minWidth = this.minWidthSlideContainer + 'px';
  }

  selectSlides(): NodeListOf<HTMLDivElement> {
    return this.carousel.querySelectorAll('.carousel-slide');
  }

  selectSlideContainer() {
    return this.carousel.querySelector('.slides-container') as HTMLDivElement;
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

  getMaxScroll() {
    // debugger;
    return (
      (this.numberDots - 1) * (this.slideWidth + this.correctionMultipleSlides)
    );
  }

  multipleSlides() {
    return this.slideToShow > 1;
  }
}
