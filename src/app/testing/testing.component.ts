import { Component, ViewEncapsulation } from '@angular/core';
import {
  CarouselModule,
  CarouselService,
} from 'projects/carousel/src/public-api';

interface Colors {
  [index: number]: string;
}

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css'],
  standalone: true,
  imports: [CarouselModule],
  encapsulation: ViewEncapsulation.None,
})
export class TestingComponent {
  constructor(private carouselService: CarouselService) {}
  colorPalette: Colors = {
    0: '#008000',
    1: '#00a0a9',
    2: '#bb0000',
    3: '#dfe400',
  };

  ngOnInit() {
    this.carouselService.onSlideChange.subscribe((slideAndID) => {
      const { slide, carouselID } = slideAndID;
      if (carouselID !== 2) return;

      this.changeColorArrowsAndBullets(slide, this.colorPalette[slide]);
    });
  }

  changeColorArrowsAndBullets(slide: number, color: string) {
    const btn = document.querySelector(
      '.third-carousel .btn-container'
    ) as HTMLDivElement;
    (btn.querySelector('.prev') as HTMLDivElement).style.background = color;
    (btn.querySelector('.next') as HTMLDivElement).style.background = color;

    const bullets = document.querySelectorAll(
      '.third-carousel .bullets-container .bullet'
    ) as NodeListOf<HTMLButtonElement>;
    for (const bullet of bullets) {
      bullet.style.background = '#dbdada';
    }

    bullets[slide].style.background = color;
  }
}
