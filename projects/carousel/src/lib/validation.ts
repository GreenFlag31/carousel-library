export class Validation {
  carouselSlides!: NodeListOf<HTMLDivElement> | undefined;

  constructor(
    private readonly carousel: HTMLDivElement,
    private readonly slideWidth: number,
    private readonly slideMaxWidth: number,
    private readonly gap: number,
    private readonly slideToScroll: number
  ) {
    this.carouselSlides = this.carousel.querySelectorAll('.carousel-slide');
    this.slideMaxWidthShouldBeGreaterThanSlideWidth();
    this.slideWidthAndGapShouldBeGreaterThanZero();
    this.requiredClassShouldBeAdded();
    this.slideToScrollNotGreaterThanTotalSlides();
  }

  slideMaxWidthShouldBeGreaterThanSlideWidth() {
    if (this.slideMaxWidth < this.slideWidth) {
      throw new Error(
        `slideMaxWidth (value: ${this.slideMaxWidth}) is lower than slideWidth (value: ${this.slideWidth}). Please increase the max width or decrease the slide width.`
      );
    }
  }

  slideWidthAndGapShouldBeGreaterThanZero() {
    const slideWidthPlusGap = this.slideWidth + this.gap;

    if (slideWidthPlusGap <= 0) {
      throw new Error(
        'Unable to construct Carousel. SlideWidth and gap lower or equal than zero. Please add a positive value for the slideWidth and gap.'
      );
    }
  }

  requiredClassShouldBeAdded() {
    if (this.carouselSlides === undefined || this.carouselSlides.length === 0) {
      throw new Error(
        'No elements with "carousel-slide" as class have been found. Please add this class to each of your slides.'
      );
    }
  }

  slideToScrollNotGreaterThanTotalSlides() {
    if (
      this.carouselSlides &&
      this.slideToScroll > this.carouselSlides.length
    ) {
      throw new Error(
        `slideToScroll value (${this.slideToScroll}) is greater than the total amount of slide (${this.carouselSlides.length}). This can cause invisible cards in infinite mode. Please lower the slideToScroll value.`
      );
    }
  }
}
