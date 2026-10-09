import { cardHoverVariants } from './variants';
import { CARD_HOVER_TRANSITION, INSTANT_TRANSITION } from './transitions';

export const getCardHoverProps = (reducedMotion: boolean) => {
  if (reducedMotion) {
    return {
      variants: cardHoverVariants,
      initial: 'rest',
      transition: INSTANT_TRANSITION,
    };
  }

  return {
    variants: cardHoverVariants,
    initial: 'rest',
    whileHover: 'hover',
    transition: CARD_HOVER_TRANSITION,
  };
};

export default {
  getCardHoverProps,
};
