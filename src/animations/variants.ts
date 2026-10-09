import type { Variants } from 'framer-motion';
import {
  PAGE_TRANSITION,
  MODAL_BACKDROP_TRANSITION,
  MODAL_CONTENT_TRANSITION,
  TOAST_TRANSITION,
} from './transitions';

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: PAGE_TRANSITION,
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: 0.18,
      ease: 'easeIn',
    },
  },
};

export const pageVariantsReduced: Variants = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 1, y: 0 },
};

export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  hover: {
    y: -2,
    boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.07)',
  },
};

export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: MODAL_BACKDROP_TRANSITION,
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.16 },
  },
};

export const modalDialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 6,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: MODAL_CONTENT_TRANSITION,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: { duration: 0.15 },
  },
};

export const drawerVariants: Variants = {
  hidden: {
    x: '100%',
  },
  visible: {
    x: 0,
    transition: {
      type: 'spring',
      damping: 30,
      stiffness: 300,
    },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2 },
  },
};

export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: TOAST_TRANSITION,
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.98,
    transition: { duration: 0.18 },
  },
};
