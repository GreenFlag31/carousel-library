# Carousel

si pas de reponsive alors :

- taille fixée par utilisateur
- slideToShow n'a plus vraiment de sens, n de slides déterminés par la largeur de ceux-ci

Autre commmentaire :

- Since styling personalisation possibilities are almost endless, I've chosen not to add properties over style (such as "light theme" or "dark theme").
  If you want to change default style, just erase existing style in the component hosting the carousel.
  Following example will erase the (default) blue background arrows :
  <!-- ::ng-deep .carousel-container .previous,
  ::ng-deep .carousel-container .next {
  background: red !important;
  } -->
