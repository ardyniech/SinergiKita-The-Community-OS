import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Plus, AlertTriangle, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BudgetEditor } from './molecules/BudgetEditor';
import { RecurringTransactionItem } from './molecules/RecurringTransactionItem';
import TransactionLedger from './TransactionLedger';

interface RecurringTransaction { id: string; description: string; amount: number; status: 'active' | 'paused'; nextBillingDate: string; }

export default function FinanceModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState({ spent: 0, total: 10000000, threshold: 80 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState({ total: '', threshold: '' });
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [newRecurring, setNewRecurring] = useState({ description: '', amount: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    setError(null);
    const unsubT = onSnapshot(doc(db, 'tenants', profile.tenantId), (s) => {
      if (s.exists()) setBudget({ spent: s.data().spent || 0, total: s.data().budgetTotal || 10000000, threshold: s.data().budgetThreshold || 80 });
    }, (err) => {
      console.error("Finance tenant budget sub failed:", err);
      setError("Gagal menyinkronkan data anggaran.");
    });
    const unsubR = onSnapshot(query(collection(db, 'recurring'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc')), (s) => {
      setRecurring(s.docs.map(d => ({ id: d.id, ...d.data() } as RecurringTransaction)));
      setLoading(false);
    }, (err) => {
      console.error("Finance recurring sub failed:", err);
      setError("Gagal menyinkronkan transaksi rutin.");
      setLoading(false);
    });
    return () => { unsubT(); unsubR(); };
  }, [profile?.tenantId]);

  const handleUpdateBudget = async () => {
    if (!profile?.tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), { budgetTotal: Number(tempBudget.total), budgetThreshold: Number(tempBudget.threshold) });
      addAuditEntry(`Updated budget: Rp ${tempBudget.total}, Threshold ${tempBudget.threshold}%`);
      showToast('Anggaran diperbarui.');
      setIsEditingBudget(false);
    } catch (err: any) {
      console.error("Budget update failed:", err);
      showToast(`Gagal memperbarui anggaran: ${err.message || 'offline'}`);
    }
  };

  const addRecurring = async () => {
    if (!newRecurring.description || !newRecurring.amount || !profile?.tenantId) return;
    const amountNum = Number(newRecurring.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Nominal transaksi rutin harus valid dan lebih dari 0!');
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'recurring'), {
        tenantId: profile.tenantId, description: newRecurring.description, amount: amountNum,
        status: 'active', nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], createdAt: serverTimestamp()
      });
      showToast('Transaksi rutin berhasil ditambahkan.');
      setNewRecurring({ description: '', amount: '' });
      setIsAddingRecurring(false);
    } catch (err: any) {
      console.error("Adding recurring transaction failed:", err);
      showToast(`Gagal menambahkan transaksi rutin: ${err.message || 'offline'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat modul keuangan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500 bg-white rounded-xl border border-red-100 flex flex-col items-center gap-3 shadow-sm">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }} 
          className="px-2 py-2 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }
  const isTreasurer = profile?.role === 'bendahara';
  const isThresholdBreached = (budget.spent / budget.total) * 100 >= budget.threshold;

  return (
    <div className="space-y-6">
      {/* 1. Official Core Transaction Ledger (Ledger, Approvals, Reconciliation, Dues Tracking) */}
      <TransactionLedger />

      {/* 2. Operational Budget & Recurring Expenses Widget */}
      <div className="liquid-glass p-6 rounded-[32px] border-white/60 shadow-3d-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
        
        {isThresholdBreached && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-[11px] font-black text-rose-600 uppercase tracking-[0.1em] leading-none mb-1">Critical Threshold Breached</p>
              <p className="text-[9px] font-bold text-rose-500/80 uppercase tracking-tight">Current consumption exceeds {budget.threshold}% of total allocation.</p>
            </div>
          </div>
        )}
        
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-indigo-400">
                <SettingsIcon size={20} />
              </div>
              <div>
                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Operational Budget</h2>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Resource Allocation Status</p>
              </div>
            </div>
            {isTreasurer && (
              <button 
                onClick={() => { setTempBudget({ total: budget.total.toString(), threshold: budget.threshold.toString() }); setIsEditingBudget(!isEditingBudget); }} 
                className="w-10 h-10 bg-white/60 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all border border-white flex items-center justify-center shadow-3d-sm active:translate-y-0.5"
              >
                <SettingsIcon size={18} />
              </button>
            )}
          </div>

          {isEditingBudget && isTreasurer && <BudgetEditor tempBudget={tempBudget} setTempBudget={setTempBudget} onUpdate={handleUpdateBudget} />}
          
          <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden mb-4 shadow-inner border border-slate-200/50">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }} 
              className={`h-full rounded-full transition-all duration-1000 ${isThresholdBreached ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'} shadow-[0_0_15px_rgba(79,70,229,0.3)]`} 
            />
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Utilized Capital</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">Rp {budget.spent.toLocaleString()}</p>
            </div>
            <div className="text-center bg-white/60 px-4 py-2 rounded-2xl border border-white shadow-3d-sm">
              <span className={`text-sm font-black tracking-tighter ${isThresholdBreached ? 'text-rose-600' : 'text-indigo-600'}`}>
                {Math.round((budget.spent / budget.total) * 100)}%
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-2">/ {budget.threshold}% cap</span>
            </div>
            <div className="text-right space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Limit</p>
              <p className="text-xl font-black text-slate-900 tracking-tighter">Rp {budget.total.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/40 relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-emerald-400">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Recurring Ledger</h2>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Scheduled Community Expenses</p>
              </div>
            </div>
            {isTreasurer && (
              <button 
                onClick={() => setIsAddingRecurring(!isAddingRecurring)} 
                className="btn-3d w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-3d-sm border border-indigo-400 transition-all active:translate-y-0.5"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {isAddingRecurring && isTreasurer && (
            <div className="liquid-glass p-5 rounded-2xl mb-6 space-y-4 border-white/60 shadow-3d-sm bg-white/40 animate-in fade-in zoom-in-95 duration-200">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Transaction Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. WiFi Maintenance, Trash Collection" 
                  className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" 
                  value={newRecurring.description} 
                  onChange={e => setNewRecurring(p => ({ ...p, description: e.target.value }))} 
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Amount (Rp)</label>
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    placeholder="0" 
                    className="w-full text-[11px] font-black p-3.5 bg-white border border-slate-200/50 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 shadow-inner" 
                    value={newRecurring.amount} 
                    onChange={e => setNewRecurring(p => ({ ...p, amount: e.target.value }))} 
                  />
                </div>
                <button 
                  onClick={addRecurring} 
                  disabled={submitting} 
                  className="btn-3d mt-6 bg-indigo-600 text-white px-8 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-3d-sm border border-indigo-400 transition-all active:translate-y-0.5"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Execute'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recurring.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic opacity-50">Zero recurring protocols established.</p>
              </div>
            )}
            {recurring.map(item => (
              <RecurringTransactionItem 
                key={item.id} 
                item={item} 
                isTreasurer={isTreasurer}
                onToggle={async (id, s) => { 
                  if (!isTreasurer) return;
                  await updateDoc(doc(db, 'recurring', id), { status: s === 'active' ? 'paused' : 'active' }); 
                }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
