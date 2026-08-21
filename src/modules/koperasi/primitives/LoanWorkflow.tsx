import React, { useState } from 'react';
import { ArrowUpRight, Check, X, ShieldAlert, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { KoperasiLoan } from '../../../shared/models';

interface LoanWorkflowProps {
  loans: KoperasiLoan[];
  isAdmin: boolean;
  submitting: boolean;
  onApply: (amount: number, tenor: number, purpose: string, guarantor: string) => Promise<void>;
  onUpdateStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>;
}

export function LoanWorkflow({ loans, isAdmin, submitting, onApply, onUpdateStatus }: LoanWorkflowProps) {
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [tenor, setTenor] = useState('3');
  const [purpose, setPurpose] = useState('');
  const [guarantor, setGuarantor] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onApply(Number(amount), Number(tenor), purpose, guarantor);
    setShowForm(false);
    setAmount('');
    setPurpose('');
    setGuarantor('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Kredit Mikro Warga</h3>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1 opacity-70">Akses Modal Tanpa Agunan</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-3d px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-3d-sm"
        >
          {showForm ? 'Batal' : 'Ajukan Pinjaman'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-3d p-4 bg-indigo-50/50 border-indigo-200 shadow-3d-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-indigo-700 uppercase tracking-widest px-1">Nominal (Rp)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-black text-indigo-700 uppercase tracking-widest px-1">Tenor (Bulan)</label>
              <select
                value={tenor}
                onChange={(e) => setTenor(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl text-[11px] font-black outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[1,3,6,12].map(m => <option key={m} value={m}>{m} Bulan</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-black text-indigo-700 uppercase tracking-widest px-1">Keperluan</label>
            <input
              type="text"
              required
              placeholder="Contoh: Modal Dagang"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || !amount}
            className="btn-3d w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
            Konfirmasi Pengajuan
          </button>
        </form>
      )}

      <div className="space-y-2.5">
        {loans.length === 0 ? (
          <div className="p-10 text-center bg-white/40 border border-white/80 rounded-2xl">
            <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Ada Pengajuan Aktif</p>
          </div>
        ) : (
          loans.map(loan => (
            <div key={loan.id} className="card-3d p-4 bg-white/80 border-white/60 shadow-3d-sm flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-lg border ${
                    loan.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    loan.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {loan.status}
                  </span>
                  <span className="text-[13px] font-black text-slate-900 tabular-nums">Rp {loan.amount.toLocaleString()}</span>
                </div>
                <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-tight truncate">{loan.purpose}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {loan.borrowerName} • {loan.tenorMonths} Bln • Cicilan Rp {loan.monthlyInstallment?.toLocaleString()}/bln
                </p>
              </div>

              {isAdmin && loan.status === 'pending' && (
                <div className="flex items-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <button onClick={() => onUpdateStatus(loan.id, 'rejected')} className="btn-3d flex-1 sm:flex-none px-4 py-2 border border-rose-200 text-rose-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-rose-50">Tolak</button>
                  <button onClick={() => onUpdateStatus(loan.id, 'approved')} className="btn-3d flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-700">Setujui</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
