import React, { useState } from 'react';
import { Calculator, Info, TrendingUp } from 'lucide-react';

interface SHUCalculatorProps {
  userSavings: number;
  totalSavingsPool: number;
}

export function SHUCalculator({ userSavings, totalSavingsPool }: SHUCalculatorProps) {
  const [totalSHU, setTotalSHU] = useState('5000000');
  const [percentageSavings, setPercentageSavings] = useState('25');

  const calcAmount = () => {
    const shu = parseFloat(totalSHU) || 0;
    const pct = (parseFloat(percentageSavings) || 0) / 100;
    const userShare = totalSavingsPool > 0 ? (userSavings / totalSavingsPool) : 0;
    return Math.round(shu * pct * userShare);
  };

  return (
    <div className="card-3d p-4 bg-white/60 border-white/80 shadow-3d-sm space-y-5">
      <div className="flex flex-col">
        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Proyeksi SHU</h3>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-70">Estimasi Sisa Hasil Usaha Anda</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Total SHU Komunitas (Rp)</label>
          <input
            type="number"
            value={totalSHU}
            onChange={(e) => setTotalSHU(e.target.value)}
            className="w-full h-11 px-4 bg-white/50 border border-slate-200 rounded-2xl text-[12px] font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Alokasi Jasa Simpanan (%)</label>
          <input
            type="number"
            value={percentageSavings}
            onChange={(e) => setPercentageSavings(e.target.value)}
            className="w-full h-11 px-4 bg-white/50 border border-slate-200 rounded-2xl text-[12px] font-black outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="p-4 bg-blue-600 rounded-2xl shadow-3d-sm text-white space-y-3">
          <div className="flex items-center justify-between opacity-80">
            <span className="text-[9px] font-black uppercase tracking-widest">Estimasi Penerimaan</span>
            <Calculator size={14} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tabular-nums tracking-tighter">Rp {calcAmount().toLocaleString()}</span>
            <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">IDR</span>
          </div>
          <div className="pt-2 border-t border-white/20 flex items-center gap-2">
            <TrendingUp size={10} />
            <span className="text-[8px] font-bold uppercase tracking-widest leading-none">Berdasarkan proporsi simpanan aktif Anda.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
