import React, { useState } from 'react';
import { Calculator, Percent, Award, Info, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface KoperasiSHUCalculatorProps {
  userSavings: number;
  totalSavingsPool: number;
}

export function KoperasiSHUCalculator({ userSavings, totalSavingsPool }: KoperasiSHUCalculatorProps) {
  const { showToast } = useToast();
  const [totalProfit, setTotalProfit] = useState<string>('10000000');
  const [jasaModalPercent, setJasaModalPercent] = useState<number>(40);
  const [jasaAnggotaPercent, setJasaAnggotaPercent] = useState<number>(60);

  const profitNum = parseFloat(totalProfit) || 0;
  const userShareOfCapital = totalSavingsPool > 0 ? (userSavings / totalSavingsPool) : 0;
  
  // SHU Calculations
  const shuJasaModalPool = profitNum * (jasaModalPercent / 100);
  const userShuModal = shuJasaModalPool * userShareOfCapital;

  // Assuming symmetric active transaction participation or base calculation
  const shuJasaAnggotaPool = profitNum * (jasaAnggotaPercent / 100);
  const userShuAnggota = shuJasaAnggotaPool * (userShareOfCapital > 0 ? userShareOfCapital : 0);

  const totalUserEstimatedSHU = userShuModal + userShuAnggota;

  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Calculator size={16} />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Kalkulator & Estimasi SHU Tahunan
          </h3>
          <p className="text-[10px] text-slate-500">Transparansi Perhitungan Sisa Hasil Usaha</p>
        </div>
      </div>

      <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-start gap-2">
        <Info size={16} className="shrink-0 mt-0.5 text-amber-600" />
        <p>
          SHU dibagikan secara adil berdasarkan proporsi <strong>Simpanan Anggota (Jasa Modal)</strong> dan <strong>Keaktifan Transaksi (Jasa Usaha)</strong>.
        </p>
      </div>

      {/* Simulator Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">
            Estimasi Laba Bersih Koperasi (Rp)
          </label>
          <input
            type="number"
            value={totalProfit}
            onChange={(e) => setTotalProfit(e.target.value)}
            placeholder="10000000"
            className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-black tabular-nums"
          />
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Proporsi Simpanan Anda</span>
          <p className="text-sm font-black text-slate-800 dark:text-slate-200">
            {(userShareOfCapital * 100).toFixed(2)}% dari total kas
          </p>
        </div>
      </div>

      {/* Result Cards */}
      <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-xl shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-300" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-100">
              Estimasi SHU Diterima Anggota
            </span>
          </div>
          <span className="px-2 py-0.5 bg-white/20 rounded text-[9px] font-bold">Simulasi Tutup Buku</span>
        </div>

        <div className="text-xl sm:text-2xl font-black tabular-nums">
          Rp {Math.round(totalUserEstimatedSHU).toLocaleString('id-ID')}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/20 text-[10px]">
          <div>
            <span className="text-emerald-100 block">Jasa Modal ({(jasaModalPercent)}%):</span>
            <span className="font-bold">Rp {Math.round(userShuModal).toLocaleString('id-ID')}</span>
          </div>
          <div>
            <span className="text-emerald-100 block">Jasa Usaha ({(jasaAnggotaPercent)}%):</span>
            <span className="font-bold">Rp {Math.round(userShuAnggota).toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
