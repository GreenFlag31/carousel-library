import { Carousel } from './carousel';
import { prependOrAppend } from './interfaces';

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
  nextLimit = 0;
  slideContainer!: HTMLDivElement;
  fromLastSlide = false;
  fromFirstSlide = false;
  numberOfTranslations = 0;
  oneTranslationBeforeMax = 0;
  maxTranslationValue = 0;

  constructor(
    private carousel: Carousel,
    private readonly slideToScroll: number,
    private readonly slidingLimitBeforeScroll: number,
    private readonly strechingLimit: number,
    private readonly autoSlide: boolean,
    private readonly animationTimingFn: string,
    private readonly animationTimingMs: number,
    private readonly enableMouseDrag: boolean,
    private readonly enableTouch: boolean,
    private readonly loop: boolean
  ) {
    this.slideContainer = this.carousel.slidesContainer;

    this.updateProperties();
    this.setUpPrevAndNextLimit();
    this.oneTranslationBeforeMax = this.getOneTranslationBeforeMaxTranslation();
    this.maxTranslationValue =
      this.oneTranslationBeforeMax + carousel.slideWidthWithGap;
  }

  updateProperties() {
    this.lastSlide = this.carousel.numberDots - 1;
  }

  getOneTranslationBeforeMaxTranslation() {
    // starting at 0 and  - 1 because 0 indexed
    return (
      (this.carousel.totalSlides - this.carousel.slideToShow - 1) *
      this.carousel.slideWidthWithGap
    );
  }

  setUpPrevAndNextLimit() {
    this.prevLimit = 0;
    this.nextLimit = this.carousel.slideWidthWithGap;

    // si infini alors une fenetre en plus
    // {0: 0, 1: 382, 2: 764, 3: 1146}
    // currentSlide 0 et currentTranslation > 382 alors ++
    // currentSlide 1 et currentTranslation === 0 alors --
    // switch case ?
    // si on se déplace (+2 par exemple) alors tout + 2 sauf + 1 pour ceux qui dépassent car slide en plus en infini
    // exemple avec 3
    // 3 + 2 = 5
    // 5 % 4 = 1
    // 1 - 1 = 0
  }

  dragStart(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;

    this.dragging = true;

    this.startX =
      event instanceof MouseEvent ? event.pageX : event.touches[0].pageX;

    this.previousX = this.startX;
    this.slideContainer.style.transition = 'none';
  }

  dragStop(event: MouseEvent | TouchEvent) {
    if (this.currentEventIsDisabled(event)) return;
    this.dragging = false;

    this.previousTranslation = this.currentTranslation;

    const limit =
      (this.currentSlide === 0 && this.direction === 'left') ||
      (this.currentSlide === this.lastSlide && this.direction === 'right');

    if (this.draggingTranslation && limit && !this.loop) {
      this.computeTransformation(this.currentSlide);
    }
  }

  currentEventIsDisabled(event: MouseEvent | TouchEvent) {
    if (
      (event instanceof MouseEvent && !this.enableMouseDrag) ||
      (event instanceof TouchEvent && !this.enableTouch)
    ) {
      return true;
    }

    return false;
  }

  getDirection() {
    if (this.previousX > this.currentX) {
      this.direction = 'right';
    } else if (this.previousX < this.currentX) {
      this.direction = 'left';
    }
  }

  dragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;
    if (this.currentEventIsDisabled(event)) return;

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
    this.slideContainer.style.transform = `translate3d(${this.currentTranslation}px, 0, 0)`;

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

    if (moveComparedToSlide < -this.slidingLimitBeforeScroll) {
      this.changeOnlySlideNumber(1);
      if (this.counterNextInf < 0) {
        // loop enabled and next slide
        const transformation =
          -this.previousTranslation + this.carousel.slideWidthWithGap;
        this.changeSlide(transformation);
        return;
      }
      this.computeTransformation(this.currentSlide);
    } else if (moveComparedToSlide > this.slidingLimitBeforeScroll) {
      // loop enabled and new slide
      this.changeOnlySlideNumber(1);
      if (this.counterNextInf < 0) {
        this.changeSlide(0);
        return;
      }

      this.computeTransformation(this.currentSlide);
    }
  }

  addOneSlideNextInf() {
    this.prependOrAppendNTimesElement(1);

    let translation =
      -this.previousTranslation - this.carousel.slideWidthWithGap;

    // put back where the translation was
    this.slideContainer.style.transform = `translate3d(${-this
      .oneTranslationBeforeMax}px, 0, 0)`;
    this.previousTranslation = -translation;
    // debugger;

    if (!this.autoSlide && this.counterNextInf !== 0) {
      this.changeOnlySlideNumber(1);
    }
  }

  addOneSlidePrevInf() {
    this.prependOrAppendNTimesElement(1);

    let translation =
      -this.previousTranslation + this.carousel.slideWidthWithGap;

    // put back where the translation was
    this.slideContainer.style.transform = `translate3d(${-this.carousel
      .slideWidthWithGap}px, 0, 0)`;
    this.previousTranslation = -translation;

    if (!this.autoSlide && this.counterNextInf !== 0) {
      this.changeOnlySlideNumber(1);
    }
  }

  increasePrevAndNextLimit() {
    if (
      (this.nextLimit += this.carousel.slideWidthWithGap) >
      this.maxTranslationValue
    ) {
      this.nextLimit = this.maxTranslationValue;
    }
    //  il y aura this.carousel.slideToShow - 1 difference entre prev et next limit
    this.prevLimit =
      this.nextLimit -
      this.carousel.slideWidthWithGap * (this.carousel.slideToShow - 1);

    console.log(this.prevLimit, this.nextLimit);
  }

  decreasePrevAndNextLimit() {
    if ((this.prevLimit -= this.carousel.slideWidthWithGap) < 0) {
      this.prevLimit = 0;
    }
    this.nextLimit = this.prevLimit + this.carousel.slideWidthWithGap;

    // at index = 0 and new slide created
    if (this.prevLimit === 0) {
      this.nextLimit += this.carousel.slideWidthWithGap;
    }

    console.log(this.prevLimit, this.nextLimit);
  }

  modifyCurrentSlide() {
    if (this.loop) {
      const lastSlideExceeded = this.checkIfExceedingLastSlide(1);
      // a new slide has to be created, autoslide enabled or not
      if (this.currentTranslation > 0) {
        this.addOneSlidePrevInf();
        this.counterNextInf++;
        this.decreasePrevAndNextLimit();
        return;
      } else if (lastSlideExceeded) {
        this.addOneSlideNextInf();
        this.counterNextInf++;
        this.increasePrevAndNextLimit();
        return;
      }
    }

    if (this.autoSlide) {
      this.autoSlider();
      return;
    }

    if (
      -this.currentTranslation < this.prevLimit &&
      (this.currentSlide > 0 || this.loop)
    ) {
      this.changeOnlySlideNumber(1);
      this.decreasePrevAndNextLimit();
    } else if (-this.currentTranslation >= this.nextLimit) {
      debugger;
      this.changeOnlySlideNumber(1);
      this.increasePrevAndNextLimit();
    }
  }

  getLimitSlide(index: number) {
    const maximum =
      this.currentSlide + index > this.lastSlide - 1
        ? this.lastSlide - 1
        : this.currentSlide + index;
    let limit = maximum * this.carousel.slideWidthWithGap;

    if (index === 0) {
      limit -= this.carousel.slideWidthWithGap;
    }

    if (this.counterNextInf < 0 && index === 0) {
      limit -= this.carousel.slideWidthWithGap;
    }

    if (this.counterNextInf < 0 && index === 1) {
      if (maximum === 3) return limit;
      limit += this.carousel.slideWidthWithGap;
    }

    return limit < 0 ? 0 : limit;
  }

  unActiveTab(event: any) {
    if (
      event.target.visibilityState === 'visible' &&
      this.draggingTranslation
    ) {
      this.dragStop(event);
    }
  }

  prependOrAppendNTimesElement(times: number) {
    if (this.direction === 'left') {
      for (let i = 0; i < times; i++) {
        this.slideContainer.prepend(this.slideContainer.lastElementChild!);
      }
    } else {
      for (let i = 0; i < times; i++) {
        this.slideContainer.appendChild(this.slideContainer.firstElementChild!);
      }
    }
  }

  addSlidePrevInfinite() {
    const limit =
      -this.currentTranslation -
      this.slideToScroll * this.carousel.slideWidthWithGap;
    const result = Math.abs(limit) / this.carousel.slideWidthWithGap;
    // debugger;
    this.counterNextInf -= result;
    this.prependOrAppendNTimesElement(result);

    this.slideContainer.style.transition = 'none';
    let translation =
      -this.currentTranslation + this.carousel.slideWidthWithGap * result;
    // put back where the translation was
    this.slideContainer.style.transform = `translate3d(${-translation}px, 0, 0)`;

    this.slideContainer.offsetHeight;
    this.changeSlide(0);
  }

  prev() {
    this.direction = 'left';
    if (this.loop) {
      this.handlePrevInfinite();
      return;
    }

    this.changeOnlySlideNumber(this.slideToScroll);
    this.computeTransformation(this.currentSlide);
  }

  handlePrevInfinite() {
    if (
      this.currentTranslation +
        this.carousel.slideWidthWithGap * this.slideToScroll >
      0
    ) {
      this.addSlidePrevInfinite();
    } else {
      const transformation =
        -this.currentTranslation -
        this.carousel.slideWidthWithGap * this.slideToScroll;

      this.changeSlide(transformation);
    }

    this.changeOnlySlideNumber(this.slideToScroll);
  }

  counterNextInf = 0;
  addSlideNextInfinite() {
    const limit =
      -this.currentTranslation +
      this.slideToScroll * this.carousel.slideWidthWithGap;

    let result = limit / this.carousel.slideWidthWithGap;
    // debugger;
    result -= this.lastSlide - (this.carousel.slideToShow - 1);
    this.counterNextInf += result;
    this.prependOrAppendNTimesElement(result);

    this.currentTranslation =
      -this.currentTranslation - this.carousel.slideWidthWithGap * result;

    this.slideContainer.style.transition = 'none';
    // put back where the translation was
    this.slideContainer.style.transform = `translate3d(${-this
      .currentTranslation}px, 0, 0)`;

    this.slideContainer.offsetHeight;
    this.currentTranslation +=
      this.carousel.slideWidthWithGap * this.slideToScroll;
    this.changeSlide(this.currentTranslation);
  }

  checkIfExceedingLastSlide(step: number) {
    const goingTo =
      -this.currentTranslation + step * this.carousel.slideWidthWithGap;
    const limit = this.carousel.slideWidthWithGap * (this.lastSlide - 1);

    // console.log('goingTo:' + goingTo, 'limit:' + limit, goingTo > limit);

    return goingTo > limit;
  }

  handleNextInfinite() {
    if (this.checkIfExceedingLastSlide(this.slideToScroll)) {
      // We are exceeding last slide
      this.addSlideNextInfinite();
    } else {
      const transformation =
        -this.currentTranslation +
        this.carousel.slideWidthWithGap * this.slideToScroll;
      this.changeSlide(transformation);
    }

    this.changeOnlySlideNumber(this.slideToScroll);
  }

  changeOnlySlideNumber(step: number) {
    if (this.loop) {
      const difference = this.currentSlide - step;
      if (this.direction === 'right') {
        // debugger;
        if ((this.currentSlide += step) > this.lastSlide) {
          this.currentSlide = this.lastSlide - difference - 1;
        }
      } else {
        if ((this.currentSlide -= step) < 0) {
          this.currentSlide = this.lastSlide + difference + 1;
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
      this.handleNextInfinite();
      return;
    }

    this.changeOnlySlideNumber(this.slideToScroll);
    this.computeTransformation(this.currentSlide);
  }

  computeTransformation(slide: number) {
    const transformation = this.carousel.slideWidthWithGap * slide;

    this.changeSlide(transformation);
  }

  changeSlide(transformation: number) {
    this.slideContainer.style.transition = `transform ${this.animationTimingMs}ms ${this.animationTimingFn}`;

    this.slideContainer.style.transform = `translate3d(${-transformation}px, 0, 0)`;

    this.dragging = false;
    this.draggingTranslation = false;
    this.previousTranslation = -transformation;
    this.currentTranslation = -transformation;
  }

  goTo(bullet: number) {
    this.currentSlide < bullet
      ? (this.direction = 'right')
      : (this.direction = 'left');
    this.currentSlide = bullet;
    this.computeTransformation(bullet);
  }
}
