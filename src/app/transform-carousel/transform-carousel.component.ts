import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';

type visibilityEvent = {
  target: {
    visibilityState: 'visible' | 'hidden';
  };
};

@Component({
  selector: 'app-transform-carousel',
  templateUrl: './transform-carousel.component.html',
  styleUrls: ['./transform-carousel.component.css'],
})
export class CarouselTransformComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  currentSlide = 0;
  totalProjectsSlide = 5;
  numberBullets!: number[];
  dragging = false;
  startX = 0;
  positionChange = 0;
  transformation = 0;
  elementTransformationPercent = 0;
  readonly slidingLimit = 30;
  readonly strechingLimit = 60;
  draggingTranslation = false;
  mouseupSubscription!: Subscription;
  VChangeSubscription!: Subscription;

  @ViewChild('projects') projects!: ElementRef<HTMLDivElement>;
  @ViewChild('card') card!: ElementRef<HTMLDivElement>;

  ngOnInit() {
    this.numberBullets = [...Array(this.totalProjectsSlide).keys()];
    this.elementTransformationPercent = (1 / this.totalProjectsSlide) * 100;
  }

  ngAfterViewInit() {
    this.mouseupSubscription = fromEvent(window, 'mouseup').subscribe(() => {
      if (!this.dragging) return;

      this.onDragStop();
    });
    this.VChangeSubscription = fromEvent(
      document,
      'visibilitychange'
    ).subscribe((event: any) => {
      this.unActiveTab(event);
    });
  }

  onDragStart(event: MouseEvent | TouchEvent) {
    this.dragging = true;
    this.startX =
      event instanceof MouseEvent ? event.screenX : event.touches[0].screenX;

    this.projects.nativeElement.style.transition = 'none';
  }

  onDragMove(event: MouseEvent | TouchEvent) {
    if (!this.dragging) return;

    const XCoordinate =
      event instanceof MouseEvent
        ? event.screenX
        : event.changedTouches[0].screenX;
    this.positionChange = XCoordinate - this.startX;
    const translateX =
      (this.positionChange / this.card.nativeElement.offsetWidth) * 100;

    const previousTranslation =
      this.projects.nativeElement.clientWidth *
      ((this.currentSlide * this.elementTransformationPercent) / 100);

    const currentTranslation = this.positionChange - previousTranslation;

    // First or last slide
    if (
      (currentTranslation > this.strechingLimit && this.currentSlide === 0) ||
      (this.positionChange < -this.strechingLimit &&
        this.currentSlide === this.totalProjectsSlide - 1)
    ) {
      return;
    }

    this.projects.nativeElement.style.transform = `translate3d(${currentTranslation}px, 0, 0)`;

    this.draggingTranslation = true;
    if (translateX < -this.slidingLimit) {
      // Going right, next slide
      this.changeSlide(++this.currentSlide);
    } else if (translateX > this.slidingLimit) {
      this.changeSlide(--this.currentSlide);
    }
  }

  onDragStop() {
    this.dragging = false;

    if (this.draggingTranslation) {
      this.changeSlide(this.currentSlide);
    }
  }

  unActiveTab(event: visibilityEvent) {
    if (
      event.target.visibilityState === 'visible' &&
      this.draggingTranslation
    ) {
      this.onDragStop();
    }
  }

  onPreviousProject() {
    this.changeSlide(--this.currentSlide);
  }

  onNextProject() {
    this.changeSlide(++this.currentSlide);
  }

  changeSlide(slide: number) {
    this.projects.nativeElement.style.transition = `transform 0.3s ease-out`;

    this.transformation = (slide / this.totalProjectsSlide) * 100;
    this.projects.nativeElement.style.transform = `translate3d(${-this
      .transformation}%, 0, 0)`;

    this.dragging = false;
    this.draggingTranslation = false;
  }

  goTo(bullet: number) {
    this.currentSlide = bullet;
    this.changeSlide(bullet);
  }

  ngOnDestroy() {
    this.mouseupSubscription.unsubscribe();
    this.VChangeSubscription.unsubscribe();
  }
}
