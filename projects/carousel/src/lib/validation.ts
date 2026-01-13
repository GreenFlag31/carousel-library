import { TemplateRef, ViewContainerRef } from '@angular/core';

export class Validation {
  carouselSlides!: NodeListOf<HTMLDivElement> | undefined;

  constructor(
    private readonly carousel: HTMLDivElement,
    private readonly slideWidth: number,
    private readonly slideMaxWidth: number,
    private readonly gap: number,
    private readonly slideToScroll: number,
    private readonly carouselViewContainer: ViewContainerRef,
    private readonly carouselTemplateRef: TemplateRef<any>
  ) {
    this.carouselSlides = this.carousel.querySelectorAll('.carousel-slide');

    this.checkIfCarouselViewContainerAndTemplateRefAreSet();
    this.slideMaxWidthShouldBeGreaterThanSlideWidth();
    this.slideWidthAndGapShouldBeGreaterThanZero();
    this.requiredClassShouldBeAdded();
    this.slideToScrollNotGreaterThanTotalSlides();
  }

  checkIfCarouselViewContainerAndTemplateRefAreSet() {
    if (
      this.carouselViewContainer === undefined ||
      this.carouselTemplateRef === undefined
    ) {
      throw new Error(
        `carouselViewContainer or carouselTemplateRef is undefined. Please wrap your slides as following : 
  <carousel>
    <ng-template #carouselTemplateRef #carouselViewContainer>
      <!-- Your slides here -->
    </ng-template>.
  </carousel>
This is necessary for infinite mode to keep Angular elements attached (click event, directives, etc).`
      );
    }
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
