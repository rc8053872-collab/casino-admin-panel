import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useReducedMotion } from './useReducedMotion';

interface ParsedNumber {
  prefix: string;
  target: number;
  suffix: string;
  decimals: number;
  useIndianComma: boolean;
}

/**
 * Parses strings like "12,840", "₹8.42L", "₹5.18L", "386", "24"
 */
function parseFormattedValue(raw: string | number): ParsedNumber {
  if (typeof raw === 'number') {
    return {
      prefix: '',
      target: raw,
      suffix: '',
      decimals: Number.isInteger(raw) ? 0 : 2,
      useIndianComma: true,
    };
  }

  const str = String(raw).trim();
  const match = str.match(/^([^0-9.-]*)([-+]?[0-9,]*\.?[0-9]+)(.*)$/);

  if (!match) {
    return {
      prefix: '',
      target: 0,
      suffix: str,
      decimals: 0,
      useIndianComma: false,
    };
  }

  const prefix = match[1] || '';
  const numStr = match[2].replace(/,/g, '');
  const suffix = match[3] || '';

  const target = parseFloat(numStr) || 0;
  const decimalPart = numStr.split('.')[1];
  const decimals = decimalPart ? decimalPart.length : 0;
  const useIndianComma = prefix.includes('₹') || match[2].includes(',');

  return { prefix, target, suffix, decimals, useIndianComma };
}

function formatWithParts(val: number, meta: ParsedNumber): string {
  const rounded = meta.decimals > 0 ? val.toFixed(meta.decimals) : Math.round(val).toString();

  let formattedNum = rounded;
  if (meta.useIndianComma && meta.decimals === 0) {
    formattedNum = Math.round(val).toLocaleString('en-IN');
  }

  return `${meta.prefix}${formattedNum}${meta.suffix}`;
}

export interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  ease?: string;
  enableLiveHighlight?: boolean;
}

export function useCountUp(
  rawValue: string | number,
  options: UseCountUpOptions = {}
) {
  const {
    duration = 1.0,
    delay = 0,
    ease = 'power2.out',
    enableLiveHighlight = true,
  } = options;

  const reducedMotion = useReducedMotion();
  const meta = parseFormattedValue(rawValue);

  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (reducedMotion) return String(rawValue);
    // Start at 0 for initial entrance
    return formatWithParts(0, meta);
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateDirection, setUpdateDirection] = useState<'up' | 'down' | null>(null);

  const prevTargetRef = useRef<number | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const isInitialMount = prevTargetRef.current === null;
    const startVal = isInitialMount ? 0 : (prevTargetRef.current ?? 0);
    const targetVal = meta.target;

    // Detect live update direction if meaningful change occurs
    if (!isInitialMount && startVal !== targetVal && enableLiveHighlight) {
      setIsUpdating(true);
      setUpdateDirection(targetVal > startVal ? 'up' : 'down');
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
      highlightTimerRef.current = setTimeout(() => {
        setIsUpdating(false);
        setUpdateDirection(null);
      }, 1200);
    }

    prevTargetRef.current = targetVal;

    if (reducedMotion) {
      setDisplayValue(String(rawValue));
      return;
    }

    if (tweenRef.current) tweenRef.current.kill();

    const proxy = { val: startVal };

    tweenRef.current = gsap.to(proxy, {
      val: targetVal,
      duration: isInitialMount ? duration : Math.min(duration, 0.65),
      delay: isInitialMount ? delay : 0,
      ease,
      onUpdate: () => {
        setDisplayValue(formatWithParts(proxy.val, meta));
      },
      onComplete: () => {
        setDisplayValue(String(rawValue));
      },
    });

    return () => {
      if (tweenRef.current) tweenRef.current.kill();
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue, reducedMotion]);

  return { displayValue, isUpdating, updateDirection };
}

export default useCountUp;
