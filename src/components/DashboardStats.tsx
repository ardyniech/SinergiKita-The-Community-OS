import React from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { StatCard } from './molecules/StatCard';
import { DashboardChart } from './dashboard/DashboardChart';
import { Wallet, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface DashboardStatsProps {
  onNavigate: (view: any) => void;
}

export default function DashboardStats({ onNavigate }: DashboardStatsProps) {
  const { balance, loading, kpis, chartData, enabledModules, memberLabel } = useDashboardStats();

  if (loading) {
    return <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-100 mb-2.5 animate-pulse h-48" />;
  }

  return (
    <div className="mb-2.5 space-y-2">
      {enabledModules.includes('finance') && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-3 rounded-xl text-white shadow-md shadow-slate-900/5 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl" />
          
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center border border-blue-400/30">
                <Wallet size={14} />
              </div>
              <span className="text-[10px] font-bold text-slate-300 tracking-wide">Kas Gotong Royong {memberLabel}</span>
            </div>
            <span className="text-[8px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck size={9} /> Transparan
            </span>
          </div>

          <div className="flex items-baseline justify-between gap-2 relative z-10">
            <div>
              <p className="text-xl font-black text-white tracking-tight tabular-nums">
                Rp {balance.toLocaleString('id-ID')}
              </p>
              <p className="text-[9px] text-slate-400 font-medium mt-0.5">Saldo aktif kas lingkungan terverifikasi</p>
            </div>

            <button
              onClick={() => onNavigate('finance')}
              className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border border-white/10 shrink-0 cursor-pointer active:scale-95"
            >
              <span>Laporan</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} onClick={onNavigate} />)}
      </div>

      <DashboardChart chartData={chartData} />
    </div>
  );
}
