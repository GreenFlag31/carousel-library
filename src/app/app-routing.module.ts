import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ScrollCarouselComponent } from './scroll-carousel/scroll-carousel.component';
import { CarouselTransformComponent } from './transform-carousel/transform-carousel.component';
import { TestingComponent } from './testing/testing.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'testing' },
  {
    path: 'scroll-carousel',
    component: ScrollCarouselComponent,
  },
  { path: 'carousel', component: CarouselTransformComponent },
  { path: 'testing', component: TestingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
