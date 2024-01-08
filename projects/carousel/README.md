# ngx-carousel-ease

# Description

ngx-carousel-ease is a versatile Angular providing a feature-rich, simple, and performant carousel component. This librairy supports infinite and responsive mode, mouse and touch event. Attention has been put to accessibility, performance, and friendly developer experience.

Support Angular version starts at v17.

# Demo

Live demonstration of the ngx-carousel-ease library [here](#).

# Installation

You can install the library using the following command:

```
npm i ngx-carousel-ease
```

Then, add the `CarouselModule` in the imports array of the hosting component (if standalone) or to your `appModule`.
Finally, add your cards content within the `<carousel></carousel>` selector in the hosting component. Each of your card should contain the class `carousel-slide`.

```
<carousel>
  <div class="carousel-slide">
    ...
  </div>
  <div class="carousel-slide">
    ...
  </div>
  ...
</carousel>
```

# Inputs

This carousel is configured by default and all inputs are optional.

| Name                                                                     | Default                                                   | Description                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------ | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span style="background-color:#f2f2f2;">maxWidthCarousel</span>          | <span style="background-color:#f2f2f2;">undefined</span>  | <span style="background-color:#f2f2f2;">Define the max width of the carousel in pixels.</span>                                                                                                                                                             |
| infinite                                                                 | false                                                     | Enable infinite loop of slides.                                                                                                                                                                                                                            |
| <span style="background-color:#f2f2f2;">responsive</span>                | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Width of the slides will be automatically adapted. In non-responsive mode, the width of the slides won't be adapted.</span>                                                                                        |
| autoSlide                                                                | false                                                     | Enable automatic sliding.                                                                                                                                                                                                                                  |
| <span style="background-color:#f2f2f2;">autoslideLimitPercentCard</span> | <span style="background-color:#f2f2f2;">30</span>         | <span style="background-color:#f2f2f2;">Percentage of the card compared to mouvement to trigger automatic sliding.</span>                                                                                                                                  |
| <span style="background-color:#f2f2f2;">slideToShow</span>               | <span style="background-color:#f2f2f2;">3</span>          | <span style="background-color:#f2f2f2;">Number of slides to show at a time. The number of slides to show is dependant of the available space.</span>                                                                                                       |
| <span style="background-color:#f2f2f2;">slideToScroll</span>             | <span style="background-color:#f2f2f2;">2</span>          | <span style="background-color:#f2f2f2;">Number of slides to scroll at a time.</span>                                                                                                                                                                       |
| <span style="background-color:#f2f2f2;">strechingLimit</span>            | <span style="background-color:#f2f2f2;">60</span>         | <span style="background-color:#f2f2f2;">Limit for the stretching effect in pixels. Streching effect occurs only in finite mode and at the start or end of the carousel.</span>                                                                             |
| <span style="background-color:#f2f2f2;">slideWidth</span>                | <span style="background-color:#f2f2f2;">300</span>        | <span style="background-color:#f2f2f2;">Width of each slide in pixels.</span>                                                                                                                                                                              |
| <span style="background-color:#f2f2f2;">slideMaxWidth</span>             | <span style="background-color:#f2f2f2;">500</span>        | <span style="background-color:#f2f2f2;">Maximum width of each slide in pixels.</span>                                                                                                                                                                      |
| <span style="background-color:#f2f2f2;">dots</span>                      | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display navigation dots.</span>                                                                                                                                                                                    |
| <span style="background-color:#f2f2f2;">arrows</span>                    | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display navigation arrows.</span>                                                                                                                                                                                  |
| <span style="background-color:#f2f2f2;">counter</span>                   | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display slide counter.</span>                                                                                                                                                                                      |
| <span style="background-color:#f2f2f2;">counterSeparator</span>          | <span style="background-color:#f2f2f2;">'/'</span>        | <span style="background-color:#f2f2f2;">Separator for the slide counter.</span>                                                                                                                                                                            |
| <span style="background-color:#f2f2f2;">enableMouseDrag</span>           | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Enable mouse drag for navigation.</span>                                                                                                                                                                           |
| <span style="background-color:#f2f2f2;">enableTouch</span>               | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Enable touch drag for navigation.</span>                                                                                                                                                                           |
| <span style="background-color:#f2f2f2;">gapBetweenSlides</span>          | <span style="background-color:#f2f2f2;">16</span>         | <span style="background-color:#f2f2f2;">Gap between slides in pixels.</span>                                                                                                                                                                               |
| <span style="background-color:#f2f2f2;">animationTimingFn</span>         | <span style="background-color:#f2f2f2;">'ease-out'</span> | <span style="background-color:#f2f2f2;">Timing function for the slide transition animation. Options include 'linear', 'ease-in', 'ease-out', 'ease-in-out'.</span>                                                                                         |
| <span style="background-color:#f2f2f2;">animationTimingMs</span>         | <span style="background-color:#f2f2f2;">300</span>        | <span style="background-color:#f2f2f2;">Duration of slide transition animation in milliseconds.</span>                                                                                                                                                     |
| <span style="background-color:#f2f2f2;">maxDomSize</span>                | <span style="background-color:#f2f2f2;">4</span>          | <span style="background-color:#f2f2f2;">Maximum number of times the number of slides present in the DOM to prevent infinite growth. Example: 6 cards x 4 = 24 maximum cards. If you want to disable this feature, pass 'Infinity' to this property.</span> |

# Style Customisation

Given the nearly infinite and subjective possibilities for customization, a predefined choice of themes (such as light or dark) has not been incorporated.

If you wish to customize the theme or parts of the carousel, add `encapsulation: ViewEncapsulation.None` to the hosting parent component and erase the default styles. Find the corresponding classes by inspecting the DOM.

The following example changes the defaulted blue arrows:

```
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

# Report a Bug

Please provide a detailed description of the encountered bug, including your carousel configuration and the steps/actions that led to the issue. An accurate description will help me to reproduce the issue.
