import { AfterViewInit, Component, ViewEncapsulation } from '@angular/core';
import { CarouselComponent } from 'projects/carousel/src/public-api';

interface Colors {
  [index: number]: string;
}

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css'],
  standalone: true,
  imports: [CarouselComponent],
  encapsulation: ViewEncapsulation.None,
})
export class TestingComponent implements AfterViewInit {
  colorPalette: Colors = {
    0: '#008000',
    1: '#00a0a9',
    2: '#bb0000',
    3: '#dfe400',
  };

  ngAfterViewInit() {
    const thirdCarousel = document.querySelector(
      '.third-carousel'
    ) as HTMLDivElement;

    thirdCarousel.addEventListener('slideChange', (data: CustomEventInit) => {
      const slide = data.detail;

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
