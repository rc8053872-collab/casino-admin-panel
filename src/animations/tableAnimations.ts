import { animateTableRows } from './gsapUtils';

export const staggerTable = (
  tbodyElement: HTMLTableSectionElement | null,
  reducedMotion: boolean = false
) => {
  return animateTableRows(tbodyElement, reducedMotion);
};

export default {
  staggerTable,
};
