import { Carousel } from './carousel';

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
  maxTranslationValue = 0;
  lastWindowTranslation = 0;
  totalSlides = 0;
  DOMLimitReached = false;
  visibleOffsetCardNotResponsive = 0;
  invisibleOffsetCardNotResponsive = 0;
  accumulatedSlide = 0;

  constructor(
    private carousel: Carousel,
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
    private readonly loop: boolean
  ) {
    this.initProperties();
    this.updateProperties();
  }

  initProperties() {
    this.slidesContainer = this.carousel.slidesContainer;
    this.arrayOfSlides = this.carousel.arrayOfSlides;

    this.totalSlides = this.carousel.totalSlides;
    this.totalAmountOfSlides = this.totalSlides;

    this.nextLimit = Math.floor(this.carousel.slideWidthWithGap);
  }

  /**
   * Update properties of the slider
   * Fired at start and at resizing.
   */
  updateProperties() {
    this.lastWindow = this.carousel.numberDots - 1;

    this.updateNotResponsive();

    this.maxTranslationValue =
      this.totalSlides * this.carousel.slideWidthWithGap;

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
   * Fired at drag start
   * Instantiate property of the starting drag point on the X axis. Used to compute the translation.
   * Disabling the transition while applying the transformation because of the attached animation.
   */
  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;

    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    // Useful for direction detection
    this.previousX = this.startX;
    this.slidesContainer.style.transition = 'none';
  }

  /**
   * Fired at drag end
   * If not infinite mode and limits reached (start or end), put back to the current slide. Updates previous translation.
   */
  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging = false;
    this.previousTranslation = this.currentTranslation;
    if (this.loop) return;

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
  getDirection() {
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

    this.getDirection();
    this.previousX = this.currentX;

    this.positionChange = this.currentX - this.startX;
    this.currentTranslation = this.positionChange + this.previousTranslation;

    // First or last slide exceeding limits, finite mode
    if (!this.loop) {
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
   * If createSlidesInfiniteModeIfLimitsReached() or autoSlider() don't take action, slide change according to previous computed limits.
   */
  modifyCurrentSlide() {
    if (this.loop) {
      if (this.createSlidesInfiniteModeIfLimitsReached()) return;
    }

    if (this.autoSlide) {
      if (this.autoSlider()) return;
    }

    if (-this.currentTranslation < this.prevLimit) {
      this.changeSlideNumber(1);
      this.decreaseLimits();
    } else if (-this.currentTranslation >= this.nextLimit) {
      this.changeSlideNumber(1);
      this.increaseLimits();
    }
  }

  /**
   * Handle slide creation in infinite mode if limits reached
   */
  createSlidesInfiniteModeIfLimitsReached() {
    if (this.currentTranslation > 0) {
      this.addSlidesToTheLeft();
      this.decreaseLimits();

      // not enabled at start
      if (this.currentSlide > 0) {
        this.changeSlideNumber(1);
      }
      return true;
    } else if (
      -this.currentTranslation > this.lastWindowTranslation
      //    - this.carousel.slideWidthWithGap &&
      // this.direction === 'right'
    ) {
      this.addSlidesToTheRight();

      if (this.DOMLimitReached) {
        this.changePrevAndNextLimits(this.accumulatedSlide);
        return true;
      }
    }

    return false;
  }

  /**
   * Auto slide card if option enabled
   * Applied on right or left direction. If the dragging is greater than the limit in percent, auto slide occurs.
   * Prevents auto slide on limits in finite mode (if streching < limit auto slide).
   */
  autoSlider() {
    if (
      !this.loop &&
      ((this.currentSlide === 0 && this.direction === 'left') ||
        (this.currentSlide === this.lastWindow && this.direction === 'right'))
    ) {
      return true;
    }

    const moveComparedToSlide =
      (this.positionChange / this.carousel.slideWidth) * 100;

    if (
      moveComparedToSlide < -this.LIMIT_AUTO_SLIDE ||
      moveComparedToSlide > this.LIMIT_AUTO_SLIDE
    ) {
      const change = this.direction === 'right' ? 1 : -1;
      this.accumulatedSlide += change;
      this.currentSlide += change;

      this.computeTransformation(this.accumulatedSlide);
      this.changePrevAndNextLimits(this.accumulatedSlide);
      return true;
    }

    return false;
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
      // this.resetViewLeftDirection();
    } else {
      for (let i = 0; i < this.arrayOfSlides.length; i++) {
        const clonedElement = this.arrayOfSlides[i].cloneNode(true);
        this.slidesContainer.append(clonedElement);
      }
    }

    if (this.totalAmountOfSlides >= this.MAX_DOM_SIZE * this.totalSlides) {
      // Limit DOM growth, max X times original DOM
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

      this.resetViewLeftDirection();
    }
  }

  /**
   * Reset the view in a movement to the left
   * Last set of slides has been deleted, so the translation has to be updated accordingly.
   * offsetHeight triggers reflow of the element.
   */
  resetViewLeftDirection() {
    // puts back to previous position
    // const translation = this.maxTranslationValue - this.previousTranslation;
    // this.slidesContainer.style.transition = 'none';
    // this.slidesContainer.style.transform = `translate3d(${-translation}px, 0px, 0px)`;
    // this.slidesContainer.offsetHeight;
  }

  /**
   * Reset the view in a movement to the right
   * First set of slides have been deleted, so the translation has to be updated accordingly.
   * currentTranslation is a negative number so it will be decreased by a set of slides.
   * offsetHeight triggers reflow of the element.
   */
  resetViewRightDirection() {
    const translation =
      this.currentTranslation +
      this.totalSlides * this.carousel.slideWidthWithGap;
    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    this.previousTranslation = translation - this.positionChange;
    this.slidesContainer.offsetHeight;
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

  /**
   * Add slides to the left
   * Put back the translation where it was (new slides created, offset appear)
   */
  addSlidesToTheLeft() {
    this.appendOrPrependNElements();

    const translation =
      Math.abs(this.previousTranslation) + this.maxTranslationValue;
    this.previousTranslation = -translation;

    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${-this
      .maxTranslationValue}px, 0px, 0px)`;
    this.slidesContainer.offsetHeight;
  }

  addSlidesToTheRight() {
    this.appendOrPrependNElements();
  }

  /**
   * Decrease limit (movement to the left)
   * In infinite mode, take max translation value if first slide as new slides are created to the left (a whole set offset).
   * Exception: if not responsive (card offset) and finite carousel, the next limit is at the maximum (the end of the carousel)
   */
  decreaseLimits() {
    let translationCorrectionAfterClone = this.prevLimit;
    if (this.loop) {
      translationCorrectionAfterClone =
        this.prevLimit <= 0 ? this.maxTranslationValue : this.prevLimit;
    }

    this.prevLimit =
      translationCorrectionAfterClone - this.carousel.slideWidthWithGap;

    this.nextLimit = this.prevLimit + 2 * this.carousel.slideWidthWithGap;

    if (
      !this.responsive &&
      !this.loop &&
      this.currentSlide >= this.lastWindow - 1
    ) {
      this.nextLimit = this.lastWindowTranslation;
    }

    this.prevLimit = Math.floor(this.prevLimit);
    this.nextLimit = Math.floor(this.nextLimit);

    console.log(this.prevLimit, this.nextLimit);
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
      !this.loop &&
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

    console.log(this.prevLimit, this.nextLimit);
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

    console.log(this.prevLimit, this.nextLimit);
  }

  prev() {
    this.direction = 'left';
    if (this.loop) {
      this.handleBtnInfinite();
      return;
    }

    this.changeSlideNumber(this.slideToScroll);
    this.changePrevAndNextLimits(this.currentSlide);
    this.computeTransformation(this.currentSlide);
  }

  next() {
    this.direction = 'right';
    if (this.loop) {
      this.handleBtnInfinite();
      return;
    }

    this.changeSlideNumber(this.slideToScroll);
    this.changePrevAndNextLimits(this.currentSlide);
    this.computeTransformation(this.currentSlide);
  }

  /**
   * Handle navigation with the buttons
   * Create new slide if limits reached (start or end). Update slide, limits and apply transformation accordingly.
   */
  handleBtnInfinite() {
    let cardOffset = 0;
    let goingTo = this.accumulatedSlide;
    goingTo +=
      this.direction === 'right' ? this.slideToScroll : -this.slideToScroll;

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

    this.changeSlideNumber(this.slideToScroll);
    this.computeTransformation(this.accumulatedSlide);
    this.changePrevAndNextLimits(this.accumulatedSlide);
  }

  /**
   * Navigation with the bullet points
   * Update values accordingly.
   */
  goTo(bullet: number) {
    this.direction = this.currentSlide < bullet ? 'right' : 'left';

    if (this.loop) {
      this.navInfiniteBullets(bullet);
      return;
    }

    this.currentSlide = bullet;
    this.accumulatedSlide = this.currentSlide;
    this.changePrevAndNextLimits(bullet);
    this.computeTransformation(bullet);
  }

  /**
   * Handle in infinite mode bullet navigation
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
    this.currentSlide = bullet;
  }

  /**
   * Responsible for changing slide number in finite and infinite mode
   */
  changeSlideNumber(step: number) {
    if (this.carousel.numberDots === 1) return;

    if (this.loop) {
      if (this.direction === 'right') {
        this.accumulatedSlide += step;
        if ((this.currentSlide += step) > this.lastWindow) {
          const surplus = this.currentSlide % this.lastWindow;
          this.currentSlide = surplus - 1;
        }
      } else {
        this.accumulatedSlide -= step;
        if ((this.currentSlide -= step) < 0) {
          const surplus = this.currentSlide % this.lastWindow;
          this.currentSlide = this.totalSlides + surplus;
        }
      }

      return;
    }

    if (this.direction === 'right') {
      if ((this.currentSlide += step) > this.lastWindow) {
        this.currentSlide = this.lastWindow;
        this.accumulatedSlide = this.currentSlide;
      }
    } else {
      if ((this.currentSlide -= step) < 0) {
        this.currentSlide = 0;
        this.accumulatedSlide = 0;
      }
    }
  }

  /**
   * Compute transformation that will be applied on basis of the provided slide number
   * Exception: if not responsive (card offset) and finite carousel, the next limit is the end of the carousel
   */
  computeTransformation(slide: number) {
    let transformation = slide * this.carousel.slideWidthWithGap;

    if (!this.responsive && !this.loop && slide >= this.lastWindow - 1) {
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

  /**
   * Trigger drag stop
   * If client leaves the page (navigating to another tab) and comes back, stop the dragging.
   * Correct typing not possible?
   */
  unActiveTab(event: any) {
    if (event.target.visibilityState === 'visible') {
      this.dragStop(event);
    }
  }
}