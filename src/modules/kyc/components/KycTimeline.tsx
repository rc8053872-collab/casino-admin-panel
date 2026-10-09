import React from 'react';
import {
  FileText,
  CreditCard,
  UserCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import type { KycHistoryEvent } from '../types/kyc.types';

interface KycTimelineProps {
  events: KycHistoryEvent[];
}

export const KycTimeline: React.FC<KycTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
        No verification history recorded yet.
      </div>
    );
  }

  const getEventIcon = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('approved') || act.includes('verified')) {
      return { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (act.includes('rejected') || act.includes('declined')) {
      return { icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' };
    }
    if (act.includes('information') || act.includes('request')) {
      return { icon: HelpCircle, color: 'text-purple-600 bg-purple-50 border-purple-200' };
    }
    if (act.includes('pan')) {
      return { icon: CreditCard, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
    if (act.includes('identity')) {
      return { icon: UserCheck, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
    }
    if (act.includes('risk')) {
      return { icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (act.includes('submitted')) {
      return { icon: FileText, color: 'text-slate-600 bg-slate-100 border-slate-200' };
    }
    return { icon: Clock, color: 'text-slate-600 bg-slate-100 border-slate-200' };
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((event) => {
        const { icon: IconComp, color } = getEventIcon(event.action);

        return (
          <div key={event.id} className="relative group">
            {/* Timeline bullet icon */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 shadow-2xs ${color}`}
            >
              <IconComp className="w-2.5 h-2.5" />
            </div>

            <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-xs font-bold text-slate-900 tracking-tight">
                  {event.action}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {event.timestamp}
                </span>
              </div>

              {event.details && (
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {event.details}
                </p>
              )}

              <div className="pt-1 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                <span className="text-slate-400">Actor:</span>
                <span className="font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {event.actor}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KycTimeline;
