import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestingComponent } from './testing/testing.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'testing' },
  { path: 'testing', component: TestingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
