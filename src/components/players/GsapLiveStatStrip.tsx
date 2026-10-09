import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { Users, Swords, Coffee, Clock, Wallet, Radio } from 'lucide-react';
import AnimatedNumber from '../ui/AnimatedNumber';

interface GsapLiveStatStripProps {
  activeNow: number;
  inMatch: number;
  lobbyOnline: number;
  avgSession: string;
  totalBalance: number;
  lastUpdateText: string;
}

function GsapStatItem({
  label,
  value,
  isCurrency = false,
  customText,
  icon: Icon,
  highlight = false,
}: {
  label: string;
  value?: number;
  isCurrency?: boolean;
  customText?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-3 shadow-xs transition-all hover:shadow-sm flex items-center justify-between min-w-[130px] flex-1 ${
        highlight
          ? 'border-blue-300 ring-1 ring-blue-500/10'
          : 'border-slate-200'
      }`}
    >
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </div>
        <div
          className={`text-lg font-bold mt-0.5 tabular-nums ${
            highlight ? 'text-blue-600' : 'text-slate-900'
          }`}
        >
          {customText ? (
            customText
          ) : value !== undefined ? (
            <AnimatedNumber
              value={value}
              format={isCurrency ? 'currency' : 'number'}
            />
          ) : (
            '—'
          )}
        </div>
      </div>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
          highlight ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

export const GsapLiveStatStrip: React.FC<GsapLiveStatStripProps> = ({
  activeNow,
  inMatch,
  lobbyOnline,
  avgSession,
  totalBalance,
  lastUpdateText,
}) => {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stripRef.current) {
      gsap.fromTo(
        stripRef.current.children,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.05,
          ease: 'power2.out',
        }
      );
    }
  }, []);

  return (
    <div
      ref={stripRef}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
    >
      <GsapStatItem
        label="ACTIVE NOW"
        value={activeNow}
        icon={Users}
        highlight={true}
      />
      <GsapStatItem
        label="IN MATCH"
        value={inMatch}
        icon={Swords}
      />
      <GsapStatItem
        label="LOBBY / ONLINE"
        value={lobbyOnline}
        icon={Coffee}
      />
      <GsapStatItem
        label="AVG SESSION"
        customText={avgSession}
        icon={Clock}
      />
      <GsapStatItem
        label="TOTAL BALANCE"
        value={totalBalance}
        isCurrency={true}
        icon={Wallet}
      />
      <GsapStatItem
        label="LAST UPDATE"
        customText={lastUpdateText}
        icon={Radio}
      />
    </div>
  );
};

export default GsapLiveStatStrip;
