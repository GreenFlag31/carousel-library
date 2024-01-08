export type AnimationTimingFn =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';

export interface Sliding {
  slide: number;
  carouselID: number;
}
