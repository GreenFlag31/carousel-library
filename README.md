# ngx-carousel-ease

# Description

ngx-carousel-ease is a versatile Angular library providing a feature-rich, simple, and performant carousel component. This library supports infinite and responsive mode, mouse and touch event. Attention has been put to accessibility, performance, and friendly developer experience.

This library is signal based, compatible with a zoneless Angular application, and RxJs free (_available from @0.1.9_).

Support Angular version starts at v17.

# Demo

Live demonstration of the ngx-carousel-ease library [here](https://greenflag31.github.io/carousel-library/ngx-carousel-ease).

# Installation

| Version | Command                       | Description                                                                                         |
| ------- | ----------------------------- | --------------------------------------------------------------------------------------------------- |
| V17     | npm i ngx-carousel-ease@0.1.4 | Install the V17 compatible version.                                                                 |
| V18     | npm i ngx-carousel-ease@0.1.6 | Install the V18 compatible version. This version is compatible with a zoneless Angular application. |
| V19     | npm i ngx-carousel-ease@0.2.0 | Install the V19 compatible version. This version is RxJS-free.                                      |
| V20     | npm i ngx-carousel-ease@0.2.1 | Install the V20 compatible version                                                                  |
| V21     | npm i ngx-carousel-ease@0.2.2 | Install the V21 compatible version                                                                  |

Then, add the `CarouselComponent` in the imports array of the hosting component (if standalone) or to your `appModule`.
Finally, add your cards content within the `<carousel></carousel>` selector in the hosting component. Each of your card should contain the class `carousel-slide`.

<details>
  <summary>
    <b>From ngx-carousel-ease@0.1.4 until 0.1.9</b>
  </summary>

```html
<carousel>
  <div class="carousel-slide">...</div>
  <div class="carousel-slide">...</div>
  ...
</carousel>
```

</details>

<details>
  <summary>
    <b>From ngx-carousel-ease@0.2.0</b>
  </summary>

Wrap your slides in a `ng-template` container and mark them with `#carouselViewContainer` and `#carouselTemplateRef`. This is necessary in infinite mode to keep Angular elements attached (see issue [#15](https://github.com/GreenFlag31/carousel-library/issues/15)).

```html
<carousel>
  <ng-template #carouselViewContainer #carouselTemplateRef>
    <div class="carousel-slide">...</div>
    <div class="carousel-slide">...</div>
    ...
  </ng-template>
</carousel>
```

</details>

# Inputs

The carousel is configured by default and all inputs are optional.

| Name                      | Default    | Description                                                                                                                                                                                                                   |
| ------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| maxWidthCarousel          | undefined  | Define the max width of the carousel in pixels.                                                                                                                                                                               |
| infinite                  | false      | Enable infinite loop of slides.                                                                                                                                                                                               |
| responsive                | true       | Width of the slides will be automatically adapted. In non-responsive mode, the width of the slides won't be adapted.                                                                                                          |
| autoSlide                 | true       | Enable sliding on drag stop. Carousel will slide towards the nearest slide.                                                                                                                                                   |
| autoslideLimitPercentCard | 30         | Percentage of the card compared to mouvement to trigger automatic sliding.                                                                                                                                                    |
| autoPlay                  | false      | Enable automatic sliding within an interval of time. In finite carousel, autoPlay will stop if the start or the end of the carousel is reached.                                                                               |
| autoPlayInterval          | 1500       | Interval of time in milliseconds for automatic sliding (autoPlay).                                                                                                                                                            |
| autoPlayAtStart           | false      | Enable autoPlay at start.                                                                                                                                                                                                     |
| autoPlaySlideToScroll     | 1          | Number of slides to scroll for the autoPlay.                                                                                                                                                                                  |
| displayAutoPlayControls   | true       | Display the play and pause autoPlay controls.                                                                                                                                                                                 |
| playDirection             | ltr        | Direction of the autoPlay. Accepts: ltr or rtl (left to right or right to left).                                                                                                                                              |
| slideToShow               | 3          | Number of slides to show at a time. The number of slides to show is dependant of the available space.                                                                                                                         |
| slideToScroll             | 2          | Number of slides to scroll at a time.                                                                                                                                                                                         |
| strechingLimit            | 60         | Limit for the stretching effect in pixels. Streching effect occurs only in finite mode and at the start or end of the carousel.                                                                                               |
| slideWidth                | 300        | Width of each slide in pixels.                                                                                                                                                                                                |
| slideMaxWidth             | 500        | Maximum width of each slide in pixels.                                                                                                                                                                                        |
| dots                      | true       | Display navigation dots.                                                                                                                                                                                                      |
| arrows                    | true       | Display navigation arrows.                                                                                                                                                                                                    |
| counter                   | true       | Display slide counter.                                                                                                                                                                                                        |
| counterSeparator          | '/'        | Separator for the slide counter.                                                                                                                                                                                              |
| enableMouseDrag           | true       | Enable mouse drag for navigation.                                                                                                                                                                                             |
| enableTouch               | true       | Enable touch drag for navigation.                                                                                                                                                                                             |
| gapBetweenSlides          | 16         | Gap between slides in pixels.                                                                                                                                                                                                 |
| animationTimingFn         | 'ease-out' | Timing function for the slide transition animation. Options include 'linear', 'ease-in', 'ease-out', 'ease-in-out'.                                                                                                           |
| animationTimingMs         | 300        | Duration of slide transition animation in milliseconds.                                                                                                                                                                       |
| maxDomSize                | 4          | In infinite mode, maximum number of times the number of slides present in the DOM to prevent infinite growth. Example: 6 cards x 4 = 24 maximum cards. If you want to disable this feature, pass 'Infinity' to this property. |

# Service

Inject the CarouselService through regular dependency injection in your hosting component.

<details>
  <summary>
    <b>From ngx-carousel-ease@0.1.4 until 0.1.8</b>
  </summary>

This library provides a CarouselService containing an RxJs BehaviorSubject `onSlideChange` that is triggered at every slide change. `onSlideChange` returns an object containing the current slide number and the carousel ID (useful if multiple carousel on a page to target a specific carousel instance). The slide number and carousel ID are zero indexed.

```javascript
ngOnInit() {
  this.carouselService.onSlideChange.subscribe((slideAndID) => {
    // change carousel colors, trigger a function, ...
  });
}
```

</details>

<details>
  <summary>
    <b>From ngx-carousel-ease@0.1.9</b>
  </summary>

From the @0.1.9, RxJs has been replaced by a Javascript CustomEvent. The slide number is zero indexed.

```javascript
// Target your carousel element, and listen for a `slideChange` event.
thirdCarousel.addEventListener("slideChange", (data: CustomEventInit) => {
  const slide = data.detail; // the slide number

  // change carousel colors, trigger a function, ...
});
```

</details>

The third example in the demo uses this functionnality.

# Style Customisation

Given the nearly infinite and subjective possibilities for customization, a predefined choice of themes (such as light or dark) has not been incorporated.

If you wish to customize the theme or parts of the carousel, add `encapsulation: ViewEncapsulation.None` to the hosting parent component and erase the default styles. Find the corresponding classes by inspecting the DOM.

The following example changes the defaulted blue arrows:

```css
.carousel-container .prev,
.carousel-container .next {
  background: red !important;
}
```

# SSR (Server Side Rendering)

This library supports Server Side Rendering (SSR). The carousel will not instantiate during server-side execution, as it requires access to the DOM API, preventing errors.

# DX Friendly

Ensuring a seamless Developer Experience (DX), basic validation is performed on the parameters passed to the carousel. An error is raised in case of abnormal parameters. Please note that common sense mistakes, such as passing a negative value for slide to show or a negative carousel max width, are not validated. This library has been meticulously documented.

# Performance

Emphasis has been placed on performance, adopting `ChangeDetectionStrategy.OnPush` and utilizing `translate3d` instead of `translateX`. This choice aims to enable hardware acceleration in specific scenarios, which can contribute to a smoother and more efficient user experience. By default, if infinite mode is enabled, a function will prevent infinite DOM growth by removing invisible cards.

# Change log

Version 0.0.7: Support for dynamically HTML generated content (ngFor, @for) for slide creation. Correction of a validation bug.

Version 0.0.9: Change in the behavior of the auto slide. Auto slide will now occur on drag stop (when the user releases the mouse), and will automatically slide towards the nearest slide based on the set threshold. Auto slide is set to true by default.

Version 0.1.1: Fixed a race condition that could occur betweeen evaluation of the template and initialisation of the variables.

Version 0.1.2: Adding an autoPlay feature.

Version 0.1.6: Blocking resize event triggered at vertical scrolling on phones.

Version 0.1.7: Removing RxJs to anticipate the future optional RxJs. Transforming inputs to signals.

Version 0.1.8: TouchEvent fix for Firefox. Thanks to @seba174.

Version 0.1.9: Internal API refactoring, signal based template, and bug fix.

Version 0.2.0: Change of the cloning process with the Angular API and SSR bug correction in the ngOnDestroy hook.

Version 0.2.1: Angular 20 support.

Version 0.2.2: Angular 21 support.

# Report a Bug

Please provide a detailed description of the encountered bug, including your carousel configuration and the steps/actions that led to the issue. An accurate description will help me to reproduce the issue.

# Ngx-ease serie

You like this library? Discover the ngx-ease serie [here](https://www.npmjs.com/~greenflag31).
