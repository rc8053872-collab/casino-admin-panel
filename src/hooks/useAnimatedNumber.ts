import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useReducedMotion';
import {
  parseRawNumericValue,
  formatNumberValue,
  type NumberFormatOptions,
} from '../utils/numberFormatter';

export interface UseAnimatedNumberOptions extends NumberFormatOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  onComplete?: () => void;
}

export function useAnimatedNumber(
  rawValue: number | string | null | undefined,
  options: UseAnimatedNumberOptions = {}
) {
  const {
    duration = 0.55,
    delay = 0,
    ease = 'power2.out',
    onComplete,
    ...formatOpts
  } = options;

  const reducedMotion = useReducedMotion();
  const targetNum = parseRawNumericValue(rawValue);

  // Initial state: if reducedMotion, show formatted target; otherwise show initial 0
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (reducedMotion) {
      return formatNumberValue(targetNum, formatOpts);
    }
    return formatNumberValue(0, formatOpts);
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const prevValueRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const isInitialMount = prevValueRef.current === null;
    const startValue = isInitialMount ? 0 : (prevValueRef.current ?? 0);

    // If reduced motion is preferred, immediately show final value
    if (reducedMotion) {
      prevValueRef.current = targetNum;
      setDisplayValue(formatNumberValue(targetNum, formatOpts));
      return;
    }

    // If value has not changed after initial mount, do not re-animate
    if (!isInitialMount && startValue === targetNum) {
      setDisplayValue(formatNumberValue(targetNum, formatOpts));
      return;
    }

    // Cancel any running GSAP tween before starting new one
    if (tweenRef.current) {
      tweenRef.current.kill();
    }

    setIsAnimating(true);

    const proxy = { value: startValue };
    const animDuration = isInitialMount
      ? Math.min(Math.max(duration, 0.4), 0.75)
      : Math.min(Math.max(duration * 0.8, 0.3), 0.6);

    tweenRef.current = gsap.to(proxy, {
      value: targetNum,
      duration: animDuration,
      delay: isInitialMount ? delay : 0,
      ease,
      onUpdate: () => {
        setDisplayValue(formatNumberValue(proxy.value, formatOpts));
      },
      onComplete: () => {
        setDisplayValue(formatNumberValue(targetNum, formatOpts));
        prevValueRef.current = targetNum;
        setIsAnimating(false);
        onComplete?.();
      },
    });

    return () => {
      if (tweenRef.current) {
        tweenRef.current.kill();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    targetNum,
    reducedMotion,
    formatOpts.format,
    formatOpts.decimals,
    formatOpts.prefix,
    formatOpts.suffix,
    formatOpts.compact,
    formatOpts.currency,
    formatOpts.separator,
  ]);

  return {
    displayValue,
    numericValue: targetNum,
    isAnimating,
  };
}

export default useAnimatedNumber;
