import React from 'react';
import { RefreshCw } from 'lucide-react';

interface LedgerReconcileTabProps {
  systemBalance: number;
  physicalBalance: string;
  setPhysicalBalance: (val: string) => void;
  handleReconcile: () => void;
}

export function LedgerReconcileTab({
  systemBalance,
  physicalBalance,
  setPhysicalBalance,
  handleReconcile
}: LedgerReconcileTabProps) {
  const physicalVal = Number(physicalBalance);
  const diff = physicalBalance !== '' && !isNaN(physicalVal) ? physicalVal - systemBalance : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-3d-sm">
          <RefreshCw size={20} />
        </div>
        <div>
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Fiscal Reconciliation</h2>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Synchronize digital ledger with physical capital reserves.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="liquid-glass p-5 rounded-[32px] border-white/60 shadow-3d-lg bg-indigo-50/30">
          <p className="text-[9px] uppercase font-black text-indigo-500 tracking-[0.2em] mb-4">System Recorded Assets</p>
          <p className="text-3xl font-black text-slate-900 tracking-tighter">Rp {systemBalance.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
            <p className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest">Aggregate database state</p>
          </div>
        </div>

        <div className={`liquid-glass p-5 rounded-[32px] border-white/60 shadow-3d-lg ${diff !== null ? (diff === 0 ? 'bg-emerald-50/30' : 'bg-rose-50/30') : 'bg-slate-50/30'}`}>
          <p className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em] mb-4">Reconciliation Variance</p>
          {diff !== null ? (
            <>
              <p className={`text-3xl font-black tracking-tighter ${diff === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {diff > 0 ? '+' : ''} Rp {diff.toLocaleString()}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${diff === 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                <span className={`text-[8px] font-black uppercase tracking-widest ${diff === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {diff === 0 ? 'Protocol Synced' : diff > 0 ? 'Surplus Detected' : 'Deficit Detected'}
                </span>
              </div>
            </>
          ) : (
            <>
              <p className="text-xl font-black text-slate-300 tracking-tighter">Calculating...</p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Physical Audit</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="liquid-glass p-6 rounded-[32px] border-white/60 shadow-3d-lg space-y-6">
        <div>
          <h3 className="text-[11px] font-black uppercase text-slate-900 tracking-widest mb-1">Physical Reserve Verification</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Input verified cash-on-hand or bank balance for synchronization.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-slate-300">Rp</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              className="w-full text-lg font-black pl-11 pr-4 py-4 bg-white border border-slate-200/50 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner tracking-tighter"
              value={physicalBalance}
              onChange={e => setPhysicalBalance(e.target.value)}
            />
          </div>
          <button
            onClick={handleReconcile}
            className="btn-3d w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-indigo-400 shadow-3d-sm transition-all active:translate-y-0.5"
          >
            Execute Sync
          </button>
        </div>
        
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/50">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
            *Execution will generate an <span className="text-slate-900 font-black">Adjusting Ledger Entry</span> to synchronize system state with physical reality, ensuring absolute transparency for the citizenry.
          </p>
        </div>
      </div>
    </div>
  );
}
