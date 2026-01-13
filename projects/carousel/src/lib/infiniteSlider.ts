import { TemplateRef, ViewContainerRef } from '@angular/core';
import { Carousel } from './carousel';
import { CarouselService } from './carousel.service';
import { CommunSlider } from './communSlider';

export class InfiniteSlider extends CommunSlider {
  readonly MAX_DOM_SIZE: number;

  constructor(
    carousel: Carousel,
    responsive: boolean,
    slideToScroll: number,
    LIMIT_AUTO_SLIDE: number,
    strechingLimit: number,
    autoSlide: boolean,
    animationTimingFn: string,
    animationTimingMs: number,
    MAX_DOM_SIZE: number,
    enableMouseDrag: boolean,
    enableTouch: boolean,
    autoPlay: boolean,
    autoPlayInterval: number,
    autoPlayAtStart: boolean,
    playDirection: string,
    autoplaySlideToScroll: number,
    carouselService: CarouselService,
    readonly carouselViewContainer: ViewContainerRef,
    readonly carouselTemplateRef: TemplateRef<any>
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
      carouselService
    );
    this.MAX_DOM_SIZE = MAX_DOM_SIZE;
    this.initProperties();
    this.updateProperties();
    this.addSlidesToRightAtStart();
  }

  override initProperties() {
    this.defineAutoPlayDirection();
    super.initProperties();
  }

  /**
   * next and prev are defined separatively
   */
  defineAutoPlayDirection() {
    if (this.playDirection === 'ltr') {
      this.directionAutoPlay = this.next.bind(this);
    } else {
      this.directionAutoPlay = this.prev.bind(this);
    }
  }

  /**
   * Add slides to the right at start
   * If only one window (number of dots === 1) and not responsive mode, there is possibly space at start for slides to the right (even though this configuration does not make a lot of sense)
   * TODO: ajouter des slides si slidesToShow > total slides
   */
  addSlidesToRightAtStart() {
    if (this.carousel.numberDots() > 1 || this.responsive) {
      return;
    }

    this.addSlidesToTheRight();
  }

  /**
   * Fired at drag start
   * Instantiate property of the starting drag point on the X axis. Used to compute the translation.
   * Disabling the transition while applying the transformation because of the attached animation.
   */
  override dragStart(event: MouseEvent | TouchEvent) {
    if (super.currentEventIsDisabled(event)) return;

    super.dragStart(event);
  }

  /**
   * Relaunch autoPlay if not disabled or infinite mode (never disabled by limits)
   * Restart only if started (playActive).
   */
  relaunchAutoPlay() {
    if (this.playActive()) {
      clearInterval(this.autoInterval);
      this.launchAutoPlay();
    }
  }

  /**
   * Fired at drag end
   */
  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging.set(false);
    this.previousTranslation = this.currentTranslation();

    this.autoSlider();
  }

  autoSlider() {
    if (!this.autoSlide) return;

    const referenceWidth = Math.min(
      this.carousel.slideWidth,
      this.carousel.slideMaxWidth || Infinity
    );
    const currentLimit = this.prevLimit + this.carousel.slideWidthWithGap;

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

    if (-this.currentTranslation() > this.lastWindowTranslation) {
      this.addSlidesToTheRight();
    }

    this.computeTransformation(this.accumulatedSlide);
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

    this.applyTranslation(this.currentTranslation());
    this.modifyCurrentSlide();
  }

  /**
   * Responsible for changing slide number and updating the limits.
   * If createSlidesInfiniteModeIfLimits() doesn't take action, slide change according to previous computed limits.
   */
  modifyCurrentSlide() {
    if (this.createSlidesInfiniteModeIfLimits()) return;

    if (-this.currentTranslation() < this.prevLimit) {
      this.changeSlideNumber(-1);
      this.decreaseLimits();
    } else if (-this.currentTranslation() >= this.nextLimit) {
      this.changeSlideNumber(1);
      this.increaseLimits();
    }
  }

  /**
   * Handle slide creation in infinite mode if limits reached
   * Mouse or touch drag.
   */
  createSlidesInfiniteModeIfLimits() {
    if (this.currentTranslation() > 0) {
      this.addSlidesToTheLeft();
      this.decreaseLimits(true);

      // not enabled at start
      if (this.currentSlide() > 0) {
        this.changeSlideNumber(-1);
      }

      return true;
    } else if (-this.currentTranslation() > this.lastWindowTranslation) {
      this.addSlidesToTheRight();

      if (this.DOMLimitReached) {
        this.changePrevAndNextLimits(this.accumulatedSlide);
        return true;
      }
    }

    return false;
  }

  /**
   * Append or prepend new slides according to the direction
   * If new slides prepended, update the translation to the correct place (appending new slides do not change the translation).
   * Limit DOM growth or update last window translation if applicable.
   */
  appendOrPrependElements() {
    if (this.direction === 'left') {
      this.carouselViewContainer.createEmbeddedView(
        this.carouselTemplateRef,
        {},
        { index: 0 }
      );

      this.accumulatedSlide += this.totalSlides;
      this.resetViewLeftDirection();
    } else {
      this.carouselViewContainer.createEmbeddedView(this.carouselTemplateRef);
    }

    // Update slide widths for both directions
    this.carousel.setWidthSlides();
    this.carousel.setDraggableImgToFalse();

    // Limit DOM growth, max X times original DOM size
    if (this.totalAmountOfSlides >= this.MAX_DOM_SIZE * this.totalSlides) {
      this.limitDOMGrowth();
      this.DOMLimitReached = true;
    } else {
      this.totalAmountOfSlides += this.totalSlides;
      this.DOMLimitReached = false;
      this.updateLastWindowTranslation();
    }
  }

  /**
   * Limit DOM growth
   * Reset the view accordingly.
   */
  limitDOMGrowth() {
    if (this.direction === 'right') {
      this.carouselViewContainer.remove(0);

      this.resetViewRightDirection();
      this.accumulatedSlide -= this.totalSlides;
    } else {
      this.carouselViewContainer.remove();
    }
  }

  /**
   * Reset the view in a movement to the left
   * New slides added to the left, so the view has to be updated accordingly.
   * If the carousel is moved with the mouse | touch event (dragging is true), the offset should be equal to a full carousel width. Otherwise (with the buttons), the computed translation should be taken into account.
   * getBoundingClientRect triggers reflow of the element.
   */
  resetViewLeftDirection() {
    const translation = Math.abs(this.previousTranslation) + this.fullWidthInf;
    this.previousTranslation = -translation;

    this.slidesContainer.style.transition = 'none';
    const transformation = this.dragging() ? -this.fullWidthInf : -translation;
    this.applyTranslation(transformation);

    this.slidesContainer.getBoundingClientRect();
  }

  /**
   * Reset the view in a movement to the right
   * First set of slides have been deleted, so the translation has to be updated accordingly.
   * currentTranslation is a negative number so it will be decreased by a set of slides.
   * getBoundingClientRect triggers reflow of the element.
   */
  resetViewRightDirection() {
    const translation = this.currentTranslation() + this.fullWidthInf;

    this.slidesContainer.style.transition = 'none';
    this.applyTranslation(translation);
    this.previousTranslation = translation - this.positionChange;

    this.slidesContainer.getBoundingClientRect();
  }

  addSlidesToTheLeft() {
    this.appendOrPrependElements();
  }

  addSlidesToTheRight() {
    this.appendOrPrependElements();
  }

  /**
   * Increase limit on basis of previous computed limits (movement to the right)
   * Schema: || previous | current || next
   */
  override increaseLimits() {
    this.nextLimit += Math.floor(this.carousel.slideWidthWithGap);
    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );
  }

  /**
   * Previous button navigation
   */
  prev(slides = this.slideToScroll) {
    this.direction = 'left';

    this.handleBtnInfinite(-slides);
    this.changeSlideNumber(-slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.relaunchAutoPlay();
  }

  /**
   * Next button navigation
   */
  next(slides = this.slideToScroll) {
    this.direction = 'right';

    this.handleBtnInfinite(slides);
    this.changeSlideNumber(slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.relaunchAutoPlay();
  }

  /**
   * Buttons navigation in infinite mode
   * Create new slide if limits reached (start or end). Update slide, limits and apply transformation accordingly.
   * There is (possibly) a card offset if not responsive
   */
  handleBtnInfinite(step: number) {
    const cardOffset = this.responsive ? 0 : 1;
    const goingTo = this.accumulatedSlide + step;

    if (goingTo < 0) {
      this.addSlidesToTheLeft();
    } else if (
      goingTo + this.carousel.slideToShow + cardOffset >
      this.totalAmountOfSlides
    ) {
      this.addSlidesToTheRight();
    }
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

    this.relaunchAutoPlay();
    this.navInfiniteBullets(bullet);
  }

  /**
   * Bullets navigation
   * Create new slides if exceeding end of carousel.
   * There is (possibly) a card offset if not responsive
   */
  navInfiniteBullets(bullet: number) {
    const cardOffset = this.responsive ? 0 : 1;
    const positionOfCurrentSlide = this.accumulatedSlide % this.totalSlides;
    const difference = bullet - positionOfCurrentSlide;
    this.accumulatedSlide += difference;

    const newwSlidesShouldBeCreated =
      this.accumulatedSlide + this.carousel.slideToShow + cardOffset >
      this.totalAmountOfSlides;

    if (newwSlidesShouldBeCreated) {
      this.addSlidesToTheRight();
    }

    this.computeTransformation(this.accumulatedSlide);
    this.changePrevAndNextLimits(this.accumulatedSlide);
  }

  /**
   * Exception: if only one window (numberDots === 1), update the accumulatedSlide to let the transformation occurs, but currentSlide should stay at 0.
   */
  changeSlideNumber(step: number) {
    const slideNumberBeforeChange: number = this.currentSlide();
    this.infiniteChangeSlideNumber(step);

    if (this.carousel.numberDots() === 1) {
      this.currentSlide.set(0);
    }

    const current: number =
      this.carousel.numberDots() > 1
        ? this.currentSlide()
        : this.accumulatedSlide;

    const slideHasChanged: boolean =
      slideNumberBeforeChange !== this.currentSlide();
    this.fireSlideChangeEvent(slideHasChanged, current);
  }

  infiniteChangeSlideNumber(step: number) {
    this.accumulatedSlide += step;
    this.currentSlide.update((slide) => slide + step);

    const lastSlide = this.totalSlides - 1;
    if (this.currentSlide() > lastSlide) {
      this.currentSlide.update((slide) => slide % this.totalSlides);
    } else if (this.currentSlide() < 0) {
      this.currentSlide.update((slide) => slide + this.totalSlides);
    }
  }

  /**
   * Compute transformation that will be applied on basis of the provided slide number
   */
  computeTransformation(slide: number) {
    const transformation = slide * this.carousel.slideWidthWithGap;

    this.applyTransformation(transformation);
  }
}
