import { signal } from '@angular/core';

export class Carousel {
  slides!: NodeListOf<HTMLDivElement>;
  originalSlideWidth!: number;
  slideWidthWithGap!: number;

  numberDots = signal(0);
  maxScrollableContent = signal(0);
  arrayNumberDots = signal<number[]>([]);

  slidesContainer!: HTMLDivElement;
  totalSlides = 0;
  initialSlideToShow = 1;
  paddingCarousel = 0;
  carouselWidth!: number;
  widthSlideContainer!: number;
  arrayOfSlides: HTMLDivElement[] = [];

  constructor(
    private readonly carousel: HTMLDivElement,
    private readonly maxWidthCarousel: number | undefined,
    public slideToShow: number,
    public slideWidth: number,
    public readonly slideMaxWidth: number,
    public readonly gap: number,
    private readonly responsive: boolean,
    private readonly loop: boolean
  ) {
    this.init();
  }

  get carouselElement() {
    return this.carousel;
  }

  init() {
    this.paddingCarousel = this.getPaddingCarousel();
    this.initialSlideToShow = this.slideToShow;
    this.slidesContainer = this.selectSlidesContainer();
    this.slides = this.selectSlides();
    this.arrayOfSlides = this.slidesToArray();
    this.totalSlides = this.slides.length;
    this.originalSlideWidth = this.slideWidth;
    this.setWidthSlides();
    this.setMaxWidthCarousel();
    this.updateProperties();
    this.slidesContainer.style.gap = `${this.gap}px`;
    this.setDraggableImgToFalse();
  }

  /**
   * Set the slide width and max width
   * NB: In responsive mode, width is automatically adapted through the setAutoColumnSlideContainer() method.
   * Reselect slides for infinite mode slides creation (this method will be called).
   */
  setWidthSlides() {
    this.slides = this.selectSlides();

    for (const slide of this.slides) {
      slide.style.maxWidth = `${this.slideMaxWidth}px`;
      slide.style.width = this.responsive ? '100%' : `${this.slideWidth}px`;
      slide.style.userSelect = 'none';
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

    this.numberDots.set(this.setNumberDots());
    this.arrayNumberDots.set([...Array(this.numberDots()).keys()]);

    this.slideWidthWithGap = this.slideWidth + this.gap;
    this.setWidthSlideContainer();
    this.maxScrollableContent.set(this.getMaxScroll());
  }

  /**
   * Update slide to show (responsive mode)
   * Computes the number of slide fitting
   */
  updateSlideToShowResponsive() {
    const slideWidthPlusGap = this.originalSlideWidth + this.gap;

    const referenceWidth = Math.min(
      this.carouselWidth,
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    const slideFitting = Math.floor(referenceWidth / slideWidthPlusGap) || 1;

    this.determineSlideToShow(slideFitting);
  }

  /**
   * Determine slide to show
   * Useful to compute the slide displayed on screen and for the slider class.
   * In not responsive mode, the maximum slides to show is determined by the maximum available space and the width of the slide set by the user.
   */
  determineSlideToShow(slideFitting: number) {
    const maxSlidesToShow = this.responsive
      ? this.initialSlideToShow
      : this.totalSlides;

    this.slideToShow = Math.min(slideFitting, maxSlidesToShow);
  }

  /**
   * Update slide to show (not responsive mode)
   * Computes the number of slide fitting. The number of slides to be shown are determined by the number of slides fitting within its container.
   */
  updateSlideToShowNotResponsive() {
    const slideWidthPlusGap = this.slideWidth + this.gap;

    const referenceWidth = Math.min(
      this.carouselWidth,
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    const numberOfSlidesComputed =
      Math.floor(referenceWidth / slideWidthPlusGap) || 1;
    const slideFitting = Math.min(numberOfSlidesComputed, this.totalSlides);

    this.determineSlideToShow(slideFitting);
  }

  getPaddingCarousel() {
    const computedStyle = window.getComputedStyle(this.carousel);
    const paddingLeft = computedStyle.getPropertyValue('padding-left');
    const paddingRight = computedStyle.getPropertyValue('padding-right');

    return parseFloat(paddingLeft) + parseFloat(paddingRight);
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
    if (this.loop) return this.totalSlides;

    return this.slideToShow > 1
      ? this.totalSlides - this.slideToShow + 1
      : this.totalSlides;
  }

  /**
   * Get the max scrollable content
   * Useful for the streching effect (not infinite mode), end of the slides
   */
  getMaxScroll() {
    return (this.numberDots() - 1) * this.slideWidthWithGap;
  }

  setDraggableImgToFalse() {
    const images = this.slidesContainer.querySelectorAll('img');
    images?.forEach((image) => {
      image.setAttribute('draggable', 'false');
    });
  }
}
