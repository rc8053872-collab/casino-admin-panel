import React from 'react';
import { Clock, Layers, Gamepad2, Users } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { EngagementOverview } from '../../types/playerReport';

interface PlayerEngagementSectionProps {
  engagement: EngagementOverview;
  isLoading?: boolean;
}

export const PlayerEngagementSection: React.FC<PlayerEngagementSectionProps> = ({
  engagement,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Player Engagement Overview
        </h3>
        <span className="text-[11px] text-slate-500 font-medium">Session & round metrics</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* 1. Average Session */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Average Session</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              {engagement.avgSessionDuration}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* 2. Sessions / Player */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Sessions / Player</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              <AnimatedNumber value={engagement.sessionsPerPlayer} decimals={1} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* 3. Games / Player */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Games / Player</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              <AnimatedNumber value={engagement.gamesPerPlayer} decimals={1} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Gamepad2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* 4. Peak Concurrent */}
        <div className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-slate-300 transition-colors flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Peak Concurrent</span>
            <div className="text-lg font-black text-slate-900 mt-0.5 font-mono">
              <AnimatedNumber value={engagement.peakConcurrent} />
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerEngagementSection;
