import { pageVariants, pageVariantsReduced } from './variants';
import { PAGE_TRANSITION } from './transitions';

export const getPageVariants = (reducedMotion: boolean) => {
  return reducedMotion ? pageVariantsReduced : pageVariants;
};

export const pageMotionProps = (reducedMotion: boolean) => ({
  variants: getPageVariants(reducedMotion),
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  transition: PAGE_TRANSITION,
});

export default {
  getPageVariants,
  pageMotionProps,
};
