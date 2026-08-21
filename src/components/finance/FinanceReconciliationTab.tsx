import React, { useState } from 'react';
import { Wallet, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { ReconcileLog } from './types';

interface FinanceReconciliationTabProps {
  systemBalance: number;
  reconcileHistory: ReconcileLog[];
}

export function FinanceReconciliationTab({
  systemBalance,
  reconcileHistory
}: FinanceReconciliationTabProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [physicalCash, setPhysicalCash] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const parsedCash = parseFloat(physicalCash) || 0;
  const difference = parsedCash - systemBalance;

  const handleSaveReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'cash_reconciliations'), {
        tenantId: profile.tenantId,
        date: new Date().toISOString(),
        systemBalance,
        physicalCash: parsedCash,
        difference,
        notes: notes.trim(),
        reconciledBy: profile.displayName || profile.email
      });

      showToast("Rekonsiliasi kas berhasil dicatat!");
      setPhysicalCash('');
      setNotes('');
    } catch (err) {
      showToast("Gagal menyimpan rekonsiliasi kas");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 shadow-xs">
      <div className="px-3 py-3 flex items-center gap-2 bg-emerald-50/30 dark:bg-emerald-900/10 border-b border-slate-100 dark:border-slate-800">
        <Wallet size={16} className="text-emerald-600" />
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600">
          Rekonsiliasi Fisik vs Sistem
        </h3>
      </div>

      <form onSubmit={handleSaveReconcile} className="p-3 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Saldo Kas Sistem</label>
            <div className="h-11 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center text-[13px] font-black tabular-nums text-slate-400">
              Rp {systemBalance.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Input Uang Fisik (Rp)</label>
            <input
              type="number"
              required
              placeholder="Masukkan jumlah uang fisik..."
              value={physicalCash}
              onChange={(e) => setPhysicalCash(e.target.value)}
              className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] font-black tabular-nums focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
            />
          </div>
        </div>

        {physicalCash && (
          <div className={`p-3 rounded-xl border flex items-center justify-between animate-in zoom-in-95 duration-200 ${
            difference === 0 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : difference > 0 
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className="text-[11px] font-black uppercase tracking-tight">Selisih Fisik:</span>
            <span className="text-[13px] font-black tabular-nums">
              {difference > 0 ? '+' : ''} Rp {difference.toLocaleString('id-ID')}
            </span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Catatan Tambahan</label>
          <textarea
            placeholder="Keterangan kondisi fisik kas..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[12px] font-bold min-h-[80px] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[13px] font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-200/50 transition active:scale-[0.98] disabled:opacity-50"
        >
          <Check size={18} /> Simpan Laporan Rekon
        </button>
      </form>
    </div>
  );
}
