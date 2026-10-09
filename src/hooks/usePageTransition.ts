import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useReducedMotion } from './useReducedMotion';
import { pageVariants, pageVariantsReduced } from '../animations/variants';
import { PAGE_TRANSITION, INSTANT_TRANSITION } from '../animations/transitions';

export function usePageTransition() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Smoothly scroll to top on page change
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'instant' });
  }, [location.pathname, reducedMotion]);

  const variants = reducedMotion ? pageVariantsReduced : pageVariants;
  const transition = reducedMotion ? INSTANT_TRANSITION : PAGE_TRANSITION;

  return {
    pageMotionProps: {
      variants,
      initial: 'initial',
      animate: 'animate',
      exit: 'exit',
      transition,
    },
    reducedMotion,
    pathname: location.pathname,
  };
}

export default usePageTransition;
