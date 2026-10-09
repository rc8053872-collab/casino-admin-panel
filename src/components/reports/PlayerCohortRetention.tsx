import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Info } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { RetentionCohortItem } from '../../types/playerReport';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface PlayerCohortRetentionProps {
  cohorts: RetentionCohortItem[];
  isLoading?: boolean;
}

export const PlayerCohortRetention: React.FC<PlayerCohortRetentionProps> = ({
  cohorts,
  isLoading = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = useReducedMotion();
  const [hoveredCohort, setHoveredCohort] = useState<RetentionCohortItem | null>(null);

  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      (cohorts || []).forEach((c, idx) => {
        const bar = containerRef.current?.querySelector(`.cohort-bar-${idx}`);
        if (bar) {
          gsap.fromTo(
            bar,
            { width: '0%' },
            {
              width: `${c?.rate ?? 0}%`,
              duration: 1.1,
              delay: 0.1 * idx,
              ease: 'power2.out',
            }
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [cohorts, reducedMotion]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse">
        <div className="h-4 w-40 bg-slate-100 rounded-md" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Player Cohort Retention
          </h3>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
            30-Day Curve
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Progressive drop-off benchmarks across post-signup milestone periods.
        </p>
      </div>

      {/* Cohort Rows */}
      <div className="space-y-3.5">
        {(cohorts || []).map((c, idx) => {
          const isHovered = hoveredCohort?.cohort === c.cohort;
          return (
            <div
              key={c.cohort}
              onMouseEnter={() => setHoveredCohort(c)}
              onMouseLeave={() => setHoveredCohort(null)}
              className="relative p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200/80 cursor-default"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1.5">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{c.cohort}</span>
                </span>
                <span className="tabular-nums">
                  <span className="text-blue-600 font-bold font-mono">
                    <AnimatedNumber value={c.rate} decimals={1} suffix="%" />
                  </span>
                  <span className="text-slate-400 font-normal ml-1.5 font-mono">
                    (<AnimatedNumber value={c.playerCount} /> players)
                  </span>
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                <div
                  className={`cohort-bar-${idx} h-full rounded-full transition-colors ${
                    idx === 0
                      ? 'bg-blue-600'
                      : idx === 1
                      ? 'bg-emerald-500'
                      : idx === 2
                      ? 'bg-amber-500'
                      : 'bg-purple-600'
                  }`}
                  style={{ width: reducedMotion ? `${c.rate}%` : '0%' }}
                />
              </div>

              {/* Hover Tooltip Popup */}
              {isHovered && (
                <div className="absolute left-1/2 -top-16 -translate-x-1/2 z-20 bg-slate-900 text-white rounded-xl p-2.5 shadow-xl text-[11px] whitespace-nowrap space-y-1 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <div className="font-bold border-b border-slate-700 pb-1 flex items-center justify-between gap-3">
                    <span>{c.cohort} Breakdown</span>
                    <span className="text-emerald-400 font-mono">{c.rate}% Retention</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-[10px] text-slate-300 pt-0.5">
                    <div>
                      Cohort: <span className="font-bold text-white font-mono">{c.cohortSize}</span>
                    </div>
                    <div>
                      Returned: <span className="font-bold text-emerald-400 font-mono">{c.returnedPlayers}</span>
                    </div>
                    <div>
                      Drop-off: <span className="font-bold text-rose-400 font-mono">{c.dropOff}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cohort Insight Hint */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>Industry card room benchmark: 22.5%</span>
        </span>
        <span className="text-emerald-600 font-bold font-mono">+1.6% Outperforming</span>
      </div>
    </div>
  );
};

export default PlayerCohortRetention;
