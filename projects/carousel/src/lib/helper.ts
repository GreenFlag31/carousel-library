import { Carousel } from './carousel';
import { visibilityEvent } from './interfaces';
import { SliderResponsive } from './slider';
import { SliderNoResponsive } from './sliderNoResponsive';

export class Helper {
  constructor(
    private carousel: Carousel,
    private slider: SliderResponsive | SliderNoResponsive
  ) {}

  getLimitSlide(index: number) {
    const limit =
      (this.slider.currentSlide + index) *
        this.carousel.correctionMultipleSlides +
      (this.slider.currentSlide + index) * this.carousel.slideWidth;
    return limit === 0 ? this.carousel.slideWidthWithGap : limit;
  }

  getDirection() {
    this.slider.direction = this.slider.positionChange < 0 ? 'right' : 'left';
  }

  updateDirectionNavWithBullet(bullet: number) {
    this.slider.currentSlide < bullet
      ? (this.slider.direction = 'right')
      : (this.slider.direction = 'left');
  }

  previous() {
    this.slider.direction = 'left';
    this.checkGoingBack();
    this.slider.computeTransformation(this.slider.currentSlide);
  }

  next() {
    this.slider.direction = 'right';
    this.slider.computeTransformation(++this.slider.currentSlide);
  }

  goTo(bullet: number) {
    this.updateDirectionNavWithBullet(bullet);
    this.slider.currentSlide = bullet;
    this.slider.computeTransformation(bullet);
  }

  checkGoingBack() {
    // debugger;
    if (this.slider.currentSlide - 1 < 0) {
      return;
    }

    const absTranslation = Math.abs(this.slider.currentTranslation);
    if (
      absTranslation < this.slider.nextLimit &&
      absTranslation > this.slider.prevLimit &&
      this.slider.direction === 'left'
    ) {
      return;
    }

    return this.slider.currentSlide--;
  }

  changeSlide(transformation: number) {
    this.carousel.slidesContainer.style.transition = `transform 0.3s ease-out`;

    this.carousel.slidesContainer.style.transform = `translate3d(${-transformation}px, 0, 0)`;

    this.slider.dragging = false;
    this.slider.draggingTranslation = false;
    this.slider.previousTranslation = -transformation;
    this.slider.currentTranslation = -transformation;
  }

  unActiveTab(event: visibilityEvent) {
    if (
      event.target.visibilityState === 'visible' &&
      this.slider.draggingTranslation
    ) {
      this.slider.dragStop();
    }
  }

  dragStart(event: MouseEvent | TouchEvent) {
    this.slider.dragging = true;

    this.slider.startX =
      event instanceof MouseEvent ? event.screenX : event.touches[0].screenX;

    this.carousel.slidesContainer.style.transition = 'none';
  }

  dragStop() {
    this.slider.dragging = false;

    this.slider.previousTranslation = this.slider.currentTranslation;
    // First or last slide moved
    const limit =
      (this.slider.currentSlide === 0 && this.slider.currentTranslation > 0) ||
      (this.slider.currentSlide === this.slider.lastSlide &&
        this.slider.positionChange < 0);

    if (this.slider.draggingTranslation && limit) {
      this.slider.computeTransformation(this.slider.currentSlide);
      this.slider.previousTranslation =
        this.slider.direction === 'left' && this.slider.currentSlide === 0
          ? 0
          : -this.carousel.maxScrollableContent;
    }
  }
}
