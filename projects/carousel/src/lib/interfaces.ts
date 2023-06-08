export type visibilityEvent = {
  target: {
    visibilityState: 'visible' | 'hidden';
  };
};

export type AnimationTimingFn =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out';
