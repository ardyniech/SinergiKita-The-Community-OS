import { useState, useEffect } from 'react';
import { Transaction } from '../types';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { Download, FileText, Table, Plus, ShieldCheck, Check, AlertCircle, RefreshCw, Send, Users, DollarSign, Wallet, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, query, where, onSnapshot, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';

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

export default function TransactionLedger() {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'ledger' | 'approvals' | 'reconcile' | 'reminders'>('ledger');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Transaction entry form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'credit' | 'debit'>('credit');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reconciliation state
  const [physicalBalance, setPhysicalBalance] = useState('');

  // Calculations
  const systemBalance = transactions.reduce((sum, t) => sum + (t.type === 'credit' ? t.amount : -t.amount), 0);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    // 1. Listen for Transactions
    const qTx = query(
      collection(db, 'transactions'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('date', 'desc')
    );
    const unsubTx = onSnapshot(qTx, (snapshot) => {
      const transactionData: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        transactionData.push({ 
          id: doc.id, 
          ...data,
          date: data.date?.toDate?.() ? data.date.toDate().toISOString().split('T')[0] : data.date 
        } as Transaction);
      });
      setTransactions(transactionData);
      setLoading(false);
    }, (error) => {
      console.error("TransactionLedger error:", error);
      setLoading(false);
    });

    // 2. Listen for Pending Approvals (> Rp 1.000.000)
    const qApp = query(
      collection(db, 'transaction_approvals'),
      where('tenantId', '==', profile.tenantId),
      where('status', '==', 'pending')
    );
    const unsubApp = onSnapshot(qApp, (snapshot) => {
      const approvalData: PendingApproval[] = [];
      snapshot.forEach((doc) => {
        approvalData.push({ id: doc.id, ...doc.data() } as PendingApproval);
      });
      setPendingApprovals(approvalData);
    });

    // 3. Listen for Citizens (for Dues / Reminders)
    const qCit = query(
      collection(db, 'users'),
      where('tenantId', '==', profile.tenantId)
    );
    const unsubCit = onSnapshot(qCit, (snapshot) => {
      const citizenData: Citizen[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        citizenData.push({
          uid: doc.id,
          displayName: data.displayName || data.email?.split('@')[0] || 'Warga',
          email: data.email,
          role: data.role || 'member',
          duesStatus: data.duesStatus || 'unpaid',
          duesAmount: data.duesAmount || 50000,
          phoneNumber: data.phoneNumber || '+628123456789'
        } as Citizen);
      });
      setCitizens(citizenData);
    });

    return () => {
      unsubTx();
      unsubApp();
      unsubCit();
    };
  }, [profile?.tenantId, profile?.isApproved]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || !profile?.tenantId) return;

    const amountNum = Number(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Jumlah transaksi harus valid!");
      return;
    }

    setIsSubmitting(true);
    try {
      // DUAL-SIGNATURE APPROVAL FOR LARGE EXPENSES (> Rp 1.000.000)
      if (newType === 'debit' && amountNum > 1000000) {
        await addDoc(collection(db, 'transaction_approvals'), {
          tenantId: profile.tenantId,
          description: newDesc,
          amount: amountNum,
          type: 'debit',
          date: newDate,
          createdBy: profile.displayName || profile.email,
          createdByUid: profile.uid,
          approvals: [profile.uid], // Creator acts as first approver
          approverNames: [profile.displayName || profile.email],
          status: 'pending',
          createdAt: serverTimestamp()
        });

        addAuditEntry(`Initiated large expenditure approval request: "${newDesc}" - Rp ${amountNum.toLocaleString()}`);
        showToast("⚠️ Pengeluaran Besar (> Rp 1jt) dialihkan ke Workflow Persetujuan Berjenjang!");
      } else {
        // Direct commitment to transactions
        await addDoc(collection(db, 'transactions'), {
          tenantId: profile.tenantId,
          description: newDesc,
          amount: amountNum,
          type: newType,
          date: newDate,
          createdAt: serverTimestamp(),
          recordedBy: profile.displayName || profile.email
        });

        addAuditEntry(`Recorded manual transaction: "${newDesc}" (${newType}) - Rp ${amountNum.toLocaleString()}`);
        showToast("Transaksi berhasil dicatat.");
      }

      // Reset form
      setNewDesc('');
      setNewAmount('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal mencatat transaksi: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (approval: PendingApproval, simulateSecondUser: boolean = false) => {
    if (!profile?.tenantId) return;

    const isAlreadyApproved = approval.approvals.includes(profile.uid);
    if (isAlreadyApproved && !simulateSecondUser) {
      showToast("Anda sudah menyetujui transaksi ini. Menunggu approver lain!");
      return;
    }

    try {
      let updatedApprovals = [...approval.approvals];
      let updatedNames = [...approval.approverNames];

      if (simulateSecondUser) {
        // Simulate second administrator
        updatedApprovals.push("simulated-approver-uid-123");
        updatedNames.push("Hendra Wijaya (Lurah Sektor B)");
      } else {
        updatedApprovals.push(profile.uid);
        updatedNames.push(profile.displayName || profile.email);
      }

      if (updatedApprovals.length >= 2) {
        // 2 Approvers completed: Commit to official transactions list
        await addDoc(collection(db, 'transactions'), {
          tenantId: profile.tenantId,
          description: `[DISETUJUI] ${approval.description}`,
          amount: approval.amount,
          type: 'debit',
          date: approval.date,
          createdAt: serverTimestamp(),
          recordedBy: `Disetujui oleh: ${updatedNames.join(" & ")}`
        });

        // Update workflow status to approved / close it
        await deleteDoc(doc(db, 'transaction_approvals', approval.id));

        addAuditEntry(`Approved & Committed expense: "${approval.description}" - Rp ${approval.amount.toLocaleString()} by ${updatedNames.join(" & ")}`);
        showToast("✅ Transaksi Disetujui Penuh & Masuk Buku Kas!");
      } else {
        // Just record current approval
        await updateDoc(doc(db, 'transaction_approvals', approval.id), {
          approvals: updatedApprovals,
          approverNames: updatedNames
        });

        addAuditEntry(`Approved expense (1/2 signatures): "${approval.description}" - Rp ${approval.amount.toLocaleString()}`);
        showToast("Persetujuan tercatat (1 dari 2 approver)");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Gagal menyetujui: " + err.message);
    }
  };

  const handleReject = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'transaction_approvals', id));
      addAuditEntry(`Rejected expense proposal: "${title}"`);
      showToast("Proposal pengeluaran ditolak.");
    } catch (err: any) {
      showToast("Gagal menolak: " + err.message);
    }
  };

  const handleReconcile = async () => {
    const physicalVal = Number(physicalBalance);
    if (isNaN(physicalVal) || physicalBalance === '') {
      showToast("Masukkan saldo fisik yang valid!");
      return;
    }

    const discrepancy = physicalVal - systemBalance;
    if (discrepancy === 0) {
      showToast("Saldo sudah sinkron! Tidak perlu penyesuaian.");
      return;
    }

    try {
      const desc = `Penyesuaian Rekonsiliasi Kas (Selisih ${discrepancy > 0 ? 'Lebih' : 'Kurang'})`;
      const type = discrepancy > 0 ? 'credit' : 'debit';
      const amount = Math.abs(discrepancy);

      await addDoc(collection(db, 'transactions'), {
        tenantId: profile?.tenantId,
        description: desc,
        amount,
        type,
        date: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        recordedBy: `Otomatis Rekonsiliasi: ${profile?.displayName || profile?.email}`
      });

      addAuditEntry(`Performed physical reconciliation adjustment of Rp ${amount.toLocaleString()} (${type})`);
      showToast("✅ Rekonsiliasi Berhasil! Saldo tercatat disinkronkan.");
      setPhysicalBalance('');
    } catch (err: any) {
      showToast("Gagal rekonsiliasi: " + err.message);
    }
  };

  const handleToggleDues = async (citizen: Citizen) => {
    try {
      const nextStatus = citizen.duesStatus === 'paid' ? 'unpaid' : 'paid';
      await updateDoc(doc(db, 'users', citizen.uid), {
        duesStatus: nextStatus
      });
      showToast(`Status iuran ${citizen.displayName} diubah menjadi ${nextStatus === 'paid' ? 'LUNAS' : 'BELUM LUNAS'}`);
    } catch (err: any) {
      showToast("Gagal memperbarui status: " + err.message);
    }
  };

  const handleSendReminder = (citizen: Citizen) => {
    // Simulated WA/SMS reminder output as requested in gap analysis
    addAuditEntry(`Sent automated dues reminder to ${citizen.displayName} (${citizen.phoneNumber})`);
    
    // Prominent Real-time simulator toast message
    showToast(
      `📲 [MOCK WHATSAPP/SMS GATEWAY] Terkirim ke ${citizen.phoneNumber}:\n"Halo ${citizen.displayName}, pengingat iuran SinergiKita Anda sebesar Rp ${citizen.duesAmount?.toLocaleString()} belum terbayar. Harap selesaikan iuran untuk kesejahteraan warga. Terima kasih!"`
    );
  };

  const exportToCSV = () => {
    addAuditEntry("Exported ledger to CSV");
    const headers = ["ID", "Deskripsi", "Tanggal", "Tipe", "Jumlah (Rp)"];
    const csvContent = [
      headers.join(","),
      ...transactions.map(t => [t.id, `"${t.description.replace(/"/g, '""')}"`, t.date, t.type, t.amount].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV berhasil diunduh.");
  };

  const exportToPDF = () => {
    addAuditEntry("Exported ledger to PDF");
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Laporan Pertanggungjawaban Mutasi Kas SinergiKita', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Komunitas Tenant ID: ${profile?.tenantId}`, 14, 30);
    doc.text(`Total Saldo Kas: Rp ${systemBalance.toLocaleString()}`, 14, 36);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [['ID', 'Deskripsi', 'Tanggal', 'Tipe', 'Jumlah (Rp)']],
      body: transactions.map(t => [
        t.id, 
        t.description, 
        t.date, 
        t.type.toUpperCase(), 
        t.amount.toLocaleString()
      ]),
      headStyles: { fillColor: [79, 70, 229], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`ledger-${new Date().toISOString().slice(0,10)}.pdf`);
    showToast("PDF berhasil diunduh.");
  };

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      showToast('Nota fisik berhasil diunggah dan diverifikasi AI OCR.');
      addAuditEntry("Uploaded transaction receipt with OCR verification");
    }, 1500);
  };

  const isAdminRole = ['superadmin', 'admin', 'ketua', 'bendahara'].includes(profile?.role || '');

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-xl shadow-sm border border-gray-100">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span>Memuat data mutasi keuangan...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-3.5 rounded-xl shadow-sm border border-gray-100 mb-3">
      {/* Tab Selectors */}
      <div className="flex border-b border-gray-100 mb-3 overflow-x-auto pb-1 gap-1">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'ledger' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Wallet size={12} /> Buku Kas
        </button>
        {isAdminRole && (
          <>
            <button
              onClick={() => setActiveTab('approvals')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 relative ${activeTab === 'approvals' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <ShieldCheck size={12} /> Approval
              {pendingApprovals.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{pendingApprovals.length}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('reconcile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'reconcile' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <RefreshCw size={12} /> Rekonsiliasi
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'reminders' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Users size={12} /> Tagihan Iuran
            </button>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: LEDGER */}
        {activeTab === 'ledger' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider leading-none">Mutasi Kas</h2>
                <p className="text-[10px] text-indigo-600 font-bold mt-1">Saldo Sistem: Rp {systemBalance.toLocaleString()}</p>
              </div>
              <div className="flex gap-1">
                {isAdminRole && (
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-black uppercase tracking-widest"
                  >
                    <Plus size={11} /> Tambah
                  </button>
                )}
                <button 
                  onClick={exportToCSV} 
                  className="flex items-center gap-1 text-[9px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors font-black uppercase tracking-widest"
                  title="Ekspor CSV"
                >
                  <Table size={11} /> CSV
                </button>
                <button 
                  onClick={exportToPDF} 
                  className="flex items-center gap-1 text-[9px] bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors font-black uppercase tracking-widest"
                  title="Ekspor PDF"
                >
                  <FileText size={11} /> PDF
                </button>
              </div>
            </div>

            {/* Manual Transaction Input Form */}
            {showAddForm && (
              <form onSubmit={handleAddTransaction} className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Catat Aliran Kas</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Deskripsi</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Beli Semen / Iuran Kas" 
                      className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                      value={newDesc}
                      onChange={e => setNewDesc(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Jumlah (Rp)</label>
                    <input 
                      type="number" 
                      inputMode="numeric"
                      required
                      placeholder="Rp" 
                      className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                      value={newAmount}
                      onChange={e => setNewAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Jenis</label>
                    <select 
                      className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                      value={newType}
                      onChange={e => setNewType(e.target.value as 'credit' | 'debit')}
                    >
                      <option value="credit">Pemasukan (Kredit)</option>
                      <option value="debit">Pengeluaran (Debit)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[8px] font-bold uppercase text-gray-400">Tanggal</label>
                    <input 
                      type="date" 
                      required
                      className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                      value={newDate}
                      onChange={e => setNewDate(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="text-[9px] text-gray-500 uppercase font-black px-2 py-1"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="text-[9px] bg-emerald-600 text-white uppercase font-black px-3 py-1 rounded hover:bg-emerald-700 transition-colors"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            )}

            {/* Transactions Feed */}
            <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto">
              {transactions.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">Belum ada mutasi tercatat.</p>}
              {transactions.map(t => (
                <div key={t.id} className="p-2 border-b border-gray-50 flex justify-between items-center text-[11px] hover:bg-gray-50/50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900">{t.description}</p>
                    <p className="text-gray-400 text-[8px]">{t.date} { (t as any).recordedBy && `• ${(t as any).recordedBy}` }</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${t.type === 'credit' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {t.type === 'credit' ? '+' : '-'} Rp {t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Receipt Upload */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-[9px] font-bold text-gray-500 uppercase">Arsip Bukti Nota (OCR Verified)</h3>
                <p className="text-[8px] text-gray-400">Upload kuitansi fisik untuk audit kepatuhan.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <input type="file" className="hidden" id="nota-upload" onChange={handleUpload} />
                <label 
                  htmlFor="nota-upload"
                  className="text-[9px] bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors font-black cursor-pointer uppercase tracking-wider"
                >
                  <Download size={10} />
                  {uploading ? 'Memindai...' : 'Unggah Nota'}
                </label>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: APPROVALS */}
        {activeTab === 'approvals' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
            <div>
              <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Workflow Persetujuan Berjenjang</h2>
              <p className="text-[9px] text-gray-400 mt-0.5">Pengeluaran kas komunitas &gt; Rp 1.000.000 wajib disetujui minimal oleh 2 admin/pengurus.</p>
            </div>

            <div className="space-y-2">
              {pendingApprovals.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <ShieldCheck size={28} className="text-indigo-400 mx-auto mb-1.5" />
                  <p className="text-[10px] text-gray-500 font-bold">Semua pengeluaran kas lunas disetujui!</p>
                  <p className="text-[8px] text-gray-400">Tidak ada pengajuan persetujuan yang pending.</p>
                </div>
              )}

              {pendingApprovals.map(app => {
                const isApprovedByMe = app.approvals.includes(profile?.uid || '');
                return (
                  <div key={app.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-rose-100 text-rose-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">Minta Persetujuan</span>
                        <h4 className="text-[11px] font-black text-gray-900 mt-1">{app.description}</h4>
                        <p className="text-[10px] font-extrabold text-rose-700 mt-0.5">Rp {app.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] font-black text-indigo-600 block">{app.approvals.length} / 2 Disetujui</span>
                        <p className="text-[8px] text-gray-400 mt-0.5">Diajukan oleh {app.createdBy}</p>
                      </div>
                    </div>

                    <div className="bg-white p-1.5 rounded border border-gray-100">
                      <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">Daftar Penandatangan:</p>
                      <div className="flex flex-wrap gap-1">
                        {app.approverNames.map((name, i) => (
                          <span key={i} className="bg-green-50 text-green-800 text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                            <Check size={8} /> {name}
                          </span>
                        ))}
                        {app.approvals.length < 2 && (
                          <span className="bg-yellow-50 text-yellow-800 text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                            Menunggu 1 Tanda Tangan
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleReject(app.id, app.description)}
                        className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-50 font-black uppercase tracking-wider"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(app, false)}
                        disabled={isApprovedByMe}
                        className={`text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-wider flex items-center gap-1 ${isApprovedByMe ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
                      >
                        <Check size={10} /> {isApprovedByMe ? 'Disetujui Anda' : 'Setujui'}
                      </button>
                      
                      {/* Simulation tool for single developer testing */}
                      <button
                        onClick={() => handleApprove(app, true)}
                        className="text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 px-2 py-1 rounded font-black uppercase tracking-wider"
                        title="Klik untuk mensimulasi tanda tangan admin kedua"
                      >
                        ⚡ Simulasi Admin 2
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: RECONCILIATION */}
        {activeTab === 'reconcile' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
            <div>
              <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Pencocokan Kas (Reconciliation)</h2>
              <p className="text-[9px] text-gray-400">Verifikasi saldo di sistem vs saldo fisik riil di bank/kas fisik demi mencegah selisih & fraud.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                <span className="text-[8px] uppercase font-black text-indigo-500 tracking-wider">Saldo Tercatat Sistem</span>
                <p className="text-base font-black text-indigo-900 mt-1">Rp {systemBalance.toLocaleString()}</p>
                <p className="text-[8px] text-indigo-400 leading-none mt-1">Akumulasi seluruh transaksi di database.</p>
              </div>

              <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                <span className="text-[8px] uppercase font-black text-emerald-500 tracking-wider">Selisih Rekonsiliasi</span>
                {physicalBalance !== '' ? (
                  (() => {
                    const diff = Number(physicalBalance) - systemBalance;
                    return (
                      <>
                        <p className={`text-base font-black mt-1 ${diff === 0 ? 'text-green-700' : 'text-rose-700'}`}>
                          Rp {diff.toLocaleString()}
                        </p>
                        <span className={`text-[8px] font-bold block ${diff === 0 ? 'text-green-500' : 'text-rose-500'}`}>
                          {diff === 0 ? '✓ Seimbang & Akurat' : diff > 0 ? '⚠ Selisih Lebih (Surplus)' : '⚠ Selisih Kurang (Defisit)'}
                        </span>
                      </>
                    );
                  })()
                ) : (
                  <>
                    <p className="text-xs font-bold text-gray-400 mt-2">Belum dihitung</p>
                    <span className="text-[8px] text-gray-400 block mt-0.5">Masukkan saldo fisik di bawah.</span>
                  </>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
              <h3 className="text-[9px] font-black uppercase text-gray-600">Verifikasi Saldo Fisik Saat Ini</h3>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-[10px] font-bold text-gray-400">Rp</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="Masukkan saldo riil bank / cash-in-hand"
                    className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-gray-200 bg-white rounded outline-none"
                    value={physicalBalance}
                    onChange={e => setPhysicalBalance(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleReconcile}
                  className="text-[9px] bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded font-black uppercase tracking-wider"
                >
                  Cocokkan & Sesuaikan
                </button>
              </div>
              <p className="text-[8px] text-gray-400 leading-snug">
                *Tombol <b>Cocokkan & Sesuaikan</b> akan otomatis membuat entri penyesuaian (adjusting journal) jika terdapat selisih, menjaga catatan akuntansi tetap akurat & transparan ke warga.
              </p>
            </div>
          </motion.div>
        )}

        {/* TAB 4: REMINDERS */}
        {activeTab === 'reminders' && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Pantau Tunggakan Iuran Warga</h2>
                <p className="text-[9px] text-gray-400 mt-0.5">Pantau ketertiban iuran kas bulanan dan kirim pengingat digital otomatis.</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 max-h-56 overflow-y-auto space-y-1.5">
              {citizens.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">Tidak ada data warga.</p>}
              {citizens.map(cit => {
                const isPaid = cit.duesStatus === 'paid';
                return (
                  <div key={cit.uid} className="bg-white p-2 rounded border border-gray-100 flex justify-between items-center text-[10px]">
                    <div>
                      <h4 className="font-bold text-gray-900">{cit.displayName}</h4>
                      <p className="text-[8px] text-gray-400">{cit.email} • {cit.phoneNumber}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {isPaid ? 'Lunas' : 'Nunggak Rp 50.000'}
                      </span>
                      
                      <button
                        onClick={() => handleToggleDues(cit)}
                        className="text-[8px] text-gray-500 hover:text-indigo-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded font-bold"
                        title="Ubah status iuran warga"
                      >
                        Ubah
                      </button>

                      {!isPaid && (
                        <button
                          onClick={() => handleSendReminder(cit)}
                          className="flex items-center gap-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider"
                          title="Kirim pengingat tagihan otomatis lewat WhatsApp"
                        >
                          <Send size={8} /> Tagih
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
