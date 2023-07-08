import { Carousel } from './carousel';

export class SliderResponsive {
  dragging = false;
  currentSlide = 0;
  lastSlide = 0;
  currentTranslation = 0;
  previousTranslation = 0;
  direction: 'right' | 'left' = 'right';
  startX = 0;
  previousX = 0;
  currentX = 0;
  positionChange = 0;
  draggingTranslation = false;
  prevLimit = 0;
  currentLimit = 0;
  nextLimit = 0;
  marginForCurrentLimit = 0;
  slidesContainer!: HTMLDivElement;
  arrayOfSlides!: HTMLDivElement[];
  totalAmountOfSlides!: number;
  maxTranslationValue = 0;
  lastSlideOffset = 0;
  totalSlides = 0;
  DOMLimitReached = false;
  MAX_DOM_SIZE = 4;

  constructor(
    private carousel: Carousel,
    private readonly slideToScroll: number,
    private readonly LIMIT_AUTO_SLIDE: number,
    private readonly strechingLimit: number,
    private readonly autoSlide: boolean,
    private readonly animationTimingFn: string,
    private readonly animationTimingMs: number,
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

  updateProperties() {
    this.lastSlide = this.carousel.numberDots - 1;

    this.marginForCurrentLimit = Math.floor(
      this.carousel.slideWidthWithGap / 2
    );

    this.maxTranslationValue =
      this.totalSlides * this.carousel.slideWidthWithGap;

    this.lastSlideOffset =
      this.slidesContainer.clientWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap +
      this.carousel.gap;
  }

  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;

    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    this.previousX = this.startX;
    this.slidesContainer.style.transition = 'none';
  }

  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging = false;
    this.previousTranslation = this.currentTranslation;
    if (this.loop) return;

    const limit =
      this.currentTranslation > 0 ||
      -this.currentTranslation > this.lastSlideOffset;

    if (this.draggingTranslation && limit) {
      this.computeTransformation(this.currentSlide);
    }
  }

  currentEventIsDisabled(event: MouseEvent | TouchEvent) {
    return (
      (event instanceof MouseEvent && !this.enableMouseDrag) ||
      (event instanceof TouchEvent && !this.enableTouch)
    );
  }

  getDirection() {
    if (this.previousX > this.currentX) {
      this.direction = 'right';
    } else {
      this.direction = 'left';
    }
  }

  dragMove(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    if (!this.dragging) return;

    this.currentX =
      event instanceof MouseEvent ? event.pageX : event.changedTouches[0].pageX;

    this.getDirection();
    this.previousX = this.currentX;

    this.positionChange = this.currentX - this.startX;
    this.currentTranslation = this.positionChange + this.previousTranslation;
    // console.log(this.currentTranslation);

    // First or last slide exceeding limit
    if (!this.loop) {
      if (this.strechingEffect()) return;
    }

    this.draggingTranslation = true;
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

  autoSlider() {
    // Percent of mouse mouvement compared to card width
    const moveComparedToSlide =
      (this.positionChange / this.carousel.slideWidth) * 100;

    if (
      moveComparedToSlide < -this.LIMIT_AUTO_SLIDE ||
      moveComparedToSlide > this.LIMIT_AUTO_SLIDE
    ) {
      // to the right or left
      const change = this.direction === 'right' ? 1 : -1;
      const newSlide = this.findCurrentSlideNumber() + change;
      this.currentSlide = newSlide % this.totalSlides;
      this.computeTransformation(newSlide);
      this.changePrevAndNextLimits(newSlide);
    }
  }

  appendOrPrependNElements() {
    if (this.direction === 'left') {
      for (let i = this.arrayOfSlides.length - 1; i >= 0; i--) {
        const clonedElement = this.arrayOfSlides[i].cloneNode(true);
        this.slidesContainer.prepend(clonedElement);
      }

      this.resetViewLeftDirection();
    } else {
      for (let i = 0; i < this.arrayOfSlides.length; i++) {
        const clonedElement = this.arrayOfSlides[i].cloneNode(true);
        this.slidesContainer.append(clonedElement);
      }
    }

    if (this.totalAmountOfSlides >= this.MAX_DOM_SIZE * this.totalSlides) {
      // add a limit for DOM growth, max X times original DOM
      this.limitDOMGrowth();
      this.DOMLimitReached = true;
    } else {
      this.totalAmountOfSlides += this.totalSlides;
      this.DOMLimitReached = false;
      this.updateSlideContainerWidth();
    }
  }

  limitDOMGrowth() {
    const slides = this.carousel.selectSlides();

    if (this.direction === 'right') {
      for (let i = 0; i < this.totalSlides; i++) {
        slides[i].remove();
      }

      this.resetViewRightDirection();
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

  resetViewLeftDirection() {
    const translation = this.maxTranslationValue - this.previousTranslation;
    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${-translation}px, 0px, 0px)`;
    this.slidesContainer.offsetHeight;
  }

  resetViewRightDirection() {
    const translation =
      this.currentTranslation +
      this.totalSlides * this.carousel.slideWidthWithGap;
    this.slidesContainer.style.transition = 'none';
    this.slidesContainer.style.transform = `translate3d(${translation}px, 0px, 0px)`;
    this.previousTranslation = translation - this.positionChange;
    this.slidesContainer.offsetHeight;
  }

  updateSlideContainerWidth() {
    // 1 gap less than the n of slides, 4 gaps for 5 slides
    const totalSlidesContainerWidth =
      this.slidesContainer.clientWidth +
      this.totalSlides * this.carousel.slideWidthWithGap;

    this.slidesContainer.style.width = totalSlidesContainerWidth + 'px';

    this.lastSlideOffset =
      totalSlidesContainerWidth -
      this.carousel.slideToShow * this.carousel.slideWidthWithGap +
      this.carousel.gap;
  }

  addSlidesNextInf() {
    this.appendOrPrependNElements();
  }

  addSlidesPrevInf() {
    this.appendOrPrependNElements();

    // // only for mouse | touch event
    let translation = -this.previousTranslation + this.maxTranslationValue;

    // put back where the translation was
    this.slidesContainer.style.transform = `translate3d(${-this
      .maxTranslationValue}px, 0px, 0px)`;
    this.previousTranslation = -translation;
  }

  increaseLimits() {
    this.nextLimit += Math.floor(this.carousel.slideWidthWithGap);

    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    this.currentLimit =
      Math.floor(this.nextLimit - this.carousel.slideWidthWithGap) +
      this.marginForCurrentLimit;
    console.log(this.prevLimit, this.nextLimit);
  }

  changePrevAndNextLimits(newLimit: number) {
    const limitInPX = newLimit * this.carousel.slideWidthWithGap;
    this.nextLimit = Math.floor(limitInPX + this.carousel.slideWidthWithGap);

    // adding a margin
    this.currentLimit =
      Math.floor(this.nextLimit - this.carousel.slideWidthWithGap) +
      this.marginForCurrentLimit;

    this.prevLimit = Math.floor(
      this.nextLimit - this.carousel.slideWidthWithGap * 2
    );

    console.log(this.prevLimit, this.nextLimit);
  }

  decreaseLimits() {
    // Taking back prevLimit or max translation after new slides created to the right
    let translationCorrectionAfterClone = this.prevLimit;
    if (this.loop) {
      translationCorrectionAfterClone =
        this.prevLimit <= 0 ? this.maxTranslationValue : this.prevLimit;
    }

    this.prevLimit =
      translationCorrectionAfterClone - this.carousel.slideWidthWithGap;

    this.nextLimit = this.prevLimit + 2 * this.carousel.slideWidthWithGap;

    this.prevLimit = Math.floor(this.prevLimit);
    this.nextLimit = Math.floor(this.nextLimit);

    this.currentLimit =
      Math.floor(this.nextLimit - this.carousel.slideWidthWithGap) +
      this.marginForCurrentLimit;

    console.log(this.prevLimit, this.nextLimit);
  }

  shouldHandleInfiniteEventChanges() {
    // a new slide has to be created, autoslide enabled or not

    if (this.currentTranslation > 0) {
      this.addSlidesPrevInf();

      this.decreaseLimits();
      // not enabled at start
      if (this.currentSlide > 0) {
        this.changeOnlySlideNumber(1);
      }
      return true;
    } else if (
      -this.currentTranslation >
        this.lastSlideOffset - this.carousel.slideWidthWithGap &&
      this.direction === 'right'
    ) {
      // one slide width of margin for creating new slides.
      this.addSlidesNextInf();

      if (this.DOMLimitReached) {
        const actualSlide = this.findCurrentSlideNumber() - this.totalSlides;
        if (actualSlide < 17) debugger;
        console.log(actualSlide);

        this.changePrevAndNextLimits(actualSlide);
        return true;
      }
    }
    return false;
  }

  modifyCurrentSlide() {
    if (this.loop) {
      if (this.shouldHandleInfiniteEventChanges()) return;
    }

    if (this.autoSlide) {
      this.autoSlider();
      return;
    }

    if (-this.currentTranslation < this.prevLimit) {
      this.changeOnlySlideNumber(1);
      this.decreaseLimits();
    } else if (-this.currentTranslation >= this.nextLimit) {
      this.changeOnlySlideNumber(1);
      this.increaseLimits();
    }
  }

  unActiveTab(event: any) {
    if (
      event.target.visibilityState === 'visible' &&
      this.draggingTranslation
    ) {
      this.dragStop(event);
    }
  }

  prev() {
    this.direction = 'left';
    if (this.loop) {
      this.handleBtnInfinite();
      return;
    }

    this.changeOnlySlideNumber(this.slideToScroll);
    this.computeTransformation(this.currentSlide);
  }

  handleBtnInfinite() {
    let goingTo = this.findCurrentSlideNumber();
    goingTo +=
      this.direction === 'right' ? this.slideToScroll : -this.slideToScroll;
    // debugger;

    if (goingTo < 0) {
      this.addSlidesPrevInf();
      goingTo += this.totalSlides;
    } else if (goingTo + this.carousel.slideToShow > this.totalAmountOfSlides) {
      // We are exceeding last slide
      this.addSlidesNextInf();
      if (this.DOMLimitReached) goingTo -= this.totalSlides;
    }

    this.computeTransformation(goingTo);
    this.changePrevAndNextLimits(goingTo);
    this.changeOnlySlideNumber(this.slideToScroll);
  }

  goTo(bullet: number) {
    if (this.carousel.numberDots === 1) return;
    if (this.currentSlide < bullet) {
      this.direction = 'right';
    } else {
      this.direction = 'left';
    }

    if (this.loop) {
      this.navInfiniteBullets(bullet);
      return;
    }

    this.currentSlide = bullet;
    this.changePrevAndNextLimits(bullet);
    this.computeTransformation(bullet);
  }

  navInfiniteBullets(bullet: number) {
    let actualSlide = this.findCurrentSlideNumber();
    const positionOfCurrentSlide = actualSlide % this.totalSlides;
    const difference = bullet - positionOfCurrentSlide;
    let goingTo = actualSlide + difference;

    if (goingTo + this.carousel.slideToShow > this.totalAmountOfSlides) {
      this.addSlidesNextInf();
      if (this.DOMLimitReached) goingTo -= this.totalSlides;
    }

    this.computeTransformation(goingTo);
    this.changePrevAndNextLimits(goingTo);
    this.currentSlide = bullet;
  }

  findCurrentSlideNumber() {
    const limit = Math.abs(this.currentLimit) / this.carousel.slideWidthWithGap;
    return Math.floor(limit);
  }

  changeOnlySlideNumber(step: number) {
    if (this.carousel.numberDots === 1) return;
    // debugger;
    if (this.loop) {
      if (this.direction === 'right') {
        if ((this.currentSlide += step) > this.lastSlide) {
          const surplus =
            this.currentSlide % this.lastSlide ||
            this.currentSlide / this.lastSlide;
          this.currentSlide = surplus - 1;
        }
      } else {
        if ((this.currentSlide -= step) < 0) {
          const surplus =
            this.currentSlide % this.lastSlide ||
            this.lastSlide / this.currentSlide - 1;
          this.currentSlide = this.totalSlides + surplus;
        }
      }

      return;
    }

    if (this.direction === 'right') {
      if ((this.currentSlide += step) > this.lastSlide) {
        this.currentSlide = this.lastSlide;
      }
    } else {
      if ((this.currentSlide -= step) < 0) {
        this.currentSlide = 0;
      }
    }
  }

  next() {
    this.direction = 'right';
    if (this.loop) {
      // debugger;
      this.handleBtnInfinite();
      return;
    }

    this.changeOnlySlideNumber(this.slideToScroll);
    this.computeTransformation(this.currentSlide);
  }

  computeTransformation(slide: number) {
    const transformation = slide * this.carousel.slideWidthWithGap;

    this.changeSlide(transformation);
  }

  changeSlide(transformation: number) {
    this.slidesContainer.style.transition = `transform ${this.animationTimingMs}ms ${this.animationTimingFn}`;

    this.slidesContainer.style.transform = `translate3d(${-transformation}px, 0px, 0px)`;

    this.dragging = false;
    this.draggingTranslation = false;
    this.previousTranslation = -transformation;
    this.currentTranslation = -transformation;
  }
}
