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

export type prependOrAppend = 'prepend' | 'append';

export type changeType = 'arrow' | 'mouse';
