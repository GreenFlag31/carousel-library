import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestingComponent } from './testing/testing.component';
import { CarouselModule } from 'projects/carousel/src/public-api';
import { TooltipDirective } from 'ngx-tooltip-ease';

@NgModule({
  declarations: [AppComponent, TestingComponent],
  imports: [BrowserModule, AppRoutingModule, CarouselModule, TooltipDirective],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
