import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  PiggyBank, ArrowUpRight, History, Plus, Loader2, 
  Calculator, AlertCircle 
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { KoperasiRecord } from '../../types';
import { KoperasiSHUCalculator } from './KoperasiSHUCalculator';
import { KoperasiLoanWorkflow } from './KoperasiLoanWorkflow';

export function KoperasiModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'save' | 'shu' | 'loan' | 'history'>('save');
  const [records, setRecords] = useState<KoperasiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form States
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const tenantId = profile?.tenantId;

  // Real-time listener for Koperasi collection
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'koperasi'),
      where('tenantId', '==', tenantId),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as KoperasiRecord));
      setRecords(data);
      setLoading(false);
    }, (error) => {
      console.error("Koperasi listener error:", error);
      showToast("Gagal memuat data koperasi");
      setLoading(false);
    });

    return () => unsub();
  }, [tenantId]);

  // Handle Deposit (Simpanan Warga)
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast("Nominal simpanan tidak valid");
      return;
    }

    if (!profile?.uid || !tenantId) {
      showToast("Kredensial pengguna atau komunitas tidak ditemukan");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'koperasi'), {
        tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
        type: 'deposit',
        amount: Number(amount),
        note: note.trim() || 'Simpanan Sukarela',
        status: 'completed',
        timestamp: serverTimestamp()
      });

      showToast("Simpanan berhasil disetor ke Koperasi Warga!");
      setAmount('');
      setNote('');
    } catch (err: any) {
      console.error("Deposit error:", err);
      showToast("Gagal menyetor simpanan: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const userDeposits = records
    .filter(r => r.uid === profile?.uid && r.type === 'deposit' && r.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const totalKoperasiPool = records
    .filter(r => r.type === 'deposit' && r.status === 'completed')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 sm:px-3 pb-8">
      {/* Header & Balance */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PiggyBank size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">Koperasi Simpan Pinjam</h2>
              <p className="text-[10px] text-slate-500">Pemberdayaan Modal & Dana Gotong Royong</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simpanan Anda</span>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
              Rp {userDeposits.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Kas Terkumpul</span>
            <p className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 tabular-nums">
              Rp {totalKoperasiPool.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('save')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'save'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <PiggyBank size={14} /> Setor Simpanan
        </button>
        <button
          onClick={() => setActiveTab('shu')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'shu'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Calculator size={14} /> Kalkulator SHU
        </button>
        <button
          onClick={() => setActiveTab('loan')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'loan'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <ArrowUpRight size={14} /> Pinjaman Mikro
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'history'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <History size={14} /> Riwayat Koperasi
        </button>
      </div>

      {/* TAB: Setor Simpanan */}
      {activeTab === 'save' && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Form Setoran Simpanan Warga
          </h3>
          <form onSubmit={handleDeposit} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Nominal Simpanan (Rp)</label>
              <input
                type="number"
                required
                placeholder="Contoh: 50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Catatan / Jenis Simpanan</label>
              <input
                type="text"
                placeholder="Contoh: Simpanan Wajib Bulan Mei"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Setor ke Koperasi
            </button>
          </form>
        </div>
      )}

      {/* TAB: Kalkulator SHU */}
      {activeTab === 'shu' && (
        <KoperasiSHUCalculator 
          userSavings={userDeposits} 
          totalSavingsPool={totalKoperasiPool} 
        />
      )}

      {/* TAB: Pinjaman Mikro */}
      {activeTab === 'loan' && (
        <KoperasiLoanWorkflow />
      )}

      {/* TAB: Riwayat Koperasi */}
      {activeTab === 'history' && (
        <div className="space-y-2">
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-bold">Memuat riwayat koperasi...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <AlertCircle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Belum Ada Transaksi Koperasi</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Mulai lakukan setoran simpanan pertama Anda.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
              {records.map(record => (
                <div key={record.id} className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{record.note || 'Simpanan Koperasi'}</h4>
                    <span className="text-[10px] text-slate-400">{record.userName} • {record.status}</span>
                  </div>
                  <p className="text-xs sm:text-sm font-black text-emerald-600 tabular-nums">
                    + Rp {record.amount.toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
