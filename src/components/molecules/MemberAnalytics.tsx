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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Skill Distribution */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">Keahlian Warga</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Skill Distribution</p>
            </div>
          </div>
          
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical" margin={{ left: -20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#6b7280' }}
                  width={80}
                />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={12}>
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">Top Kontributor</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Points Leaderboard</p>
            </div>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contributorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#6b7280' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#6b7280' }} />
                <Tooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                />
                <Bar dataKey="points" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stat */}
      <div className="bg-blue-600 rounded-[32px] p-5 text-white flex items-center justify-between shadow-lg shadow-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Community Points</p>
            <h4 className="text-2xl font-black">{members.reduce((acc, curr) => acc + (curr.points || 0), 0).toLocaleString()}</h4>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Active Skills</p>
          <h4 className="text-xl font-black">{Object.keys(skillData).length} Types</h4>
        </div>
      </div>
    </div>
  );
};
