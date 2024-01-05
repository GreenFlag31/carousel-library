# ngx-carousel-ease

# Demo

Explore a live demonstration of the ngx-carousel-ease library [here](#).

# Installation

You can install the library using the following command:

```
npm i ngx-carousel-ease
```

# Inputs

| Name                                                                     | Default                                                   | Description                                                                                                                                                                         |
| ------------------------------------------------------------------------ | --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <span style="background-color:#f2f2f2;">maxWidthCarousel</span>          | <span style="background-color:#f2f2f2;">undefined</span>  | <span style="background-color:#f2f2f2;">Defines the max width of the carousel. The max width should be defined in pixels.</span>                                                    |
| infinite                                                                 | true                                                      | Enable infinite loop of slides.                                                                                                                                                     |
| <span style="background-color:#f2f2f2;">responsive</span>                | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Width of the slides will be automatically adapted. In non responsive mode, the width of the slides won't be adapted.</span>                 |
| autoSlide                                                                | false                                                     | Enable automatic sliding.                                                                                                                                                           |
| <span style="background-color:#f2f2f2;">slideToShow</span>               | <span style="background-color:#f2f2f2;">3</span>          | <span style="background-color:#f2f2f2;">Number of slides to show at a time. The number of slides to show is dependant of the available space.</span>                                |
| <span style="background-color:#f2f2f2;">slideToScroll</span>             | <span style="background-color:#f2f2f2;">2</span>          | <span style="background-color:#f2f2f2;">Number of slides to scroll at a time.</span>                                                                                                |
| <span style="background-color:#f2f2f2;">autoslideLimitPercentCard</span> | <span style="background-color:#f2f2f2;">30</span>         | <span style="background-color:#f2f2f2;">Percentage of the card visible to trigger automatic sliding.</span>                                                                         |
| <span style="background-color:#f2f2f2;">strechingLimit</span>            | <span style="background-color:#f2f2f2;">60</span>         | <span style="background-color:#f2f2f2;">Limit for the stretching effect in pixels. Streching effect occurs only in finite mode and at the start or end of the carousel.</span>      |
| <span style="background-color:#f2f2f2;">slideWidth</span>                | <span style="background-color:#f2f2f2;">300</span>        | <span style="background-color:#f2f2f2;">Width of each slide in pixels.</span>                                                                                                       |
| <span style="background-color:#f2f2f2;">slideMaxWidth</span>             | <span style="background-color:#f2f2f2;">500</span>        | <span style="background-color:#f2f2f2;">Maximum width of each slide in pixels.</span>                                                                                               |
| <span style="background-color:#f2f2f2;">dots</span>                      | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display navigation dots.</span>                                                                                                             |
| <span style="background-color:#f2f2f2;">arrows</span>                    | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display navigation arrows.</span>                                                                                                           |
| <span style="background-color:#f2f2f2;">counter</span>                   | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Display slide counter.</span>                                                                                                               |
| <span style="background-color:#f2f2f2;">enableMouseDrag</span>           | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Enable mouse drag for navigation.</span>                                                                                                    |
| <span style="background-color:#f2f2f2;">enableTouch</span>               | <span style="background-color:#f2f2f2;">true</span>       | <span style="background-color:#f2f2f2;">Enable touch drag for navigation.</span>                                                                                                    |
| <span style="background-color:#f2f2f2;">counterSeparator</span>          | <span style="background-color:#f2f2f2;">'/'</span>        | <span style="background-color:#f2f2f2;">Separator for the slide counter.</span>                                                                                                     |
| <span style="background-color:#f2f2f2;">gapBetweenSlides</span>          | <span style="background-color:#f2f2f2;">16</span>         | <span style="background-color:#f2f2f2;">Gap between slides in pixels.</span>                                                                                                        |
| <span style="background-color:#f2f2f2;">animationTimingMs</span>         | <span style="background-color:#f2f2f2;">300</span>        | <span style="background-color:#f2f2f2;">Duration of slide transition animation in milliseconds.</span>                                                                              |
| <span style="background-color:#f2f2f2;">maxDomSize</span>                | <span style="background-color:#f2f2f2;">4</span>          | <span style="background-color:#f2f2f2;">Maximum number of times the number of slides present in the DOM to prevent infinite growth. Example: 6 cards x 4 = 24 maximum cards.</span> |
| <span style="background-color:#f2f2f2;">animationTimingFn</span>         | <span style="background-color:#f2f2f2;">'ease-out'</span> | <span style="background-color:#f2f2f2;">Timing function for the slide transition animation. Options include 'linear', 'ease-in', 'ease-out', 'ease-in-out'.</span>                  |

```

```
