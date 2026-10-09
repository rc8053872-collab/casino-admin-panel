import gsap from 'gsap';

export interface GsapRevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  ease?: string;
  onComplete?: () => void;
}

/**
 * Standard GSAP staggered or single reveal
 */
export function revealElements(
  targets: gsap.DOMTarget,
  options: GsapRevealOptions = {},
  reducedMotion: boolean = false
): gsap.core.Tween | null {
  if (reducedMotion) {
    gsap.set(targets, { opacity: 1, y: 0, x: 0 });
    options.onComplete?.();
    return null;
  }

  const {
    y = 12,
    x = 0,
    opacity = 0,
    duration = 0.4,
    stagger = 0.05,
    delay = 0,
    ease = 'power2.out',
    onComplete,
  } = options;

  return gsap.fromTo(
    targets,
    { opacity, y, x },
    {
      opacity: 1,
      y: 0,
      x: 0,
      duration,
      stagger,
      delay,
      ease,
      clearProps: 'transform',
      onComplete,
    }
  );
}

/**
 * Coordinated Dashboard entrance timeline
 */
export function createDashboardTimeline(
  container: HTMLElement | null,
  reducedMotion: boolean = false
): gsap.core.Timeline | null {
  if (!container) return null;

  if (reducedMotion) {
    gsap.set(
      container.querySelectorAll(
        '.dashboard-header, .kpi-card, .chart-card, .data-card, .platform-card'
      ),
      { opacity: 1, y: 0 }
    );
    return null;
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power2.out', duration: 0.35 },
  });

  const header = container.querySelector('.dashboard-header');
  const kpiCards = container.querySelectorAll('.kpi-card');
  const charts = container.querySelectorAll('.chart-card');
  const tables = container.querySelectorAll('.data-card');
  const platform = container.querySelector('.platform-card');

  if (header) {
    tl.fromTo(header, { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.0);
  }

  if (kpiCards.length > 0) {
    tl.fromTo(
      kpiCards,
      { opacity: 0, y: 14, scale: 0.985 },
      { opacity: 1, y: 0, scale: 1, stagger: 0.055, duration: 0.4, clearProps: 'transform' },
      0.08
    );
  }

  if (charts.length > 0) {
    tl.fromTo(
      charts,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.45, clearProps: 'transform' },
      0.24
    );
  }

  if (tables.length > 0) {
    tl.fromTo(
      tables,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.4, clearProps: 'transform' },
      0.38
    );
  }

  if (platform) {
    tl.fromTo(platform, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, clearProps: 'transform' }, 0.5);
  }

  return tl;
}

/**
 * Staggered table rows reveal for data grids
 */
export function animateTableRows(
  tbody: HTMLTableSectionElement | null,
  reducedMotion: boolean = false
): gsap.core.Tween | null {
  if (!tbody) return null;

  const rows = tbody.querySelectorAll('tr');
  if (rows.length === 0) return null;

  if (reducedMotion) {
    gsap.set(rows, { opacity: 1, y: 0 });
    return null;
  }

  // Animate first 12 rows max for ultra-high performance
  const targetRows = Array.from(rows).slice(0, 12);

  return gsap.fromTo(
    targetRows,
    { opacity: 0, y: 6 },
    {
      opacity: 1,
      y: 0,
      stagger: 0.025,
      duration: 0.28,
      ease: 'power2.out',
      clearProps: 'transform',
    }
  );
}

export default {
  revealElements,
  createDashboardTimeline,
  animateTableRows,
};
