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
    private readonly carousel: HTMLDivElement,
    private readonly maxWidthCarousel: number,
    public slideToShow: number,
    public slideWidth: number,
    public readonly slideMaxWidth: number,
    public readonly gap: number,
    private readonly responsive: boolean,
    private readonly loop: boolean
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
    this.setWidthSlides();
    this.setMaxWidthCarousel();
    this.updateProperties();
    this.slidesContainer.style.gap = `${this.gap}px`;
    this.setDraggableImgToFalse();
  }

  /**
   * Set the slide width and max width
   * NB: In responsive mode, width is automatically adapted through the setAutoColumnSlideContainer() method.
   *
   */
  setWidthSlides() {
    for (const slide of this.slides) {
      slide.style.maxWidth = `${this.slideMaxWidth}px`;

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
    const slideWidthPlusGap = this.slideWidth + this.gap;

    const referenceWidth = Math.min(
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    const slideFitting = Math.floor(referenceWidth / slideWidthPlusGap);
    console.log(slideFitting);

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
      this.maxWidthCarousel || Infinity,
      window.innerWidth
    );

    const numberOfSlidesComputed = Math.floor(
      referenceWidth / slideWidthPlusGap
    );
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
