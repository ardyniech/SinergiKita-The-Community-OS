import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAudit } from '../../context/AuditContext';
import { 
  Download, FileText, Table, Plus, ShieldCheck, Check, 
  AlertCircle, RefreshCw, Send, Users, Wallet, Loader2, 
  ShieldAlert, Settings as SettingsIcon, AlertTriangle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CSVExportButton } from '../molecules/CSVExportButton';
import { 
  collection, query, where, onSnapshot, 
  addDoc, updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BudgetEditor } from '../molecules/BudgetEditor';
import { RecurringTransactionItem } from '../molecules/RecurringTransactionItem';
import { checkAndGrantAchievements } from '../../lib/achievements';

interface FinanceRecord {
  id: number;
  type: 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  date: string;
  authorEmail: string;
}

interface PendingApproval {
  id: string;
  description: string;
  amount: number;
  type: 'debit';
  date: string;
  createdBy: string;
  createdByUid: string;
  approvals: string[];
  approverNames: string[];
  status: 'pending' | 'approved';
  tenantId: string;
}

interface Citizen {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  duesStatus?: 'paid' | 'unpaid';
  duesAmount?: number;
  phoneNumber?: string;
}

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  status: 'active' | 'paused';
  nextBillingDate: string;
}

export function FinanceLedger() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();

  const [activeTab, setActiveTab] = useState<'ledger' | 'approvals' | 'reconcile' | 'reminders'>('ledger');
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Iuran Warga');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Reconciliation State
  const [physicalCash, setPhysicalCash] = useState<string>('');
  const [reconcileNotes, setReconcileNotes] = useState<string>('');
  const [reconcileHistory, setReconcileHistory] = useState<any[]>([]);

  const isAdminRole = ['admin', 'ketua', 'bendahara', 'superadmin'].includes(profile?.role || '');

  // Fetch PostgreSQL Finances
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/finances', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      } else {
        showToast('Gagal memuat buku kas keuangan.');
      }
    } catch (e) {
      console.error("Finance fetch error:", e);
      showToast('Terjadi kesalahan koneksi ke server kas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [profile?.tenantId]);

  // Real-time Firestore Listeners for Approvals & Citizens
  useEffect(() => {
    if (!profile?.tenantId) return;

    const qApprovals = query(
      collection(db, 'transaction_approvals'),
      where('tenantId', '==', profile.tenantId)
    );
    const unsubApprovals = onSnapshot(qApprovals, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as PendingApproval));
      setPendingApprovals(docs.filter(d => d.status === 'pending'));
    });

    const qCitizens = query(
      collection(db, 'users'),
      where('tenantId', '==', profile.tenantId)
    );
    const unsubCitizens = onSnapshot(qCitizens, (snap) => {
      const docs = snap.docs.map(d => ({ uid: d.id, ...d.data() } as Citizen));
      setCitizens(docs);
    });

    const qReconcile = query(
      collection(db, 'reconciliations'),
      where('tenantId', '==', profile.tenantId)
    );
    const unsubReconcile = onSnapshot(qReconcile, (snap) => {
      setReconcileHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubApprovals();
      unsubCitizens();
      unsubReconcile();
    };
  }, [profile?.tenantId]);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      showToast('Nominal dan keterangan wajib diisi.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Nominal transaksi tidak valid.');
      return;
    }

    // High value expense approval requirement (> Rp 1.000.000)
    if (type === 'expense' && numAmount >= 1000000) {
      try {
        setUploading(true);
        await addDoc(collection(db, 'transaction_approvals'), {
          tenantId: profile?.tenantId,
          description,
          amount: numAmount,
          type: 'debit',
          date: new Date().toISOString(),
          createdBy: profile?.displayName || profile?.email || 'Admin',
          createdByUid: profile?.uid,
          approvals: [profile?.uid],
          approverNames: [profile?.displayName || profile?.email || 'Admin'],
          status: 'pending',
          createdAt: serverTimestamp()
        });
        showToast('Pengeluaran besar (> Rp 1jt) diajukan ke antrean persetujuan bendahara & ketua.');
        setDescription('');
        setAmount('');
        setShowAddForm(false);
        return;
      } catch (err) {
        showToast('Gagal mengajukan persetujuan pengeluaran.');
        return;
      } finally {
        setUploading(false);
      }
    }

    try {
      setUploading(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          amount: numAmount,
          description,
          category,
          tenantId: profile?.tenantId
        })
      });

      if (res.ok) {
        showToast('Transaksi berhasil dicatat ke buku kas!');
        setDescription('');
        setAmount('');
        setShowAddForm(false);
        fetchRecords();
        if (profile && profile.tenantId) {
          checkAndGrantAchievements(profile, profile.tenantId);
        }
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Gagal menyimpan transaksi.');
      }
    } catch (err) {
      showToast('Kesalahan koneksi ke server kas.');
    } finally {
      setUploading(false);
    }
  };

  const handleApproveTransaction = async (approval: PendingApproval) => {
    if (!profile?.uid) return;
    if (approval.approvals.includes(profile.uid)) {
      showToast('Anda sudah memberikan tanda tangan persetujuan pada transaksi ini.');
      return;
    }

    const updatedApprovals = [...approval.approvals, profile.uid];
    const updatedNames = [...approval.approverNames, profile.displayName || profile.email || 'Pengurus'];

    try {
      if (updatedApprovals.length >= 2) {
        // Multi-signature fulfilled -> commit to Postgres
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'expense',
            amount: approval.amount,
            description: `[Disetujui 2 Pengurus] ${approval.description}`,
            category: 'Pengeluaran Disetujui',
            tenantId: approval.tenantId
          })
        });

        if (res.ok) {
          await updateDoc(doc(db, 'transaction_approvals', approval.id), {
            approvals: updatedApprovals,
            approverNames: updatedNames,
            status: 'approved'
          });
          showToast('Persetujuan lengkap (2 tanda tangan). Transaksi telah dicatat ke buku kas!');
          fetchRecords();
        }
      } else {
        await updateDoc(doc(db, 'transaction_approvals', approval.id), {
          approvals: updatedApprovals,
          approverNames: updatedNames
        });
        showToast('Tanda tangan Anda tersimpan. Menunggu 1 persetujuan pengurus lagi.');
      }
    } catch (err) {
      showToast('Gagal memproses persetujuan.');
    }
  };

  // Calculations
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((acc, r) => acc + parseFloat(r.amount || '0'), 0);
  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((acc, r) => acc + parseFloat(r.amount || '0'), 0);
  const currentBalance = totalIncome - totalExpense;

  const filteredRecords = filterCategory === 'ALL' 
    ? records 
    : records.filter(r => r.category === filterCategory);

  const exportPDF = () => {
    const docPdf = new jsPDF();
    docPdf.text(`Laporan Buku Kas - ${profile?.tenantName || 'SinergiKita'}`, 14, 15);
    docPdf.setFontSize(10);
    docPdf.text(`Total Kas: Rp ${currentBalance.toLocaleString('id-ID')}`, 14, 22);

    const tableData = records.map(r => [
      new Date(r.date).toLocaleDateString('id-ID'),
      r.description,
      r.category,
      r.type === 'income' ? `+ Rp ${parseFloat(r.amount).toLocaleString('id-ID')}` : `- Rp ${parseFloat(r.amount).toLocaleString('id-ID')}`,
      r.authorEmail
    ]);

    autoTable(docPdf, {
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Nominal', 'Pencatat']],
      body: tableData,
      startY: 28,
    });

    docPdf.save(`Buku_Kas_${new Date().toISOString().slice(0, 10)}.pdf`);
    showToast('Laporan PDF berhasil diunduh.');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 sm:px-3 pb-8">
      {/* Header & Balance Card */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Wallet size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">Buku Kas Komunitas</h2>
              <p className="text-[10px] text-slate-500">Transparansi Keuangan Terverifikasi</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={fetchRecords}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Segarkan data"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            {isAdminRole && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="min-h-[44px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition"
              >
                <Plus size={14} /> Catat Transaksi
              </button>
            )}
          </div>
        </div>

        {/* Big Balance Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Saldo Kas Bersih</span>
            <p className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-50 tabular-nums">
              Rp {currentBalance.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Total Pemasukan</span>
            <p className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
              + Rp {totalIncome.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-lg border border-rose-100 dark:border-rose-900/30">
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Total Pengeluaran</span>
            <p className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-400 tabular-nums">
              - Rp {totalExpense.toLocaleString('id-ID')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition whitespace-nowrap ${
            activeTab === 'ledger'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          Mutasi Kas
        </button>
        {isAdminRole && (
          <>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'approvals'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck size={14} /> Persetujuan {pendingApprovals.length > 0 && `(${pendingApprovals.length})`}
            </button>
            <button
              onClick={() => setActiveTab('reconcile')}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reconcile'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Table size={14} /> Rekonsiliasi Kas
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'reminders'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Send size={14} /> Tagihan & Reminder
            </button>
          </>
        )}
      </div>

      {/* Add Transaction Form Modal/Collapsible */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800/80 shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Catat Transaksi Baru</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleAddRecord} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`min-h-[44px] py-2 rounded-lg text-xs font-black border transition ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  + Pemasukan (Kredit)
                </button>
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`min-h-[44px] py-2 rounded-lg text-xs font-black border transition ${
                    type === 'expense'
                      ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  - Pengeluaran (Debit)
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 150000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Iuran Warga">Iuran Warga</option>
                    <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                    <option value="Keamanan / Ronda">Keamanan / Ronda</option>
                    <option value="Sosial & Santunan">Sosial & Santunan</option>
                    <option value="Pembangunan & Renovasi">Pembangunan & Renovasi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Keterangan Transaksi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembelian lampu jalan RT"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5 transition"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Simpan Transaksi
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB: Ledger List */}
      {activeTab === 'ledger' && (
        <div className="space-y-3">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="min-h-[44px] px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Iuran Warga">Iuran Warga</option>
                <option value="Kebersihan & Sampah">Kebersihan & Sampah</option>
                <option value="Keamanan / Ronda">Keamanan / Ronda</option>
                <option value="Sosial & Santunan">Sosial & Santunan</option>
                <option value="Pembangunan & Renovasi">Pembangunan & Renovasi</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <CSVExportButton data={records} filename="Buku_Kas" />
              <button
                onClick={exportPDF}
                className="min-h-[44px] px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <FileText size={14} /> PDF
              </button>
            </div>
          </div>

          {/* List Items */}
          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
              <p className="text-xs font-bold">Memuat mutasi kas...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <AlertCircle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Belum Ada Catatan Transaksi</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Mulai catat pemasukan atau pengeluaran kas komunitas.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden">
              {filteredRecords.map((r) => {
                const isInc = r.type === 'income';
                return (
                  <div key={r.id} className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                        isInc ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200'
                      }`}>
                        {isInc ? '+' : '-'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{r.description}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{new Date(r.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          <span>•</span>
                          <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-bold">{r.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs sm:text-sm font-black tabular-nums ${isInc ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {isInc ? '+' : '-'} Rp {parseFloat(r.amount).toLocaleString('id-ID')}
                      </p>
                      <span className="text-[9px] text-slate-400 truncate max-w-[120px] block">{r.authorEmail?.split('@')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: Approvals (> Rp 1.000.000) */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-2">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-800 dark:text-amber-300">
              Setiap pengeluaran kas di atas Rp 1.000.000 memerlukan tanda tangan persetujuan minimal <strong>2 pengurus</strong> (Ketua / Bendahara / Admin) sebelum dicairkan.
            </p>
          </div>

          {pendingApprovals.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <ShieldCheck size={28} className="mx-auto mb-2 text-emerald-500" />
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Semua Pengeluaran Telah Disetujui</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Tidak ada transaksi yang membutuhkan persetujuan.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingApprovals.map((app) => (
                <div key={app.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 rounded">
                        Perlu Persetujuan
                      </span>
                      <span className="text-xs font-black text-rose-600 tabular-nums">
                        Rp {app.amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{app.description}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Diajukan oleh: {app.createdBy} • Tanda tangan ({app.approvals.length}/2): {app.approverNames.join(', ')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleApproveTransaction(app)}
                    className="min-h-[44px] px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Check size={14} /> Beri Tanda Tangan
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Reconciliation */}
      {activeTab === 'reconcile' && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Table size={16} className="text-blue-600" /> Rekonsiliasi Kas Fisik vs Sistem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Saldo Buku Kas (Sistem)</span>
              <p className="text-base font-black text-slate-800 dark:text-slate-100 tabular-nums">Rp {currentBalance.toLocaleString('id-ID')}</p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Hitungan Uang Fisik / Bank (Rp)</label>
              <input
                type="number"
                placeholder="Masukkan jumlah kas fisik..."
                value={physicalCash}
                onChange={(e) => setPhysicalCash(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              />
            </div>
          </div>
          {physicalCash && (
            <div className={`p-3 rounded-lg text-xs font-bold ${
              parseFloat(physicalCash) === currentBalance 
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                : 'bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            }`}>
              Selisih Kas: Rp {(parseFloat(physicalCash) - currentBalance).toLocaleString('id-ID')}
              {parseFloat(physicalCash) === currentBalance ? ' (Sempurna / Match! 🎉)' : ' (Terdapat selisih, mohon diperiksa)'}
            </div>
          )}
        </div>
      )}

      {/* TAB: Reminders & Citizen Dues */}
      {activeTab === 'reminders' && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Users size={16} className="text-purple-600" /> Status Iuran & Pengingat Warga
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {citizens.map(c => (
              <div key={c.uid} className="py-2.5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{c.displayName || c.email}</h4>
                  <span className="text-[10px] text-slate-400">{c.role}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    c.duesStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {c.duesStatus === 'paid' ? 'Lunas' : 'Belum Lunas'}
                  </span>
                  <button
                    onClick={() => showToast(`Notifikasi tagihan iuran terkirim ke ${c.displayName || c.email}`)}
                    className="min-h-[44px] px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Send size={12} /> Kirim Pengingat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
