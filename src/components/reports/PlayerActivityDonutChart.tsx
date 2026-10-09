import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { ActivityDistributionItem } from '../../types/playerReport';

interface PlayerActivityDonutChartProps {
  distribution: ActivityDistributionItem[];
  isLoading?: boolean;
  onSelectSegment?: (segmentKey: string) => void;
}

export const PlayerActivityDonutChart: React.FC<PlayerActivityDonutChartProps> = ({
  distribution,
  isLoading = false,
  onSelectSegment,
}) => {
  const navigate = useNavigate();

  const handleSliceClick = (item: ActivityDistributionItem) => {
    if (onSelectSegment) {
      onSelectSegment(item.segmentKey);
    } else {
      navigate(`/admin/players?segment=${item.segmentKey}`);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs h-72 flex items-center justify-center animate-pulse">
        <div className="w-36 h-36 rounded-full border-4 border-slate-100" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Player Activity Distribution
          </h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            Interactive
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Proportions categorized by play frequency and table engagement. Click any slice to filter.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        {/* Donut Canvas */}
        <div className="sm:col-span-6 h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0].payload as ActivityDistributionItem;
                  return (
                    <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-lg text-xs space-y-0.5">
                      <div className="font-bold text-slate-800">{data.name}</div>
                      <div className="font-mono text-blue-600 font-bold">
                        {data.percentage}% ({data.playerCount} players)
                      </div>
                      <div className="text-[10px] text-slate-400">Click to filter player registry</div>
                    </div>
                  );
                }}
              />
              <Pie
                data={distribution}
                cx="50%"
                cy="50%"
                innerRadius={46}
                outerRadius={68}
                paddingAngle={3}
                dataKey="percentage"
                cursor="pointer"
                onClick={(_evt, idx) => handleSliceClick((distribution || [])[idx])}
              >
                {(distribution || []).map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="sm:col-span-6 space-y-2">
          {(distribution || []).map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => handleSliceClick(item)}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group border border-transparent hover:border-slate-200/60"
            >
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-slate-900">
                {item.percentage}%
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlayerActivityDonutChart;
