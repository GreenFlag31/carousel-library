export class Carousel {
  slides!: NodeListOf<HTMLDivElement>;
  slideWidthWithGap!: number;
  numberDots!: number;
  arrayNumberDots: number[] = [];
  slidesContainer!: HTMLDivElement;
  maxScrollableContent = 0;
  totalSlides = 0;
  initialSlideToShow = 1;
  paddingCarousel = 0;
  carouselWidth!: number;
  widthSlideContainer!: number;
  arrayOfSlides: HTMLDivElement[] = [];

  constructor(
    private carousel: HTMLDivElement,
    private maxWidthCarousel: number,
    public slideToShow: number,
    private slideMinWidth: number,
    public slideWidth: number,
    public gap: number,
    private responsive: boolean,
    private loop: boolean
  ) {
    this.init();
  }

  init() {
    this.paddingCarousel = this.getPaddingCarousel();
    this.initialSlideToShow = this.slideToShow;
    this.slidesContainer = this.selectSlidesContainer();
    this.slides = this.selectSlides();
    this.arrayOfSlides = this.slidesToArray();
    this.totalSlides = this.slides.length;
    this.slideWidth = Math.max(this.slideMinWidth, this.slideWidth);
    this.setWidthSlides();
    this.setMaxWidthCarousel();
    this.updateProperties();
    this.slidesContainer.style.gap = `${this.gap}px`;
    this.setDraggableImgToFalse();
  }

  /**
   * Set the slide width and min width
   * Width only affect not responsive mode. In responsive mode, width is automatically adapted through the setAutoColumnSlideContainer() method.
   *
   */
  setWidthSlides() {
    for (const slide of this.slides) {
      slide.style.minWidth = `${this.slideMinWidth}px`;

      if (!this.responsive) {
        slide.style.width = `${this.slideWidth}px`;
      }
    }
  }

  /**
   * Update carousel properties
   * Occurs at start and at resizing.
   */
  updateProperties() {
    this.carouselWidth = this.carousel.clientWidth;
    if (this.responsive) {
      this.updateSlideToShowResponsive();
      this.setAutoColumnSlideContainer();
    } else {
      this.updateSlideToShowNotResponsive();
    }

    this.numberDots = this.setNumberDots();
    this.arrayNumberDots = [...Array(this.numberDots).keys()];

    this.slideWidthWithGap = this.slideWidth + this.gap;
    this.setWidthSlideContainer();
    this.maxScrollableContent = this.getMaxScroll();
  }

  /**
   * Update slide to show (responsive mode)
   * Computes the number of slide fitting
   */
  updateSlideToShowResponsive() {
    const minWidthPlusGap = this.slideMinWidth + this.gap;

    if (minWidthPlusGap === 0) {
      throw new Error(
        'Unable to update slide to show (responsive mode), min width of the slide and gap equal 0'
      );
    }

    let slideFitting = 1;
    const referenceWidth = Math.min(
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    while (referenceWidth > minWidthPlusGap * slideFitting) {
      slideFitting++;
    }
    slideFitting--;

    this.determineSlideToShow(slideFitting);
  }

  determineSlideToShow(slideFitting: number) {
    if (slideFitting === 0) {
      this.slideToShow = 1;
    } else {
      this.slideToShow = Math.min(slideFitting, this.initialSlideToShow);
    }
  }

  /**
   * Update slide to show (not responsive mode)
   * Computes the number of slide fitting
   */
  updateSlideToShowNotResponsive() {
    const slidePlusGap = this.slideWidth + this.gap;

    if (slidePlusGap === 0) {
      throw new Error(
        'Unable to update slide to show (not responsive mode), min width of the slide and gap equal 0'
      );
    }

    let slideFitting = 1;
    const referenceWidth = Math.min(
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    while (referenceWidth > slideFitting * slidePlusGap) {
      slideFitting++;
    }
    slideFitting--;

    this.determineSlideToShow(slideFitting);
  }

  getPaddingCarousel() {
    const padding = window
      .getComputedStyle(this.carousel)
      .getPropertyValue('padding-left');
    return parseFloat(padding) * 2;
  }

  setMaxWidthCarousel() {
    this.carousel.style.maxWidth = `${this.maxWidthCarousel}px`;
  }

  /**
   * Set the with of a slide, responsive mode
   * There are [n cards - 1] gaps (3 cards, 2 gaps)
   */
  setAutoColumnSlideContainer() {
    const windowWidth =
      this.carouselWidth -
      this.paddingCarousel -
      (this.slideToShow - 1) * this.gap;

    const widthPerSlide = windowWidth / this.slideToShow;
    this.slidesContainer.style.gridAutoColumns = `${widthPerSlide}px`;

    this.slideWidth = widthPerSlide;
  }

  /**
   * Define the slide container width
   * Make non visible gaps of non visible cards scrollable and is used to compute the maxScrollableContent (strechingEffect)
   */
  setWidthSlideContainer() {
    this.widthSlideContainer =
      this.selectSlides().length * this.slideWidthWithGap - this.gap;
    this.slidesContainer.style.width = `${this.widthSlideContainer}px`;
  }

  selectSlides(): NodeListOf<HTMLDivElement> {
    return this.carousel.querySelectorAll('.carousel-slide');
  }

  slidesToArray() {
    return Array.from(this.slides);
  }

  selectSlidesContainer() {
    return this.carousel.querySelector('.slides-container') as HTMLDivElement;
  }

  /**
   * Set number of dots
   * If infinite mode, one more window than normal mode.
   */
  setNumberDots() {
    if (this.loop) {
      return this.totalSlides === this.slideToShow ? 1 : this.totalSlides;
    }

    return this.slideToShow > 1
      ? this.totalSlides - this.slideToShow + 1
      : this.totalSlides;
  }

  /**
   * Get the max scrollable content
   * Useful for the streching effect (not infinite mode), end of the slides
   */
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
