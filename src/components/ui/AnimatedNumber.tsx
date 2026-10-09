import React from 'react';
import { useAnimatedNumber, type UseAnimatedNumberOptions } from '../../hooks/useAnimatedNumber';
import type { NumberFormatType } from '../../utils/numberFormatter';

export interface AnimatedNumberProps extends UseAnimatedNumberOptions {
  value: number | string | null | undefined;
  format?: NumberFormatType;
  className?: string;
  label?: string;
  'aria-label'?: string;
}

/**
 * Global reusable AnimatedNumber component.
 * Uses GSAP for high-performance numeric interpolation and Indian currency/number formatting.
 *
 * Examples:
 *  <AnimatedNumber value={12840} /> -> "12,840"
 *  <AnimatedNumber value={842000} format="compactCurrency" /> -> "₹8.42L"
 *  <AnimatedNumber value={842000} format="currency" /> -> "₹8,42,000"
 *  <AnimatedNumber value={12.4} suffix="%" /> -> "12.4%"
 *  <AnimatedNumber value={8.2} prefix="+" suffix="%" /> -> "+8.2%"
 *  <AnimatedNumber value={2421} label="players" /> -> "2,421 players"
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = 'number',
  duration,
  delay,
  ease,
  decimals,
  separator,
  prefix,
  suffix,
  compact,
  currency,
  className = '',
  label,
  'aria-label': ariaLabel,
  onComplete,
}) => {
  const { displayValue } = useAnimatedNumber(value, {
    format,
    duration,
    delay,
    ease,
    decimals,
    separator,
    prefix,
    suffix,
    compact,
    currency,
    onComplete,
  });

  return (
    <span className={className} aria-label={ariaLabel || (label ? `${displayValue} ${label}` : displayValue)}>
      <span>{displayValue}</span>
      {label && <span className="ml-1 font-normal opacity-75">{label}</span>}
    </span>
  );
};

export default AnimatedNumber;
