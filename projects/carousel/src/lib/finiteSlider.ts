import { ChangeDetectorRef } from '@angular/core';
import { Carousel } from './carousel';
import { CarouselService } from './carousel.service';
import { CommunSlider } from './communSlider';

export class FiniteSlider extends CommunSlider {
  constructor(
    carousel: Carousel,
    responsive: boolean,
    slideToScroll: number,
    LIMIT_AUTO_SLIDE: number,
    strechingLimit: number,
    autoSlide: boolean,
    animationTimingFn: string,
    animationTimingMs: number,
    enableMouseDrag: boolean,
    enableTouch: boolean,
    autoPlay: boolean,
    autoPlayInterval: number,
    autoPlayAtStart: boolean,
    playDirection: string,
    autoplaySlideToScroll: number,
    carouselService: CarouselService,
    cd: ChangeDetectorRef
  ) {
    super(
      carousel,
      responsive,
      slideToScroll,
      LIMIT_AUTO_SLIDE,
      strechingLimit,
      autoSlide,
      animationTimingFn,
      animationTimingMs,
      enableMouseDrag,
      enableTouch,
      autoPlay,
      autoPlayInterval,
      autoPlayAtStart,
      playDirection,
      autoplaySlideToScroll,
      carouselService,
      cd
    );
    this.initProperties();
    this.updateProperties();
  }

  override initProperties() {
    this.defineAutoPlayDirection();
    super.initProperties();
    this.disableAutoPlayBtn();
  }

  /**
   * In finite carousel, clear autoPlay interval if limits are reached.
   */
  disableAutoPlayBtn() {
    if (!this.autoPlay) return;
    this.playButtonDisabled.set(false);

    // start
    if (
      this.currentSlide() === 0 &&
      this.playDirection === 'rtl' &&
      this.currentTranslation() === 0
    ) {
      this.playButtonDisabled.set(true);
      this.playActive.set(false);
      clearInterval(this.autoInterval);
    }

    // end
    if (
      this.currentSlide() === this.lastWindow &&
      this.playDirection === 'ltr' &&
      this.currentTranslation() <= -this.carousel.maxScrollableContent()
    ) {
      this.playButtonDisabled.set(true);
      this.playActive.set(false);
      clearInterval(this.autoInterval);
    }

    if (this.carousel.numberDots() === 1) this.playButtonDisabled.set(true);
  }

  /**
   * Fired at drag start
   * Instantiate property of the starting drag point on the X axis. Used to compute the translation.
   * Disabling the transition while applying the transformation because of the attached animation.
   */
  override dragStart(event: MouseEvent | TouchEvent) {
    super.dragStart(event);
    this.disableAutoPlayBtn();
  }

  /**
   * Fired at drag end
   * If limits reached (start or end), put back to the current slide. Updates previous translation.
   */
  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging.set(false);
    this.previousTranslation = this.currentTranslation();

    this.autoSlider();
    this.disableAutoPlayBtn();

    const limit =
      this.currentTranslation() > 0 ||
      -this.currentTranslation() > this.lastWindowTranslation;

    if (limit) {
      this.computeTransformation(this.currentSlide());
    }
  }

  /**
   * Fired at dragging
   * Compute the translation, change the slide number, update the direction.
   */
  dragMove(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    if (!this.dragging()) return;

    this.currentX =
      event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;

    this.setDirection();
    this.previousX = this.currentX;

    this.positionChange = this.currentX - this.startX;
    this.currentTranslation.set(this.positionChange + this.previousTranslation);

    // Current translation exceeding start or end limits
    if (this.strechingEffect()) return;

    this.applyTranslation(this.currentTranslation());
    this.modifyCurrentSlide();
  }

  strechingEffect() {
    return (
      (this.currentTranslation() > this.strechingLimit &&
        this.currentSlide() === 0) ||
      this.currentTranslation() <
        -this.carousel.maxScrollableContent() - this.strechingLimit
    );
  }

  /**
   * Responsible for changing slide number and updating the limits.
   * In finite mode, if all slides visible on one window or end of carousel, early return to not trigger change event.
   */
  modifyCurrentSlide() {
    if (this.endOfCarousel()) return;

    if (-this.currentTranslation() < this.prevLimit) {
      this.changeSlideNumber(-1);
      this.decreaseLimits();
    } else if (-this.currentTranslation() >= this.nextLimit) {
      this.changeSlideNumber(1);
      this.increaseLimits();
    }
  }

  endOfCarousel() {
    return (
      this.carousel.numberDots() === 1 ||
      (this.currentSlide() === this.lastWindow && this.direction === 'right')
    );
  }

  /**
   * Auto slide card if option enabled, applied on both directions.
   * Prevents auto slide on limits in finite mode (if streching < limit auto slide).
   * If only one slide is displayed (slideToShow === 1), the width of the slide corresponds to the window's width (a dot). Hence, taking the min between the two.
   * In non responsive and non infinite, there is possibly an offset of the current limit.
   */
  autoSlider() {
    if (!this.autoSlide) return;
    if (
      this.currentTranslation() > 0 ||
      -this.currentTranslation() > this.lastWindowTranslation
    ) {
      return;
    }

    const referenceWidth = Math.min(
      this.carousel.slideWidth,
      this.carousel.slideMaxWidth || Infinity
    );
    let currentLimit = this.prevLimit + this.carousel.slideWidthWithGap;

    if (!this.responsive && this.currentSlide() > this.lastWindow - 1) {
      currentLimit = this.lastWindowTranslation;
    }

    // previousTranslation always a negative number, currentLimit always positive
    const currentPositionChange = this.previousTranslation + currentLimit;
    const moveComparedToSlide = (currentPositionChange / referenceWidth) * 100;

    if (
      moveComparedToSlide < -this.LIMIT_AUTO_SLIDE ||
      moveComparedToSlide > this.LIMIT_AUTO_SLIDE
    ) {
      if (moveComparedToSlide > this.LIMIT_AUTO_SLIDE) {
        this.changeSlideNumber(-1);
        this.decreaseLimits();
      } else {
        this.changeSlideNumber(1);
        this.increaseLimits();
      }
    }

    this.computeTransformation(this.accumulatedSlide);
  }

  /**
   * Decrease limit (movement to the left)
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  override decreaseLimits() {
    super.decreaseLimits();

    if (!this.responsive && this.currentSlide() >= this.lastWindow - 1) {
      this.nextLimit = this.lastWindowTranslation;
    }

    this.nextLimit = Math.floor(this.nextLimit);
  }

  /**
   * Increase limit on basis of previous computed limits (movement to the right)
   * Schema: || previous | current || next
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  override increaseLimits() {
    super.increaseLimits();

    if (!this.responsive && this.currentSlide() >= this.lastWindow - 1) {
      this.nextLimit = this.lastWindowTranslation;

      if (this.currentSlide() === this.lastWindow) {
        // only update previous limit if last slide reached
        this.prevLimit = Math.floor(
          this.nextLimit - this.invisibleOffsetCardNotResponsive
        );
      }
    }
  }

  /**
   * Previous button navigation
   */
  prev(slides = this.slideToScroll) {
    this.direction = 'left';

    this.changeSlideNumber(-slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();
  }

  /**
   * Relaunch autoPlay if not disabled.
   * Restart only if started (playActive). Play button disabled when limits reached (finite carousel).
   */
  relaunchAutoPlay() {
    if (!this.playButtonDisabled() && this.playActive()) {
      clearInterval(this.autoInterval);
      this.launchAutoPlay();
    }
  }

  defineAutoPlayDirection() {
    if (this.playDirection === 'ltr') {
      this.directionAutoPlay = this.next.bind(this);
    } else {
      this.directionAutoPlay = this.prev.bind(this);
    }
  }

  /**
   * Next button navigation
   */
  next(slides = this.slideToScroll) {
    this.direction = 'right';

    this.changeSlideNumber(slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();
  }

  /**
   * Navigation with bullet points
   * Update values accordingly.
   */
  goTo(bullet: number) {
    const slideHasChanged = this.currentSlide() !== bullet;
    this.direction = this.currentSlide() < bullet ? 'right' : 'left';

    this.currentSlide.set(bullet);
    this.fireSlideChangeEvent(slideHasChanged, this.currentSlide());

    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();

    this.accumulatedSlide = this.currentSlide();
    this.changePrevAndNextLimits(bullet);
    this.computeTransformation(bullet);
  }

  /**
   * Exception: if only one window (numberDots === 1), update the accumulatedSlide to let the transformation occurs, but currentSlide should stay at 0.
   */
  changeSlideNumber(step: number) {
    const slideNumberBeforeChange = this.currentSlide();

    this.finiteChangeSlideNumber(step);

    if (this.carousel.numberDots() === 1) {
      this.currentSlide.set(0);
    }

    const current =
      this.carousel.numberDots() > 1
        ? this.currentSlide()
        : this.accumulatedSlide;

    const slideHasChanged = slideNumberBeforeChange !== this.currentSlide();

    this.fireSlideChangeEvent(slideHasChanged, current);
  }

  finiteChangeSlideNumber(step: number) {
    this.currentSlide.update((slide) => slide + step);

    if (this.currentSlide() > this.lastWindow) {
      this.currentSlide.set(this.lastWindow);
    } else if (this.currentSlide() < 0) {
      this.currentSlide.set(0);
    }

    this.accumulatedSlide = this.currentSlide();
  }

  /**
   * Compute transformation that will be applied on basis of the provided slide number
   * Exception: if not responsive (card offset) and finite carousel, the next limit is the end of the carousel
   */
  computeTransformation(slide: number) {
    let transformation = slide * this.carousel.slideWidthWithGap;

    if (
      !this.responsive &&
      slide >= this.lastWindow - 1 &&
      this.carousel.numberDots() > 1
    ) {
      this.nextLimit = this.lastWindowTranslation;

      if (slide === this.lastWindow) {
        // if last window, go to maximum & update prev limit
        transformation = this.lastWindowTranslation;
        this.prevLimit = Math.floor(
          this.nextLimit - this.invisibleOffsetCardNotResponsive
        );
      }
    }

    this.applyTransformation(transformation);
  }
}
