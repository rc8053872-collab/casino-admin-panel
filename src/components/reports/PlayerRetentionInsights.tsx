import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface PlayerRetentionInsightsProps {
  insights: string[];
  isLoading?: boolean;
}

export const PlayerRetentionInsights: React.FC<PlayerRetentionInsightsProps> = ({
  insights,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 animate-pulse h-48">
        <div className="h-4 w-36 bg-slate-100 rounded-md" />
        <div className="space-y-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Retention Insights</h3>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
          Automated Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {(insights || []).map((item, idx) => (
          <div
            key={idx}
            className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2.5 text-xs text-slate-700"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerRetentionInsights;
