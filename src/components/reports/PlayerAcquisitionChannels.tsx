import React from 'react';
import { TrendingUp, TrendingDown, Share2 } from 'lucide-react';
import { AnimatedNumber } from '../ui/AnimatedNumber';
import type { AcquisitionChannelItem } from '../../types/playerReport';

interface PlayerAcquisitionChannelsProps {
  channels: AcquisitionChannelItem[];
  isLoading?: boolean;
}

export const PlayerAcquisitionChannels: React.FC<PlayerAcquisitionChannelsProps> = ({
  channels,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse h-72">
        <div className="h-4 w-44 bg-slate-100 rounded-md" />
        <div className="space-y-4 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Player Acquisition Channels
          </h3>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Attribution
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          New account acquisition volume and growth delta categorized by channel.
        </p>
      </div>

      <div className="space-y-3">
        {(channels || []).map((ch, idx) => {
          const isUp = ch.trend >= 0;
          return (
            <div key={ch.channel} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>{ch.channel}</span>
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500">
                    <AnimatedNumber value={ch.players} /> players ({ch.percentage}%)
                  </span>
                  <span
                    className={`font-mono font-bold flex items-center text-[11px] ${
                      isUp ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                    <span>{isUp ? `+${ch.trend}%` : `${ch.trend}%`}</span>
                  </span>
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    idx === 0
                      ? 'bg-blue-600'
                      : idx === 1
                      ? 'bg-emerald-500'
                      : idx === 2
                      ? 'bg-purple-600'
                      : 'bg-slate-500'
                  }`}
                  style={{ width: `${ch.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Share2 className="w-3 h-3 text-emerald-600" />
          <span>Referral multiplier: 1.48x LTV</span>
        </span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
          Campaign Attribution Logs →
        </span>
      </div>
    </div>
  );
};

export default PlayerAcquisitionChannels;
