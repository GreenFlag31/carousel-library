export class Validation {
  constructor(
    private readonly carousel: HTMLDivElement,
    private readonly slideWidth: number,
    private readonly slideMaxWidth: number,
    private readonly gap: number
  ) {
    this.slideMaxWidthShouldBeGreaterThanSlideWidth();
    this.slideWidthAndGapShouldBeGreaterThanZero();
    this.requiredClassShouldBeAdded();
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
    const carouselSlides: NodeListOf<HTMLDivElement> | undefined =
      this.carousel.querySelectorAll('.carousel-slide');

    if (carouselSlides.length === 0) {
      throw new Error(
        'No elements with "carousel-slide" as class have been found. Please add this class to each of your cards/slides.'
      );
    }
  }
}
