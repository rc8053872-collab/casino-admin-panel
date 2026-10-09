import { useEffect, useRef } from 'react';
import { revealElements, type GsapRevealOptions } from '../animations/gsapUtils';
import { useReducedMotion } from './useReducedMotion';

export function useGsapReveal<T extends HTMLElement>(
  options: GsapRevealOptions = {},
  deps: React.DependencyList = []
) {
  const elementRef = useRef<T | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!elementRef.current) return;

    const tween = revealElements(elementRef.current, options, reducedMotion);

    return () => {
      if (tween) tween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, ...deps]);

  return elementRef;
}

export default useGsapReveal;
