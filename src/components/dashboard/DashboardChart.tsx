import React from 'react';
import { TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Line } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getMemberLabel } from '../../lib/terminology';

interface DashboardChartProps {
  chartData: any[];
}

export function DashboardChart({ chartData }: DashboardChartProps) {
  const { tenant } = useAuth();
  const memberLabel = getMemberLabel(tenant?.type);

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
          <TrendingUp size={12} />
        </div>
        <h2 className="text-[10px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Tren Perkembangan {memberLabel}
        </h2>
      </div>
      <div className="h-36 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorSos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Area yAxisId="left" type="monotone" dataKey="growth" name={memberLabel} stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorGrowth)" />
            <Area yAxisId="left" type="monotone" dataKey="sos" name="SOS" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
