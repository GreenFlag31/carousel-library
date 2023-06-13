export class Carousel {
  slides!: NodeListOf<HTMLDivElement>;
  slideWidth!: number;
  slideWidthWithGap!: number;
  numberDots!: number;
  arrayNumberDots!: number[];
  slidesContainer!: HTMLDivElement;
  maxScrollableContent = 0;
  totalSlides = 0;
  initialSlideToShow = 1;
  paddingCarousel = 0;
  carouselWidth!: number;
  widthSlideContainer!: number;
  slideDisplayed = 1;

  constructor(
    private carousel: HTMLDivElement,
    private maxWidthCarousel: number,
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
    this.setWidthSlides();
    this.setMaxWidthCarousel();
    this.updateProperties();
    this.slidesContainer.style.gap = this.gap + 'px';
    this.setDraggableImgToFalse();
  }

  setWidthSlides() {
    this.slides.forEach((slide) => {
      slide.style.minWidth = this.minWidthSlide + 'px';
      if (this.responsive) return;
      slide.style.width = this.width + 'px';
    });
  }

  updateProperties() {
    this.carouselWidth = this.carousel.clientWidth;
    if (this.responsive) {
      this.updateSlideToShow();
    } else {
      this.updateSlideDisplayed();
    }
    this.numberDots = this.setNumberDots();
    this.arrayNumberDots = [...Array(this.numberDots).keys()];
    if (this.responsive) this.setAutoColumnSlideContainer();

    this.slideWidthWithGap = this.slideWidth + this.gap;
    this.setWidthSlideContainer();
    this.maxScrollableContent = this.getMaxScroll();
  }

  updateSlideToShow() {
    // Only responsive mode
    const minWidthPlusGap = this.minWidthSlide + this.gap;

    let slideFitting = 1;
    let referenceWidth = this.maxWidthCarousel || window.innerWidth;
    if (this.maxWidthCarousel > window.innerWidth) {
      referenceWidth = window.innerWidth;
    }

    while (referenceWidth > minWidthPlusGap * slideFitting) {
      slideFitting++;
    }
    slideFitting--;
    this.determineSlideToShow(slideFitting);
  }

  determineSlideToShow(slideFitting: number) {
    if (slideFitting > this.totalSlides) {
      this.slideToShow = this.totalSlides;
    } else if (slideFitting === 0) {
      this.slideToShow = 1;
    } else {
      this.slideToShow = slideFitting;
    }

    console.log(this.slideToShow);
  }

  updateSlideDisplayed() {
    this.slideWidth = this.slides[0].offsetWidth;
    this.slideDisplayed = 1;
    // Get number of FULL CARDS visible without offset, not responsive mode
    while (this.carouselWidth > this.slideDisplayed * this.slideWidth) {
      this.slideDisplayed++;
    }
    this.slideDisplayed--;
    this.determineSlideToShow(this.slideDisplayed);
  }

  getPaddingCarousel() {
    const padding = window
      .getComputedStyle(this.carousel)
      .getPropertyValue('padding-left');
    return parseFloat(padding) * 2;
  }

  setMaxWidthCarousel() {
    this.carousel.style.maxWidth = this.maxWidthCarousel + 'px';
  }

  setAutoColumnSlideContainer() {
    const widthCarousel =
      this.carouselWidth -
      this.paddingCarousel -
      (this.slideToShow - 1) * this.gap;

    this.slidesContainer.style.gridAutoColumns =
      widthCarousel / this.slideToShow + 'px';

    this.slideWidth = this.slides[0].offsetWidth;
  }

  setWidthSlideContainer() {
    // otherwise non visible gaps of non visible cards will not be scrollable
    this.widthSlideContainer =
      this.totalSlides * this.slideWidth + (this.totalSlides - 1) * this.gap;
    this.slidesContainer.style.width = this.widthSlideContainer + 'px';
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
    return this.slideToShow > 1
      ? this.totalSlides - this.slideToShow + 1
      : this.totalSlides;
  }

  getMaxScroll() {
    return (this.numberDots - 1) * this.slideWidthWithGap;
  }

  setDraggableImgToFalse() {
    const images = this.slidesContainer.querySelectorAll('img');
    images?.forEach((image) => {
      image.setAttribute('draggable', 'false');
    });
  }
}
