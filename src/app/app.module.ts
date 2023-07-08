import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestingComponent } from './testing/testing.component';
import { CarouselModule } from 'carousel';

@NgModule({
  declarations: [AppComponent, TestingComponent],
  imports: [BrowserModule, AppRoutingModule, CarouselModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
