import { ChangeDetectorRef } from '@angular/core';
import { Carousel } from './carousel';
import { CarouselService } from './carousel.service';

export class Slider {
  dragging = false;
  currentSlide = 0;
  lastWindow = 0;
  currentTranslation = 0;
  previousTranslation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  previousX = 0;
  currentX = 0;
  positionChange = 0;
  prevLimit = 0;
  nextLimit = 0;
  slidesContainer!: HTMLDivElement;
  arrayOfSlides!: HTMLDivElement[];
  totalAmountOfSlides!: number;
  fullWidthInf = 0;
  lastWindowTranslation = 0;
  totalSlides = 0;
  DOMLimitReached = false;
  visibleOffsetCardNotResponsive = 0;
  invisibleOffsetCardNotResponsive = 0;
  accumulatedSlide = 0;
  currentCarouselID = 0;
  autoInterval!: number;
  playActive = false;
  playButtonDisabled = false;
  directionAutoPlay = (slides: number) => {};

  constructor(
    private readonly carousel: Carousel,
    private readonly responsive: boolean,
    private readonly slideToScroll: number,
    private readonly LIMIT_AUTO_SLIDE: number,
    private readonly strechingLimit: number,
    private readonly autoSlide: boolean,
    private readonly animationTimingFn: string,
    private readonly animationTimingMs: number,
    private readonly MAX_DOM_SIZE: number,
    private readonly enableMouseDrag: boolean,
    private readonly enableTouch: boolean,
    private readonly infinite: boolean,
    private readonly autoPlay: boolean,
    private readonly autoPlayInterval: number,
    private readonly autoPlayAtStart: boolean,
    private readonly playDirection: string,
    private readonly autoplaySlideToScroll: number,
    private carouselService: CarouselService,
    private cd: ChangeDetectorRef
  ) {
    this.initProperties();
    this.updateProperties();
    this.addSlidesToRightAtStart();
  }

  initProperties() {
    this.slidesContainer = this.carousel.slidesContainer;
    this.arrayOfSlides = this.carousel.arrayOfSlides;

    this.totalSlides = this.carousel.totalSlides;
    this.totalAmountOfSlides = this.totalSlides;

    this.nextLimit = Math.floor(this.carousel.slideWidthWithGap);
    this.prevLimit = -this.carousel.slideWidthWithGap;

    this.carouselService.carouselID += 1;
    this.currentCarouselID = this.carouselService.carouselID;
    this.defineAutoPlayDirection();
    if (this.autoPlayAtStart) this.launchAutoPlay();
    this.disableAutoPlayBtn();
  }

  /**
   * In finite carousel, clear autoPlay interval if limits are reached.
   */
  disableAutoPlayBtn() {
    if (!this.autoPlay || this.infinite) return;
    this.playButtonDisabled = false;

    // start
    if (
      this.currentSlide === 0 &&
      this.playDirection === 'rtl' &&
      this.currentTranslation === 0
    ) {
      this.playButtonDisabled = true;
      this.playActive = false;
      clearInterval(this.autoInterval);
    }

    // end
    if (
      this.currentSlide === this.lastWindow &&
      this.playDirection === 'ltr' &&
      this.currentTranslation <= -this.carousel.maxScrollableContent
    ) {
      this.playButtonDisabled = true;
      this.playActive = false;
      clearInterval(this.autoInterval);
    }

    if (this.carousel.numberDots === 1) this.playButtonDisabled = true;
  }

  defineAutoPlayDirection() {
    if (this.playDirection === 'ltr') {
      this.directionAutoPlay = this.next.bind(this);
    } else {
      this.directionAutoPlay = this.prev.bind(this);
    }
  }

  launchAutoPlay() {
    if (!this.autoPlay) return;

    this.playActive = true;

    this.autoInterval = window.setInterval(() => {
      this.directionAutoPlay(this.autoplaySlideToScroll);
      this.cd.markForCheck();
    }, this.autoPlayInterval);
  }

  stopAutoPlay() {
    if (!this.autoPlay) return;

    this.playActive = false;
    clearInterval(this.autoInterval);
  }

  /**
   * Update properties of the slider
   * Fired at start and at resizing.
   */
  updateProperties() {
    this.updateNotResponsive();

    this.lastWindow = this.carousel.numberDots - 1;
    this.fullWidthInf = this.totalSlides * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation =
      this.slidesContainer.clientWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap +
      this.carousel.gap;

    this.lastWindowTranslation += this.responsive
      ? 0
      : -this.visibleOffsetCardNotResponsive - this.carousel.gap;

    this.carousel.maxScrollableContent =
      this.carousel.widthSlideContainer -
      this.carousel.carouselWidth +
      this.carousel.paddingCarousel;

    if (this.carousel.numberDots === 1) {
      // if all slides visible in one window, max scrollable content equals 0
      this.carousel.maxScrollableContent = 0;
    }
  }

  updateNotResponsive() {
    if (this.responsive) return;

    // visible part of the offset of the card in px
    this.visibleOffsetCardNotResponsive =
      this.carousel.carouselWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap -
      this.carousel.paddingCarousel;

    this.invisibleOffsetCardNotResponsive =
      this.carousel.slideWidth - this.visibleOffsetCardNotResponsive;
  }

  /**
   * Add slides to the right at start
   * If only one window (number of dots === 1) and not responsive mode, there is possibly space at start for slides to the right (even though this configuration does not make a lot of sense)
   */
  addSlidesToRightAtStart() {
    if (this.carousel.numberDots > 1 || this.responsive || !this.infinite) {
      return;
    }

    this.addSlidesToTheRight();
  }

  /**
   * Fired at drag start
   * Instantiate property of the starting drag point on the X axis. Used to compute the translation.
   * Disabling the transition while applying the transformation because of the attached animation.
   */
  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    clearInterval(this.autoInterval);
    this.disableAutoPlayBtn();

    this.dragging = true;
    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    // Useful for direction detection
    this.previousX = this.startX;
    this.slidesContainer.style.transition = 'none';
  }

  /**
   * Relaunch autoPlay if not disabled or infinite mode (never disabled by limits)
   * Restart only if started (playActive). Play button disabled when limits reached (finite carousel).
   */
  relaunchAutoPlay() {
    if ((!this.playButtonDisabled || this.infinite) && this.playActive) {
      clearInterval(this.autoInterval);
      this.launchAutoPlay();
    }
  }

  /**
   * Fired at drag end
   * If not infinite mode and limits reached (start or end), put back to the current slide. Updates previous translation.
   */
  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging = false;
    this.previousTranslation = this.currentTranslation;

    if (this.autoSlide) this.autoSlider();
    this.disableAutoPlayBtn();

    if (this.infinite) return;

    const limit =
      this.currentTranslation > 0 ||
      -this.currentTranslation > this.lastWindowTranslation;

    if (limit) {
      this.computeTransformation(this.currentSlide);
    }
  }

  currentEventIsDisabled(event: MouseEvent | TouchEvent) {
    return (
      (event instanceof MouseEvent && !this.enableMouseDrag) ||
      (event instanceof TouchEvent && !this.enableTouch)
    );
  }

  /**
   * Update the direction
   * Do not update the direction in case of the same previous position.
   */
  setDirection() {
    if (this.previousX > this.currentX) {
      this.direction = 'right';
    } else if (this.previousX < this.currentX) {
      this.direction = 'left';
    }
  }

  /**
   * Fired at dragging
   * Compute the translation, change the slide number, update the direction.
   */
  dragMove(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    if (!this.dragging) return;

    this.currentX =
      event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;

    this.setDirection();
    this.previousX = this.currentX;

    this.positionChange = this.currentX - this.startX;
    this.currentTranslation = this.positionChange + this.previousTranslation;

    // Current translation exceeding start or end limits, finite mode
    if (!this.infinite) {
      if (this.strechingEffect()) return;
    }

    this.slidesContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

    this.modifyCurrentSlide();
  }

  strechingEffect() {
    return (
      (this.currentTranslation > this.strechingLimit &&
        this.currentSlide === 0) ||
      this.currentTranslation <
        -this.carousel.maxScrollableContent - this.strechingLimit
    );
  }

  /**
   * Modify current slide
   * Take into account finite and infinite mode and auto slide.
   * Responsible for changing slide number and updating the limits.
   * If createSlidesInfiniteModeIfLimitsReached() doesn't take action, slide change according to previous computed limits.
   * In finite mode, if all slides visible on one window or end of carousel, early return to not trigger Rxjs Subject.
   */
  modifyCurrentSlide() {
    if (this.infinite) {
      if (this.createSlidesInfiniteModeIfLimits()) return;
    }

    if (
      !this.infinite &&
      (this.carousel.numberDots === 1 ||
        (this.currentSlide === this.lastWindow && this.direction === 'right'))
    ) {
      return;
    }

    if (-this.currentTranslation < this.prevLimit) {
      this.changeSlideNumber(-1);
      this.decreaseLimits();
      this.cd.markForCheck();
    } else if (-this.currentTranslation >= this.nextLimit) {
      this.changeSlideNumber(1);
      this.increaseLimits();
      this.cd.markForCheck();
    }
  }

  /**
   * Handle slide creation in infinite mode if limits reached
   * Mouse or touch drag.
   */
  createSlidesInfiniteModeIfLimits() {
    if (this.currentTranslation > 0) {
      this.addSlidesToTheLeft();
      this.decreaseLimits(true);

      // not enabled at start
      if (this.currentSlide > 0) {
        this.changeSlideNumber(-1);
      }
      return true;
    } else if (-this.currentTranslation > this.lastWindowTranslation) {
      this.addSlidesToTheRight();

      if (this.DOMLimitReached) {
        this.changePrevAndNextLimits(this.accumulatedSlide);
        return true;
      }
    }

    return false;
  }

  /**
   * Auto slide card if option enabled, applied on both directions.
   * Prevents auto slide on limits in finite mode (if streching < limit auto slide).
   * If only one slide is displayed (slideToShow === 1), the width of the slide corresponds to the window's width (a dot). Hence, taking the min between the two.
   * In non responsive and non infinite, there is possibly an offset of the current limit.
   */
  autoSlider() {
    if (
      !this.infinite &&
      (this.currentTranslation > 0 ||
        -this.currentTranslation > this.lastWindowTranslation)
    ) {
      return;
    }

    const referenceWidth = Math.min(
      this.carousel.slideWidth,
      this.carousel.slideMaxWidth || Infinity
    );
    let currentLimit = this.prevLimit + this.carousel.slideWidthWithGap;

    if (
      !this.responsive &&
      !this.infinite &&
      this.currentSlide > this.lastWindow - 1
    ) {
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

        if (
          -this.currentTranslation > this.lastWindowTranslation &&
          this.infinite
        ) {
          this.addSlidesToTheRight();
        }
      }

      this.computeTransformation(this.accumulatedSlide);
    } else {
      // put back to current slide
      this.computeTransformation(this.accumulatedSlide);
    }
  }

  /**
   * Append or prepend new slides according to the direction
   * If new slides prepended, update the translation to the correct place (appending new slides do not change the translation).
   * Limit DOM growth or update last window translation if applicable.
   */
  appendOrPrependNElements() {
    if (this.direction === 'left') {
      for (let i = this.arrayOfSlides.length - 1; i >= 0; i--) {
        const clonedElement = this.arrayOfSlides[i].cloneNode(true);
        this.slidesContainer.prepend(clonedElement);
      }

      this.accumulatedSlide += this.totalSlides;
      this.resetViewLeftDirection();
    } else {
      for (let i = 0; i < this.arrayOfSlides.length; i++) {
        const clonedElement = this.arrayOfSlides[i].cloneNode(true);
        this.slidesContainer.append(clonedElement);
      }
    }

    if (this.totalAmountOfSlides >= this.MAX_DOM_SIZE * this.totalSlides) {
      // Limit DOM growth, max X times original DOM
      // console.log('dom limit reached');
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
    const slides = this.carousel.selectSlides();

    if (this.direction === 'right') {
      for (let i = 0; i < this.totalSlides; i++) {
        slides[i].remove();
      }

      this.resetViewRightDirection();
      this.accumulatedSlide -= this.totalSlides;
    } else {
      for (
        let i = slides.length - 1;
        i > slides.length - this.totalSlides - 1;
        i--
      ) {
        slides[i].remove();
      }
    }
  }

  /**
   * Reset the view in a movement to the left
   * New slides added to the left, so the view has to be updated accordingly.
   * If the carousel is moved with the mouse | touch event (dragging is true), the offset should be equal to a full carousel width. Otherwise (with the buttons), the computed translation should be taken into account.
   * Side comment: the view does not have to be updated for slides added to the right, since relative order does not change.
   * getBoundingClientRect triggers reflow of the element.
   */
  resetViewLeftDirection() {
    let translation = Math.abs(this.previousTranslation) + this.fullWidthInf;

    this.previousTranslation = -translation;

    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${
      this.dragging ? -this.fullWidthInf : -translation
    }px, 0px, 0px)`;

    // debugger;
    this.slidesContainer.getBoundingClientRect();
  }

  /**
   * Reset the view in a movement to the right
   * First set of slides have been deleted, so the translation has to be updated accordingly.
   * currentTranslation is a negative number so it will be decreased by a set of slides.
   * getBoundingClientRect triggers reflow of the element.
   */
  resetViewRightDirection() {
    let translation = this.currentTranslation + this.fullWidthInf;

    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    this.previousTranslation = translation - this.positionChange;

    this.slidesContainer.getBoundingClientRect();
  }

  /**
   * Update the last window translation
   * Useful to get the max translation at the end of the slides.
   * In not responsive mode, there is possibly a not fully displayed card (card offset).
   */
  updateLastWindowTranslation() {
    const total = this.totalAmountOfSlides * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation =
      total - this.carousel.slideToShow * this.carousel.slideWidthWithGap;

    this.lastWindowTranslation += this.responsive
      ? 0
      : -this.visibleOffsetCardNotResponsive - this.carousel.gap;
  }

  addSlidesToTheLeft() {
    this.appendOrPrependNElements();
  }

  addSlidesToTheRight() {
    this.appendOrPrependNElements();
  }

  /**
   * Decrease limit (movement to the left)
   * In infinite mode, take full width of a set if on the first slide as new slides are created to the left (a whole set offset).
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  decreaseLimits(slidesCreatedOnTheLeft = false) {
    let translationCorrectionAfterClone = this.prevLimit;

    if (slidesCreatedOnTheLeft) {
      translationCorrectionAfterClone = this.fullWidthInf;
    }

    this.prevLimit =
      translationCorrectionAfterClone - this.carousel.slideWidthWithGap;

    this.nextLimit = this.prevLimit + 2 * this.carousel.slideWidthWithGap;

    if (
      !this.responsive &&
      !this.infinite &&
      this.currentSlide >= this.lastWindow - 1
    ) {
      this.nextLimit = this.lastWindowTranslation;
    }

    this.prevLimit = Math.floor(this.prevLimit);
    this.nextLimit = Math.floor(this.nextLimit);

    // console.log(this.prevLimit, this.nextLimit);
  }

  /**
   * Increase limit on basis of previous computed limits (movement to the right)
   * Schema: || previous | current || next
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  increaseLimits() {
    this.nextLimit += Math.floor(this.carousel.slideWidthWithGap);
    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    if (
      !this.responsive &&
      !this.infinite &&
      this.currentSlide >= this.lastWindow - 1
    ) {
      this.nextLimit = this.lastWindowTranslation;

      if (this.currentSlide === this.lastWindow) {
        // only update previous limit if last slide reached
        this.prevLimit = Math.floor(
          this.nextLimit - this.invisibleOffsetCardNotResponsive
        );
      }
    }

    // console.log(this.prevLimit, this.nextLimit);
  }

  /**
   * Change prev and next limit on basis of the provided slide number
   * Prev and next limit are always calculated as the following:
   * || <= prev | current || <= next
   */
  changePrevAndNextLimits(slideNumber: number) {
    const limitInPX = slideNumber * this.carousel.slideWidthWithGap;
    this.nextLimit = Math.floor(limitInPX + this.carousel.slideWidthWithGap);

    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    // console.log(this.prevLimit, this.nextLimit);
  }

  /**
   * Previous button navigation
   */
  prev(slides = this.slideToScroll) {
    this.direction = 'left';

    if (this.infinite) {
      this.handleBtnInfinite(-slides);
    }

    this.changeSlideNumber(-slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();
  }

  /**
   * Next button navigation
   */
  next(slides = this.slideToScroll) {
    this.direction = 'right';

    if (this.infinite) {
      this.handleBtnInfinite(slides);
    }

    this.changeSlideNumber(slides);
    this.changePrevAndNextLimits(this.accumulatedSlide);
    this.computeTransformation(this.accumulatedSlide);
    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();
  }

  /**
   * Buttons navigation in infinite mode
   * Create new slide if limits reached (start or end). Update slide, limits and apply transformation accordingly.
   */
  handleBtnInfinite(step: number) {
    let cardOffset = 0;
    const goingTo = this.accumulatedSlide + step;

    // there is (possibly) a card offset if not responsive
    if (!this.responsive) cardOffset = 1;

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
    this.direction = this.currentSlide < bullet ? 'right' : 'left';

    this.currentSlide = bullet;
    this.carouselService.onChange(this.currentSlide, this.currentCarouselID);
    this.disableAutoPlayBtn();
    this.relaunchAutoPlay();

    if (this.infinite) {
      this.navInfiniteBullets(bullet);
      return;
    }

    this.accumulatedSlide = this.currentSlide;
    this.changePrevAndNextLimits(bullet);
    this.computeTransformation(bullet);
  }

  /**
   * Bullets navigation
   * Create new slides if exceeding end of carousel.
   */
  navInfiniteBullets(bullet: number) {
    let cardOffset = 0;
    const positionOfCurrentSlide = this.accumulatedSlide % this.totalSlides;
    const difference = bullet - positionOfCurrentSlide;
    this.accumulatedSlide += difference;

    // there is (possibly) a card offset if not responsive
    if (!this.responsive) cardOffset = 1;

    if (
      this.accumulatedSlide + this.carousel.slideToShow + cardOffset >
      this.totalAmountOfSlides
    ) {
      this.addSlidesToTheRight();
    }

    this.computeTransformation(this.accumulatedSlide);
    this.changePrevAndNextLimits(this.accumulatedSlide);
  }

  /**
   * Responsible for changing slide number in finite and infinite mode
   * Exception: if only one window (numberDots === 1), update the accumulatedSlide to let the transformation occurs, but currentSlide should stay at 0.
   */
  changeSlideNumber(step: number) {
    if (this.infinite) {
      this.infiniteChangeSlideNumber(step);
    } else {
      this.finiteChangeSlideNumber(step);
    }

    if (this.carousel.numberDots === 1) {
      this.currentSlide = 0;
    }

    const current =
      this.carousel.numberDots > 1 ? this.currentSlide : this.accumulatedSlide;
    this.carouselService.onChange(current, this.currentCarouselID);
  }

  infiniteChangeSlideNumber(step: number) {
    this.accumulatedSlide += step;
    this.currentSlide += step;

    if (this.currentSlide > this.lastWindow) {
      const surplus = this.currentSlide % this.lastWindow;
      this.currentSlide = surplus - 1;
    } else if (this.currentSlide < 0) {
      const surplus = this.currentSlide % this.lastWindow;
      this.currentSlide = this.totalSlides + surplus;
    }
  }

  finiteChangeSlideNumber(step: number) {
    this.currentSlide += step;

    if (this.currentSlide > this.lastWindow) {
      this.currentSlide = this.lastWindow;
    } else if (this.currentSlide < 0) {
      this.currentSlide = 0;
    }

    this.accumulatedSlide = this.currentSlide;
  }

  /**
   * Compute transformation that will be applied on basis of the provided slide number
   * Exception: if not responsive (card offset) and finite carousel, the next limit is the end of the carousel
   */
  computeTransformation(slide: number) {
    let transformation = slide * this.carousel.slideWidthWithGap;

    if (
      !this.responsive &&
      !this.infinite &&
      slide >= this.lastWindow - 1 &&
      this.carousel.numberDots > 1
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

  applyTransformation(transformation: number) {
    this.slidesContainer.style.transition = `transform ${this.animationTimingMs}ms ${this.animationTimingFn}`;

    this.slidesContainer.style.transform = `translate3d(${-transformation}px, 0px, 0px)`;

    this.dragging = false;
    this.previousTranslation = -transformation;
    this.currentTranslation = -transformation;
  }
}
