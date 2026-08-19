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
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'recurring'), {
        tenantId: profile.tenantId, description: newRecurring.description, amount: Number(newRecurring.amount),
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
      <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat modul keuangan...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500 bg-white rounded-3xl border border-red-100 flex flex-col items-center gap-3 shadow-sm">
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
  const isThresholdBreached = (budget.spent / budget.total) * 100 >= budget.threshold;

  return (
    <div className="space-y-4">
      {/* 1. Official Core Transaction Ledger (Ledger, Approvals, Reconciliation, Dues Tracking) */}
      <TransactionLedger />

      {/* 2. Operational Budget & Recurring Expenses Widget */}
      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        {isThresholdBreached && <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-pulse"><AlertTriangle className="text-red-600" size={16} /><p className="text-[10px] font-bold text-red-700 uppercase">KRITIS: Melampaui limit {budget.threshold}%!</p></div>}
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anggaran Operasional</h2>
            <button onClick={() => { setTempBudget({ total: budget.total.toString(), threshold: budget.threshold.toString() }); setIsEditingBudget(!isEditingBudget); }} className="text-gray-400 hover:text-blue-600 p-1"><SettingsIcon size={14} /></button>
          </div>
          {isEditingBudget && <BudgetEditor tempBudget={tempBudget} setTempBudget={setTempBudget} onUpdate={handleUpdateBudget} />}
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2 shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }} className={`h-full rounded-full ${isThresholdBreached ? 'bg-red-500' : 'bg-blue-500'}`} /></div>
          <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5"><span>Rp {budget.spent.toLocaleString()}</span><span className={isThresholdBreached ? 'text-red-600' : 'text-gray-900'}>{Math.round((budget.spent / budget.total) * 100)}% / {budget.threshold}%</span><span>Limit: Rp {budget.total.toLocaleString()}</span></div>
        </div>

        <div className="mb-2 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaksi Rutin</h2>
            <button onClick={() => setIsAddingRecurring(!isAddingRecurring)} className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"><Plus size={14} /></button>
          </div>
          {isAddingRecurring && (
            <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-2 border border-gray-100">
              <input type="text" placeholder="Deskripsi" className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={newRecurring.description} onChange={e => setNewRecurring(p => ({ ...p, description: e.target.value }))} />
              <div className="flex gap-2"><input type="number" inputMode="numeric" placeholder="Rp" className="flex-1 text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={newRecurring.amount} onChange={e => setNewRecurring(p => ({ ...p, amount: e.target.value }))} /><button onClick={addRecurring} disabled={submitting} className="bg-blue-600 text-white px-2 rounded-lg font-black text-[9px] uppercase tracking-widest">{submitting ? <Loader2 size={12} className="animate-spin" /> : 'Simpan'}</button></div>
            </div>
          )}
          <div className="space-y-2">
            {recurring.length === 0 && <p className="text-center text-[9px] text-gray-400 py-3 italic">Kosong.</p>}
            {recurring.map(item => <RecurringTransactionItem key={item.id} item={item} onToggle={async (id, s) => { await updateDoc(doc(db, 'recurring', id), { status: s === 'active' ? 'paused' : 'active' }); }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
