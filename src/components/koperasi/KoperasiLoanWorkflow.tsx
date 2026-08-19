import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowUpRight, Check, X, ShieldAlert, 
  Loader2, AlertCircle, Clock, CheckCircle2 
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, updateDoc, doc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { KoperasiLoan } from '../../types';

export function KoperasiLoanWorkflow() {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [loans, setLoans] = useState<KoperasiLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [tenorMonths, setTenorMonths] = useState('3');
  const [purpose, setPurpose] = useState('');
  const [guarantorName, setGuarantorName] = useState('');

  const isAdminRole = ['admin', 'ketua', 'bendahara', 'superadmin'].includes(profile?.role || '');
  const tenantId = profile?.tenantId;

  useEffect(() => {
    if (!tenantId) return;

    const q = query(
      collection(db, 'koperasi_loans'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as KoperasiLoan));
      setLoans(docs);
      setLoading(false);
    }, (err) => {
      console.warn("Loans listener error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, [tenantId]);

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numTenor = parseInt(tenorMonths, 10);

    if (isNaN(numAmount) || numAmount <= 0) {
      showToast('Nominal pinjaman tidak valid');
      return;
    }

    if (!purpose.trim()) {
      showToast('Alasan pinjaman wajib diisi');
      return;
    }

    setSubmitting(true);
    try {
      const monthlyInstallment = Math.round(numAmount / numTenor);
      await addDoc(collection(db, 'koperasi_loans'), {
        tenantId,
        uid: profile?.uid,
        borrowerName: profile?.displayName || profile?.email?.split('@')[0] || 'Warga',
        amount: numAmount,
        tenorMonths: numTenor,
        purpose: purpose.trim(),
        guarantorName: guarantorName.trim() || 'Pengurus Komunitas',
        monthlyInstallment,
        status: 'pending',
        createdAt: serverTimestamp(),
        paidAmount: 0
      });

      showToast('Pengajuan pinjaman berhasil dikirim untuk ditinjau pengurus.');
      setAmount('');
      setPurpose('');
      setGuarantorName('');
      setShowApplyForm(false);
    } catch (err: any) {
      showToast('Gagal mengajukan pinjaman: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (loanId: string, newStatus: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'koperasi_loans', loanId), {
        status: newStatus,
        approvedBy: profile?.displayName || profile?.email || 'Pengurus'
      });
      showToast(`Pengajuan pinjaman berhasil ${newStatus === 'approved' ? 'disetujui' : 'ditolak'}.`);
    } catch (err) {
      showToast('Mohon maaf, pembaruan status pinjaman terkendala.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Top Action */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
          Pinjaman Mikro Gotong Royong
        </h3>
        <button
          onClick={() => setShowApplyForm(!showApplyForm)}
          className="min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition"
        >
          <ArrowUpRight size={14} /> Ajukan Pinjaman
        </button>
      </div>

      {/* Apply Form */}
      {showApplyForm && (
        <form onSubmit={handleApplyLoan} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-md space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Form Pengajuan Pinjaman</span>
            <button type="button" onClick={() => setShowApplyForm(false)} className="text-slate-400 p-1"><X size={16} /></button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nominal Pinjaman (Rp)</label>
              <input
                type="number"
                required
                placeholder="Contoh: 1000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Jangka Waktu (Tenor)</label>
              <select
                value={tenorMonths}
                onChange={(e) => setTenorMonths(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              >
                <option value="1">1 Bulan</option>
                <option value="3">3 Bulan</option>
                <option value="6">6 Bulan</option>
                <option value="12">12 Bulan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Keperluan Pinjaman</label>
              <input
                type="text"
                required
                placeholder="Contoh: Modal usaha warung / darurat medis"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Nama Penjamin / Rekomendasi Warga</label>
              <input
                type="text"
                placeholder="Contoh: Pak RT / Tetangga penjamin"
                value={guarantorName}
                onChange={(e) => setGuarantorName(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Ajukan Sekarang
            </button>
          </div>
        </form>
      )}

      {/* Loans List */}
      {loading ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-emerald-600" />
          <p className="text-xs font-bold">Memuat daftar pinjaman...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
          <AlertCircle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
          <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Belum Ada Pengajuan Pinjaman</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Pinjaman mikro dapat diajukan untuk kebutuhan darurat atau modal produktif.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {loans.map(loan => (
            <div key={loan.id} className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                    loan.status === 'approved' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    loan.status === 'rejected' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {loan.status}
                  </span>
                  <span className="text-xs font-black text-slate-900 dark:text-slate-100 tabular-nums">
                    Rp {loan.amount.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[10px] text-slate-400">({loan.tenorMonths} Bulan • Cicilan ~Rp {loan.monthlyInstallment.toLocaleString('id-ID')}/bln)</span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{loan.purpose}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Peminjam: {loan.borrowerName} • Penjamin: {loan.guarantorName}
                </p>
              </div>

              {isAdminRole && loan.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(loan.id, 'rejected')}
                    className="min-h-[44px] px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(loan.id, 'approved')}
                    className="min-h-[44px] px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm transition"
                  >
                    <Check size={14} /> Setujui
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
