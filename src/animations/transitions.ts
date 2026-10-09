import type { Transition } from 'framer-motion';

export const PAGE_TRANSITION: Transition = {
  duration: 0.28,
  ease: [0.25, 0.1, 0.25, 1],
};

export const CARD_HOVER_TRANSITION: Transition = {
  duration: 0.18,
  ease: 'easeOut',
};

export const MODAL_BACKDROP_TRANSITION: Transition = {
  duration: 0.2,
  ease: 'linear',
};

export const MODAL_CONTENT_TRANSITION: Transition = {
  duration: 0.24,
  ease: [0.16, 1, 0.3, 1],
};

export const TOAST_TRANSITION: Transition = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
};

export const TAB_INDICATOR_TRANSITION: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 35,
};

export const INSTANT_TRANSITION: Transition = {
  duration: 0,
};
