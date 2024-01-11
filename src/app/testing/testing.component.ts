import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class TestingComponent {
  projectsData = [
    {
      name: 'JS-in-practice',
      date: 'Dec. 2023',
      description: `Learn and practice Javascript with interactive exercises and questions. Build your evaluation, customise your editor, and more!`,
      links: {
        general: './js-in-practice',
        live: 'https://js-in-practice.com',
      },
    },
    {
      name: 'ngx-carousel-ease',
      date: 'Jan. 2024',
      description: `Creation of a library that supports infinite navigation, responsive mode, and many other options.`,
      links: {
        general: './ngx-carousel-ease',
        live: 'https://greenflag31.github.io/carousel-library/ngx-carousel-ease',
      },
    },
    {
      name: 'Food-App',
      date: 'March 2023',
      description: `This app lets you manage your food products. Never waste food
      again !`,
      links: {
        general: './food-app-project',
        live: 'https://my-list-a7fb0.web.app/getting-started',
        github: 'https://github.com/GreenFlag31/food-manager',
      },
    },
    {
      name: 'Roadster API',
      date: 'May 2023',
      description: `Roadster API is a REST API with authentication I have created about historical cars.`,
      links: {
        general: './roadster-api-project',
        live: 'https://historicalcars-api.com',
        github: 'https://github.com/GreenFlag31/car-api',
      },
    },
  ];
}
