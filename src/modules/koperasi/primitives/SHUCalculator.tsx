import React, { useState } from 'react';
import { Calculator, TrendingUp, Info, Share2, Check } from 'lucide-react';
import { calculateSHU } from '../logic/koperasiUtils';

interface SHUCalculatorProps {
  userSavings: number;
  totalSavingsPool: number;
}

export function SHUCalculator({ userSavings, totalSavingsPool }: SHUCalculatorProps) {
  const [totalSHU, setTotalSHU] = useState('5000000');
  const [savingAlloc, setSavingAlloc] = useState('40'); // 40% jasa simpanan, 60% jasa usaha
  const [copied, setCopied] = useState(false);

  const numSHU = Math.max(0, parseInt(totalSHU, 10) || 0);
  const numAlloc = Math.min(100, Math.max(0, parseInt(savingAlloc, 10) || 0));

  const result = calculateSHU({
    totalSHU: numSHU,
    userSavings,
    totalSavingsPool,
    savingAllocationPercent: numAlloc,
    loanAllocationPercent: 100 - numAlloc
  });

  const handleShare = () => {
    const text = `*SIMULASI SHU KOPERASI KITA*\nTotal SHU Komunitas: Rp ${numSHU.toLocaleString('id-ID')}\nAlokasi Jasa Simpanan: ${numAlloc}%\nSimpanan Saya: Rp ${userSavings.toLocaleString('id-ID')} (${result.savingSharePercent}%)\n*Estimasi SHU Diterima: Rp ${result.totalSHUUser.toLocaleString('id-ID')}*`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Kalkulator Proyeksi SHU</h3>
          <p className="text-[10px] text-slate-500">Estimasi pembagian Sisa Hasil Usaha akhir periode</p>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
        >
          {copied ? <Check size={12} className="text-emerald-600" /> : <Share2 size={12} />}
          <span>{copied ? 'Tersalin' : 'Bagikan'}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-bold text-slate-600">Total SHU Komunitas (Rp)</label>
          <input
            type="number"
            value={totalSHU}
            step="100000"
            onChange={(e) => setTotalSHU(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 mt-1"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-600">Alokasi Jasa Modal (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={savingAlloc}
            onChange={(e) => setSavingAlloc(e.target.value)}
            className="w-full h-9 px-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 mt-1"
          />
        </div>
      </div>

      <div className="p-3 bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl text-white space-y-2 shadow-xs">
        <div className="flex items-center justify-between text-indigo-200 text-[10px] font-semibold">
          <span>Estimasi Hak SHU Anda:</span>
          <span>Porsi Modal: {result.savingSharePercent}%</span>
        </div>

        <div className="text-xl font-black tracking-tight text-white">
          Rp {result.totalSHUUser.toLocaleString('id-ID')}
        </div>

        <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px] text-slate-300">
          <div>
            <span className="block text-slate-400">Jasa Simpanan:</span>
            <span className="font-bold text-white">Rp {result.jasaSimpanan.toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="block text-slate-400">Total Kas Modal:</span>
            <span className="font-bold text-white">Rp {totalSavingsPool.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
