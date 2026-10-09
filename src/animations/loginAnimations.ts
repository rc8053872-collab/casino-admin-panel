import gsap from 'gsap';

export interface LoginAnimationOptions {
  reducedMotion?: boolean;
}

/**
 * Initializes extremely subtle background ambient motion and mouse-following ambient light
 */
export function initLoginBackground(
  container: HTMLElement | null,
  options: LoginAnimationOptions = {}
): { ctx: gsap.Context; handlePointerMove?: (e: MouseEvent) => void } | null {
  if (!container || options.reducedMotion) return null;

  let handlePointerMove: ((e: MouseEvent) => void) | undefined;

  const ctx = gsap.context(() => {
    // 1. Slow, subtle breathing pulse on technical coordinate lines & grid
    gsap.to('.bg-tech-line', {
      opacity: 0.08,
      duration: 6,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 1.2,
    });

    gsap.to('.bg-ambient-node', {
      scale: 1.15,
      opacity: 0.07,
      duration: 8,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
      stagger: 1.8,
    });

    // 2. Subtle mouse-following radial light smoothing with quickTo
    const glowTarget = container.querySelector<HTMLElement>('.bg-mouse-glow');
    if (glowTarget) {
      const setX = gsap.quickTo(glowTarget, 'x', { duration: 0.8, ease: 'power2.out' });
      const setY = gsap.quickTo(glowTarget, 'y', { duration: 0.8, ease: 'power2.out' });

      handlePointerMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        const relX = e.clientX - rect.left;
        const relY = e.clientY - rect.top;
        setX(relX);
        setY(relY);
      };
    }
  }, container);

  return { ctx, handlePointerMove };
}

/**
 * Draws SVG network connection lines and animates lightweight traveling particles
 */
export function animateSystemConnections(
  svgContainer: SVGElement | null,
  options: LoginAnimationOptions = {}
): gsap.Context | null {
  if (!svgContainer || options.reducedMotion) return null;

  return gsap.context(() => {
    // 1. Initial draw animation for lines (strokeDashoffset)
    const lines = svgContainer.querySelectorAll<SVGPathElement>('.system-link-path');
    lines.forEach((path) => {
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 0.95,
        delay: 0.65,
        ease: 'power2.out',
      });
    });

    // 2. Staggered connection particles traveling along lines
    // We animate circles along predetermined connection segments
    const particles = svgContainer.querySelectorAll<SVGCircleElement>('.system-particle');
    particles.forEach((particle, index) => {
      const startX = parseFloat(particle.getAttribute('data-sx') || '0');
      const startY = parseFloat(particle.getAttribute('data-sy') || '0');
      const endX = parseFloat(particle.getAttribute('data-ex') || '0');
      const endY = parseFloat(particle.getAttribute('data-ey') || '0');

      gsap.set(particle, { cx: startX, cy: startY, opacity: 0 });

      // Loop animation
      const duration = 2.4 + (index % 3) * 0.5;
      const delay = 0.8 + index * 0.35;

      const tl = gsap.timeline({
        repeat: -1,
        delay,
        repeatDelay: 0.8 + (index % 2) * 0.5,
      });

      tl.to(particle, {
        opacity: 0.85,
        duration: 0.3,
        ease: 'power1.in',
      })
        .to(
          particle,
          {
            cx: endX,
            cy: endY,
            duration: duration - 0.5,
            ease: 'power1.inOut',
          },
          '<'
        )
        .to(particle, {
          opacity: 0,
          duration: 0.25,
          ease: 'power1.out',
        });
    });
  }, svgContainer);
}

/**
 * Animates central GAME PLATFORM node with subtle operational pulse
 */
export function animateSystemNode(
  nodeElement: HTMLElement | SVGElement | null,
  options: LoginAnimationOptions = {}
): gsap.Context | null {
  if (!nodeElement || options.reducedMotion) return null;

  return gsap.context(() => {
    // Subtle node pulse (scale 1 -> 1.03 -> 1, opacity 0.8 -> 1 -> 0.8)
    gsap.to(nodeElement, {
      scale: 1.03,
      opacity: 1,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // Radar beacon pulse ring
    const beacon = nodeElement.querySelector('.node-pulse-ring');
    if (beacon) {
      gsap.to(beacon, {
        scale: 1.35,
        opacity: 0,
        duration: 2.4,
        repeat: -1,
        ease: 'power1.out',
      });
    }
  }, nodeElement);
}

/**
 * Animates floating metric cards subtle entry
 */
export function animateLiveMetrics(
  targets: HTMLElement[] | null,
  options: LoginAnimationOptions = {}
): gsap.Context | null {
  if (!targets || !targets.length || options.reducedMotion) return null;

  return gsap.context(() => {
    gsap.fromTo(
      targets,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.12,
        ease: 'power2.out',
        delay: 0.7,
      }
    );
  });
}

/**
 * Subtle success state transition
 */
export function animateLoginSuccess(
  target: HTMLElement | null,
  onComplete?: () => void
): gsap.core.Tween | null {
  if (!target) {
    onComplete?.();
    return null;
  }

  return gsap.to(target, {
    opacity: 0.96,
    scale: 0.995,
    duration: 0.35,
    ease: 'power2.inOut',
    onComplete,
  });
}

/**
 * Cleanup helper for GSAP context
 */
export function cleanupLoginAnimations(ctx: gsap.Context | null): void {
  if (ctx) {
    ctx.revert();
  }
}
