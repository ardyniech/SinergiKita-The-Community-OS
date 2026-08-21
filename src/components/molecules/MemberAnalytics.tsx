// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { AppUser } from '../../types';
import { LayoutGrid, TrendingUp, Award } from 'lucide-react';

interface MemberAnalyticsProps {
  members: AppUser[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const MemberAnalytics: React.FC<MemberAnalyticsProps> = ({ members }) => {
  const skillData = useMemo(() => {
    const counts: Record<string, number> = {};
    members.forEach(m => {
      m.skills?.forEach(skill => {
        counts[skill] = (counts[skill] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [members]);

  const contributorData = useMemo(() => {
    return members
      .map(m => ({
        name: m.displayName || m.email.split('@')[0],
        points: m.points || 0
      }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 5);
  }, [members]);

  return (
    <div className="space-y-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Skill Distribution */}
        <div className="liquid-glass p-5 rounded-[32px] border-white/60 shadow-3d-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-blue-400">
              <LayoutGrid size={20} />
            </div>
            <div>
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Registry Skills</h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Competency Distribution</p>
            </div>
          </div>
          
          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(203, 213, 225, 0.3)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b', textAnchor: 'start' }}
                  width={80}
                  dx={10}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.6)', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={14}>
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="liquid-glass p-5 rounded-[32px] border-white/60 shadow-3d-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-amber-400">
              <Award size={20} />
            </div>
            <div>
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Elite Leaders</h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Contribution Ranking</p>
            </div>
          </div>

          <div className="h-[220px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(203, 213, 225, 0.3)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: '1px solid rgba(255,255,255,0.6)', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', 
                    fontSize: '10px',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(8px)'
                  }}
                />
                <Bar dataKey="points" fill="#f59e0b" radius={[12, 12, 0, 0]} barSize={28}>
                  {contributorData.map((entry, index) => (
                    <Cell key={`cell-contributor-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="relative group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[32px] shadow-3d-lg" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
        
        <div className="relative p-5 text-white flex items-center justify-between z-10">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-3d-sm">
              <TrendingUp size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Aggregate Community Points</p>
              <h4 className="text-3xl font-black tracking-tighter">{members.reduce((acc, curr) => acc + (curr.points || 0), 0).toLocaleString()}</h4>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Cataloged Capacities</p>
            <h4 className="text-2xl font-black tracking-tighter">{Object.keys(skillData).length} Distinct Modules</h4>
          </div>
        </div>
      </div>
    </div>
  );
};
