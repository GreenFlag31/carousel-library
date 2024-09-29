import { Routes } from '@angular/router';
import { TestingComponent } from './testing/testing.component';

export const routes: Routes = [
  {
    path: '',
    component: TestingComponent,
    pathMatch: 'full',
  },
];
