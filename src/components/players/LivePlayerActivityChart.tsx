import React, { useRef, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import gsap from 'gsap';
import { Activity } from 'lucide-react';

interface ActivityPoint {
  time: string;
  players: number;
  inMatch: number;
  lobby: number;
}

interface LivePlayerActivityChartProps {
  data: ActivityPoint[];
  currentCount: number;
}

export const LivePlayerActivityChart: React.FC<LivePlayerActivityChartProps> = ({
  data,
  currentCount,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.15 }
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Live Player Activity</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Connected players over the last 30 minutes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-blue-600" />
            <span className="text-slate-500 text-[11px]">Total Connected ({currentCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
            <span className="text-slate-500 text-[11px]">In Matches</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-32 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="activePlayersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="inMatchGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
            />
            <YAxis
              domain={[0, 6]}
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94A3B8' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as ActivityPoint;
                  return (
                    <div className="bg-slate-900 text-white rounded-lg shadow-lg px-2.5 py-1.5 text-[11px] space-y-0.5 border border-slate-800">
                      <div className="text-slate-400 font-mono text-[10px]">{item.time} ago</div>
                      <div className="font-bold text-white">
                        {item.players} Total Players
                      </div>
                      <div className="text-indigo-300 text-[10px]">
                        {item.inMatch} In Match • {item.lobby} Lobby
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="players"
              stroke="#2563EB"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#activePlayersGradient)"
              isAnimationActive={true}
              animationDuration={800}
            />
            <Area
              type="monotone"
              dataKey="inMatch"
              stroke="#818CF8"
              strokeWidth={1.5}
              strokeDasharray="3 3"
              fillOpacity={1}
              fill="url(#inMatchGradient)"
              isAnimationActive={true}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LivePlayerActivityChart;
