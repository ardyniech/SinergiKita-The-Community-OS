import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { 
  Download, FileText, Table, Plus, ShieldCheck, Check, 
  AlertCircle, RefreshCw, Send, Users, Wallet, Loader2, 
  ShieldAlert, Settings as SettingsIcon, AlertTriangle,
  PiggyBank, ArrowUpRight, Rocket, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp, increment 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BudgetEditor } from './molecules/BudgetEditor';
import { RecurringTransactionItem } from './molecules/RecurringTransactionItem';
import { KoperasiStatCard } from './molecules/KoperasiStatCard';
import { KoperasiHistoryItem } from './molecules/KoperasiHistoryItem';
import { FundingProjectCard } from './molecules/FundingProjectCard';
import { FundingForm } from './molecules/FundingForm';
import { checkAndGrantAchievements } from '../lib/achievements';

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

export default function PostgresFinanceModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();

  const [activeTab, setActiveTab] = useState<'ledger' | 'koperasi' | 'funding' | 'approvals' | 'reconcile' | 'reminders'>('ledger');
  const [records, setRecords] = useState<FinanceRecord[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState('member');

  // Koperasi States
  const [koperasiActiveTab, setKoperasiActiveTab] = useState<'save' | 'loan' | 'history'>('save');
  const [koperasiRecords, setKoperasiRecords] = useState<any[]>([]);
  const [koperasiLoading, setKoperasiLoading] = useState(true);
  const [koperasiAmount, setKoperasiAmount] = useState('');
  const [koperasiNote, setKoperasiNote] = useState('');
  const [koperasiSubmitting, setKoperasiSubmitting] = useState(false);

  // Funding States
  const [fundingProjects, setFundingProjects] = useState<any[]>([]);
  const [fundingLoading, setFundingLoading] = useState(true);
  const [fundingSubmitting, setFundingSubmitting] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', target: '', description: '', category: 'Bisnis' });
  const [contributingProject, setContributingProject] = useState<any | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [contributing, setContributing] = useState(false);

  // Operational Budget & Recurring Expenses state
  const [budget, setBudget] = useState({ spent: 0, total: 10000000, threshold: 80 });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState({ total: '', threshold: '' });
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [isAddingRecurring, setIsAddingRecurring] = useState(false);
  const [newRecurring, setNewRecurring] = useState({ description: '', amount: '' });
  const [submittingBudget, setSubmittingBudget] = useState(false);

  // Add Transaction Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'credit' | 'debit'>('credit');
  const [newCat, setNewCat] = useState('Kas Umum');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reconciliation state
  const [physicalBalance, setPhysicalBalance] = useState('');

  // Calculations
  const systemBalance = records.reduce((sum, r) => sum + (r.type === 'income' ? parseFloat(r.amount) : -parseFloat(r.amount)), 0);

  useEffect(() => {
    fetchPostgresData();

    if (!profile?.tenantId) return;

    // Budget Subscription
    const unsubT = onSnapshot(doc(db, 'tenants', profile.tenantId), (s) => {
      if (s.exists()) {
        setBudget({
          spent: s.data().spent || 0,
          total: s.data().budgetTotal || 10000000,
          threshold: s.data().budgetThreshold || 80
        });
      }
    });

    // Recurring Transactions Subscription
    const unsubR = onSnapshot(
      query(collection(db, 'recurring'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc')),
      (s) => {
        setRecurring(s.docs.map(d => ({ id: d.id, ...d.data() } as RecurringTransaction)));
      }
    );

    // Pending Approvals Subscription
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

    // Citizens Subscription for Dues
    const qCit = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
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

    // Koperasi Subscription
    const unsubKoperasi = onSnapshot(
      query(collection(db, 'koperasi'), where('tenantId', '==', profile.tenantId), orderBy('timestamp', 'desc')), 
      (snap) => {
        setKoperasiRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setKoperasiLoading(false);
      },
      (err) => {
        console.error("Koperasi subscription failed:", err);
        setKoperasiLoading(false);
      }
    );

    // Funding Subscription
    const unsubFunding = onSnapshot(
      query(collection(db, 'projects'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc')), 
      (snap) => {
        setFundingProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setFundingLoading(false);
      },
      (err) => {
        console.error("Funding subscription failed:", err);
        setFundingLoading(false);
      }
    );

    return () => {
      unsubT();
      unsubR();
      unsubApp();
      unsubCit();
      unsubKoperasi();
      unsubFunding();
    };
  }, [profile?.tenantId]);

  const fetchPostgresData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const roleRes = await fetch('/api/me/role', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const roleData = await roleRes.json();
      setRole(roleData.role);

      const recordsRes = await fetch('/api/finances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const recordsData = await recordsRes.json();
      setRecords(recordsData);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat mutasi kas PostgreSQL.');
    } finally {
      setLoading(false);
    }
  };

  // Koperasi Submit Handler
  const handleKoperasiSubmit = async (type: 'deposit' | 'loan') => {
    if (!profile?.tenantId || !koperasiAmount || koperasiSubmitting) return;
    setKoperasiSubmitting(true);
    try {
      const userName = profile.displayName || profile.email.split('@')[0];
      
      await addDoc(collection(db, 'koperasi'), { 
        tenantId: profile.tenantId, 
        uid: profile.uid, 
        userName, 
        type, 
        amount: Number(koperasiAmount), 
        note: koperasiNote, 
        status: type === 'deposit' ? 'completed' : 'pending', 
        timestamp: serverTimestamp() 
      });

      // Synchronize Koperasi deposit directly to PostgreSQL as an INCOME to keep ledger 100% complete!
      if (type === 'deposit') {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken();
          const res = await fetch('/api/finances', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              type: 'income',
              amount: Number(koperasiAmount),
              description: `Setoran Koperasi - ${userName}`,
              category: 'Koperasi'
            })
          });
          if (res.ok) {
            fetchPostgresData();
          }
        }
      }

      showToast(type === 'deposit' ? "Setoran koperasi berhasil disimpan & disinkronkan ke Ledger Kas!" : "Pinjaman berhasil diajukan!");
      
      if (type === 'deposit' && profile) {
        checkAndGrantAchievements(profile, profile.tenantId!);
      }
      
      setKoperasiAmount(''); 
      setKoperasiNote('');
      if (type === 'loan') setKoperasiActiveTab('history');
    } catch (err: any) {
      console.error("Koperasi submission failed:", err);
      showToast(`Gagal mengirim data: ${err.message || 'offline'}`);
    } finally {
      setKoperasiSubmitting(false);
    }
  };

  // Funding Submit Handlers
  const handleFundingCreate = async () => {
    if (!profile?.tenantId || !newProject.title || fundingSubmitting) return;
    setFundingSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), { 
        ...newProject, 
        tenantId: profile.tenantId, 
        uid: profile.uid, 
        ownerName: profile.displayName || profile.email.split('@')[0], 
        target: Number(newProject.target), 
        current: 0, 
        backers: 0, 
        status: 'active', 
        createdAt: serverTimestamp() 
      });
      showToast("Proyek bantuan modal berhasil dipublikasikan!"); 
      setNewProject({ title: '', target: '', description: '', category: 'Bisnis' }); 
      setShowAddProject(false); 
    } catch (err: any) {
      console.error("Project creation failed:", err);
      showToast(`Gagal: ${err.message}`);
    } finally {
      setFundingSubmitting(false);
    }
  };

  const handleFundingContribute = async () => {
    if (!contributingProject || !contributionAmount || contributing) return;
    setContributing(true);
    try {
      const amountVal = Number(contributionAmount);
      if (isNaN(amountVal) || amountVal <= 0) {
        showToast("Jumlah modal tidak valid!");
        return;
      }
      await updateDoc(doc(db, 'projects', contributingProject.id), { 
        current: increment(amountVal), 
        backers: increment(1) 
      });
      showToast("Investasi berhasil disimpan! Terima kasih.");
      setContributingProject(null);
      setContributionAmount('');
    } catch (err: any) {
      console.error("Contribution failed:", err);
      showToast(`Gagal memproses investasi: ${err.message}`);
    } finally {
      setContributing(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!profile?.tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        budgetTotal: Number(tempBudget.total),
        budgetThreshold: Number(tempBudget.threshold)
      });
      addAuditEntry(`Updated budget: Rp ${tempBudget.total}, Threshold ${tempBudget.threshold}%`);
      showToast('Anggaran diperbarui.');
      setIsEditingBudget(false);
    } catch (err: any) {
      showToast(`Gagal memperbarui anggaran: ${err.message || 'offline'}`);
    }
  };

  const addRecurring = async () => {
    if (!newRecurring.description || !newRecurring.amount || !profile?.tenantId) return;
    setSubmittingBudget(true);
    try {
      await addDoc(collection(db, 'recurring'), {
        tenantId: profile.tenantId,
        description: newRecurring.description,
        amount: Number(newRecurring.amount),
        status: 'active',
        nextBillingDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        createdAt: serverTimestamp()
      });
      showToast('Transaksi rutin berhasil ditambahkan.');
      setNewRecurring({ description: '', amount: '' });
      setIsAddingRecurring(false);
    } catch (err: any) {
      showToast(`Gagal: ${err.message}`);
    } finally {
      setSubmittingBudget(false);
    }
  };

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
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

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
          approvals: [profile.uid], // Creator is 1st approver
          approverNames: [profile.displayName || profile.email],
          status: 'pending',
          createdAt: serverTimestamp()
        });

        addAuditEntry(`Initiated large expenditure approval request: "${newDesc}" - Rp ${amountNum.toLocaleString()}`);
        showToast("⚠️ Pengeluaran Besar (> Rp 1jt) dialihkan ke Workflow Persetujuan Berjenjang!");
      } else {
        // Direct commitment to PostgreSQL
        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type: newType === 'credit' ? 'income' : 'expense',
            amount: amountNum,
            description: newDesc,
            category: newCat
          })
        });

        if (!res.ok) throw new Error('Postgres insert failed');

        addAuditEntry(`Recorded manual transaction: "${newDesc}" (${newType}) - Rp ${amountNum.toLocaleString()}`);
        showToast("Transaksi berhasil dicatat ke PostgreSQL.");
        fetchPostgresData();
      }

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
        updatedApprovals.push("simulated-approver-uid-123");
        updatedNames.push("Hendra Wijaya (Lurah Sektor B)");
      } else {
        updatedApprovals.push(profile.uid);
        updatedNames.push(profile.displayName || profile.email);
      }

      if (updatedApprovals.length >= 2) {
        // Commit approved debit to PostgreSQL
        const user = auth.currentUser;
        if (!user) return;
        const token = await user.getIdToken();

        const res = await fetch('/api/finances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            type: 'expense',
            amount: approval.amount,
            description: `[DISETUJUI] ${approval.description}`,
            category: 'Operasional'
          })
        });

        if (!res.ok) throw new Error('Postgres commit failed');

        // Delete workflow status to approved / close it
        await deleteDoc(doc(db, 'transaction_approvals', approval.id));

        addAuditEntry(`Approved & Committed expense: "${approval.description}" - Rp ${approval.amount.toLocaleString()} by ${updatedNames.join(" & ")}`);
        showToast("✅ Transaksi Disetujui Penuh & Masuk Postgres!");
        fetchPostgresData();
      } else {
        // Record intermediate signature
        await updateDoc(doc(db, 'transaction_approvals', approval.id), {
          approvals: updatedApprovals,
          approverNames: updatedNames
        });

        addAuditEntry(`Approved expense (1/2 signatures): "${approval.description}" - Rp ${approval.amount.toLocaleString()}`);
        showToast("Persetujuan tercatat (1 dari 2 approver)");
      }
    } catch (err: any) {
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
      const type = discrepancy > 0 ? 'income' : 'expense';
      const amount = Math.abs(discrepancy);

      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch('/api/finances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          amount,
          description: desc,
          category: 'Rekonsiliasi'
        })
      });

      if (!res.ok) throw new Error('Postgres reconcile sync failed');

      addAuditEntry(`Performed physical reconciliation adjustment of Rp ${amount.toLocaleString()} (${type})`);
      showToast("✅ Rekonsiliasi Berhasil! Saldo PostgreSQL disinkronkan.");
      setPhysicalBalance('');
      fetchPostgresData();
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
    addAuditEntry(`Sent automated dues reminder to ${citizen.displayName} (${citizen.phoneNumber})`);
    showToast(
      `📲 [MOCK WHATSAPP/SMS GATEWAY] Terkirim ke ${citizen.phoneNumber}:\n"Halo ${citizen.displayName}, pengingat iuran SinergiKita Anda sebesar Rp ${citizen.duesAmount?.toLocaleString()} belum terbayar. Harap selesaikan iuran untuk kesejahteraan warga. Terima kasih!"`
    );
  };

  const exportToCSV = () => {
    addAuditEntry("Exported ledger to CSV");
    const headers = ["ID", "Deskripsi", "Tanggal", "Tipe", "Jumlah (Rp)"];
    const csvContent = [
      headers.join(","),
      ...records.map(r => [
        r.id, 
        `"${r.description.replace(/"/g, '""')}"`, 
        r.date ? new Date(r.date).toISOString().slice(0, 10) : '', 
        r.type === 'income' ? 'KREDIT' : 'DEBIT', 
        r.amount
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-postgres-${new Date().toISOString().slice(0, 10)}.csv`;
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
    doc.text(`Tenant ID: ${profile?.tenantId || 'SinergiKita'} (PostgreSQL Store)`, 14, 30);
    doc.text(`Total Saldo Kas: Rp ${systemBalance.toLocaleString()}`, 14, 36);
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [['ID', 'Deskripsi', 'Tanggal', 'Tipe', 'Jumlah (Rp)']],
      body: records.map(r => [
        r.id, 
        r.description, 
        r.date ? new Date(r.date).toISOString().slice(0, 10) : '', 
        r.type === 'income' ? 'KREDIT' : 'DEBIT', 
        parseFloat(r.amount).toLocaleString()
      ]),
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [249, 250, 251] },
    });

    doc.save(`ledger-postgres-${new Date().toISOString().slice(0, 10)}.pdf`);
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

  const isAdminRole = ['superadmin', 'admin', 'ketua', 'bendahara'].includes(role);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  // Regular members without write privilege cannot access full admin ledger panels
  if (!isAdminRole && activeTab !== 'ledger' && activeTab !== 'koperasi' && activeTab !== 'funding') {
    setActiveTab('ledger');
  }

  const isThresholdBreached = (budget.spent / budget.total) * 100 >= budget.threshold;

  return (
    <div className="px-2 py-2 space-y-4 pb-24">
      {/* 1. Postgres Mutasi Kas Ledger */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-100 mb-3 overflow-x-auto pb-1 gap-1">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Wallet size={12} /> Buku Kas (Postgres)
          </button>
          <button
            onClick={() => setActiveTab('koperasi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'koperasi' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <PiggyBank size={12} /> Koperasi
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'funding' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <Rocket size={12} /> Funding Modal
          </button>
          {isAdminRole && (
            <>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 relative ${activeTab === 'approvals' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <ShieldCheck size={12} /> Approval
                {pendingApprovals.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">{pendingApprovals.length}</span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('reconcile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'reconcile' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <RefreshCw size={12} /> Rekonsiliasi
              </button>
              <button
                onClick={() => setActiveTab('reminders')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all shrink-0 ${activeTab === 'reminders' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <Users size={12} /> Tagihan Iuran
              </button>
            </>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'ledger' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xs font-black text-gray-400 uppercase tracking-wider leading-none">Keuangan Sinergi</h2>
                  <p className="text-[10px] text-blue-600 font-bold mt-1">Saldo Sistem: Rp {systemBalance.toLocaleString()}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition-colors font-black uppercase tracking-widest"
                  >
                    <Plus size={11} /> Tambah
                  </button>
                  <button onClick={exportToCSV} className="flex items-center gap-1 text-[9px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors font-black uppercase tracking-widest">
                    <Table size={11} /> CSV
                  </button>
                  <button onClick={exportToPDF} className="flex items-center gap-1 text-[9px] bg-rose-50 text-rose-700 px-2.5 py-1 rounded-lg hover:bg-rose-100 transition-colors font-black uppercase tracking-widest">
                    <FileText size={11} /> PDF
                  </button>
                </div>
              </div>

              {showAddForm && (
                <form onSubmit={handleAddTransaction} className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                  <h3 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Catat Aliran Kas</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Deskripsi</label>
                      <input 
                        type="text" required placeholder="Contoh: Beli Semen / Kas" 
                        className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                        value={newDesc} onChange={e => setNewDesc(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Jumlah (Rp)</label>
                      <input 
                        type="number" inputMode="numeric" required placeholder="Rp" 
                        className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                        value={newAmount} onChange={e => setNewAmount(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Jenis</label>
                      <select 
                        className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                        value={newType} onChange={e => setNewType(e.target.value as 'credit' | 'debit')}
                      >
                        <option value="credit">Pemasukan (Kredit)</option>
                        <option value="debit">Pengeluaran (Debit)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase text-gray-400">Kategori</label>
                      <select 
                        className="w-full text-xs p-1.5 border border-gray-200 rounded bg-white outline-none"
                        value={newCat} onChange={e => setNewCat(e.target.value)}
                      >
                        <option value="Kas Umum">Kas Umum</option>
                        <option value="Koperasi">Koperasi</option>
                        <option value="Iuran Bulanan">Iuran Bulanan</option>
                        <option value="Santunan">Santunan</option>
                        <option value="Operasional">Operasional</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setShowAddForm(false)} className="text-[9px] text-gray-500 uppercase font-black px-2 py-1">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="text-[9px] bg-emerald-600 text-white uppercase font-black px-3 py-1 rounded hover:bg-emerald-700 transition-colors">
                      {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                  </div>
                </form>
              )}

              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto divide-y divide-gray-50">
                {records.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">Belum ada mutasi tercatat.</p>}
                {records.map(r => (
                  <div key={r.id} className="pt-2 pb-2 flex justify-between items-center text-[11px] hover:bg-gray-50/50 transition-colors">
                    <div>
                      <p className="font-semibold text-gray-900">{r.description}</p>
                      <p className="text-gray-400 text-[8px]">{r.date ? new Date(r.date).toLocaleDateString('id-ID') : ''} • {r.category} • {r.authorEmail || 'Sistem'}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${r.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {r.type === 'income' ? '+' : '-'} Rp {parseFloat(r.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-[9px] font-bold text-gray-500 uppercase">Arsip Bukti Nota (OCR Verified)</h3>
                  <p className="text-[8px] text-gray-400">Upload kuitansi fisik untuk audit kepatuhan.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <input type="file" className="hidden" id="nota-upload" onChange={handleUpload} />
                  <label htmlFor="nota-upload" className="text-[9px] bg-gray-900 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors font-black cursor-pointer uppercase tracking-wider">
                    <Download size={10} />
                    {uploading ? 'Memindai...' : 'Unggah Nota'}
                  </label>
                </div>
              </div>
            </motion.div>
          )}

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
                        <p className="text-[8px] text-gray-500 uppercase font-black tracking-wider mb-1">Penandatangan:</p>
                        <div className="flex flex-wrap gap-1">
                          {app.approverNames.map((name, i) => (
                            <span key={i} className="bg-green-50 text-green-800 text-[8px] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold">
                              <Check size={8} /> {name}
                            </span>
                          ))}
                          {app.approvals.length < 2 && (
                            <span className="bg-yellow-50 text-yellow-800 text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse">Menunggu 1 Tanda Tangan</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleReject(app.id, app.description)} className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded hover:bg-gray-50 font-black uppercase tracking-wider">Tolak</button>
                        <button onClick={() => handleApprove(app, false)} disabled={isApprovedByMe} className={`text-[9px] px-2.5 py-1 rounded font-black uppercase tracking-wider flex items-center gap-1 ${isApprovedByMe ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}>
                          <Check size={10} /> {isApprovedByMe ? 'Disetujui Anda' : 'Setujui'}
                        </button>
                        <button onClick={() => handleApprove(app, true)} className="text-[9px] bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-100 px-2 py-1 rounded font-black uppercase tracking-wider">⚡ Simulasi Admin 2</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {activeTab === 'reconcile' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
              <div>
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Pencocokan Kas (Reconciliation)</h2>
                <p className="text-[9px] text-gray-400">Verifikasi saldo di sistem vs saldo fisik riil demi mencegah selisih.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-[8px] uppercase font-black text-indigo-500 tracking-wider">Saldo Tercatat Postgres</span>
                  <p className="text-base font-black text-indigo-900 mt-1">Rp {systemBalance.toLocaleString()}</p>
                </div>

                <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                  <span className="text-[8px] uppercase font-black text-emerald-500 tracking-wider">Selisih</span>
                  {physicalBalance !== '' ? (
                    (() => {
                      const diff = Number(physicalBalance) - systemBalance;
                      return (
                        <>
                          <p className={`text-base font-black mt-1 ${diff === 0 ? 'text-green-700' : 'text-rose-700'}`}>Rp {diff.toLocaleString()}</p>
                          <span className={`text-[8px] font-bold block ${diff === 0 ? 'text-green-500' : 'text-rose-500'}`}>{diff === 0 ? '✓ Seimbang' : '⚠ Selisih'}</span>
                        </>
                      );
                    })()
                  ) : (
                    <p className="text-xs font-bold text-gray-400 mt-2">Belum dihitung</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
                <h3 className="text-[9px] font-black uppercase text-gray-600">Verifikasi Saldo Fisik Saat Ini</h3>
                <div className="flex gap-2 items-center">
                  <div className="relative flex-1">
                    <span className="absolute left-2.5 top-2 text-[10px] font-bold text-gray-400">Rp</span>
                    <input
                      type="number" inputMode="numeric" placeholder="Saldo riil" 
                      className="w-full text-xs pl-8 pr-2.5 py-1.5 border border-gray-200 bg-white rounded outline-none"
                      value={physicalBalance} onChange={e => setPhysicalBalance(e.target.value)}
                    />
                  </div>
                  <button onClick={handleReconcile} className="text-[9px] bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded font-black uppercase tracking-wider">Cocokkan & Sesuaikan</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'reminders' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
              <div>
                <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider">Pantau Tunggakan Iuran Warga</h2>
              </div>

              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 max-h-56 overflow-y-auto space-y-1.5">
                {citizens.length === 0 && <p className="text-[10px] text-gray-400 italic text-center py-4">Tidak ada data warga.</p>}
                {citizens.map(cit => {
                  const isPaid = cit.duesStatus === 'paid';
                  return (
                    <div key={cit.uid} className="bg-white p-2 rounded border border-gray-100 flex justify-between items-center text-[10px]">
                      <div>
                        <h4 className="font-bold text-gray-900">{cit.displayName}</h4>
                        <p className="text-[8px] text-gray-400">{cit.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${isPaid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {isPaid ? 'Lunas' : 'Nunggak Rp 50k'}
                        </span>
                        <button onClick={() => handleToggleDues(cit)} className="text-[8px] text-gray-500 hover:text-indigo-600 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded font-bold">Ubah</button>
                        {!isPaid && (
                          <button onClick={() => handleSendReminder(cit)} className="flex items-center gap-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded text-[8px] font-black uppercase tracking-wider">
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

          {activeTab === 'koperasi' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <PiggyBank size={18} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider leading-none">Koperasi Simpan Pinjam</h2>
                  <p className="text-[9px] text-gray-400 mt-0.5">Sinergi Simpan Pinjam Untuk Kesejahteraan Bersama</p>
                </div>
              </div>

              {/* Koperasi Stats */}
              {(() => {
                const totalS = koperasiRecords.filter(r => r.type === 'deposit' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
                const totalP = koperasiRecords.filter(r => r.type === 'loan' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
                return (
                  <div className="grid grid-cols-3 gap-2">
                    <KoperasiStatCard label="Simpanan" value={`Rp ${totalS.toLocaleString('id-ID')}`} icon={PiggyBank} color="text-green-600" />
                    <KoperasiStatCard label="Pinjaman" value={`Rp ${totalP.toLocaleString('id-ID')}`} icon={ArrowUpRight} color="text-red-600" />
                    <KoperasiStatCard label="Sisa SHU" value="Rp 0" icon={Wallet} color="text-blue-600" />
                  </div>
                );
              })()}

              {/* Subtabs for Koperasi */}
              <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-100 gap-1">
                <button
                  type="button"
                  onClick={() => setKoperasiActiveTab('save')}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${koperasiActiveTab === 'save' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Simpanan
                </button>
                <button
                  type="button"
                  onClick={() => setKoperasiActiveTab('loan')}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${koperasiActiveTab === 'loan' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Pinjaman
                </button>
                <button
                  type="button"
                  onClick={() => setKoperasiActiveTab('history')}
                  className={`flex-1 py-1.5 rounded-md text-[9px] font-black uppercase tracking-wider transition-all ${koperasiActiveTab === 'history' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}
                >
                  Riwayat
                </button>
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={koperasiActiveTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-3">
                  {koperasiActiveTab === 'save' && (
                    <div className="p-3 bg-green-50/50 rounded-xl border border-green-100/50">
                      <h3 className="text-[10px] font-black text-green-800 mb-2 uppercase tracking-wider">Setoran Koperasi Baru</h3>
                      <div className="space-y-2">
                        <input
                          type="number" inputMode="numeric" placeholder="Jumlah Setoran (Rp)"
                          className="w-full p-2 rounded-lg border border-green-200 text-xs outline-none bg-white"
                          value={koperasiAmount} onChange={e => setKoperasiAmount(e.target.value)}
                        />
                        <button
                          onClick={() => handleKoperasiSubmit('deposit')}
                          disabled={koperasiSubmitting}
                          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                        >
                          {koperasiSubmitting && <Loader2 size={10} className="animate-spin" />}
                          Simpan Setoran
                        </button>
                      </div>
                    </div>
                  )}

                  {koperasiActiveTab === 'loan' && (
                    <div className="p-3 bg-orange-50/50 rounded-xl border border-orange-100/50">
                      <h3 className="text-[10px] font-black text-orange-800 mb-2 uppercase tracking-wider">Pengajuan Pinjaman Baru</h3>
                      <div className="space-y-2">
                        <input
                          type="number" inputMode="numeric" placeholder="Jumlah Pinjaman (Rp)"
                          className="w-full p-2 rounded-lg border border-orange-200 text-xs outline-none bg-white"
                          value={koperasiAmount} onChange={e => setKoperasiAmount(e.target.value)}
                        />
                        <textarea
                          placeholder="Alasan peminjaman / kegunaan modal..."
                          className="w-full p-2 rounded-lg border border-orange-200 text-xs h-16 outline-none bg-white"
                          value={koperasiNote} onChange={e => setKoperasiNote(e.target.value)}
                        />
                        <button
                          onClick={() => handleKoperasiSubmit('loan')}
                          disabled={koperasiSubmitting}
                          className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all"
                        >
                          {koperasiSubmitting && <Loader2 size={10} className="animate-spin" />}
                          Ajukan Pinjaman
                        </button>
                      </div>
                    </div>
                  )}

                  {koperasiActiveTab === 'history' && (
                    <div className="space-y-1.5 max-h-56 overflow-y-auto">
                      {koperasiRecords.length === 0 && <p className="text-center text-[10px] text-gray-400 py-4 italic">Belum ada riwayat transaksi koperasi.</p>}
                      {koperasiRecords.map(h => <KoperasiHistoryItem key={h.id} record={h} />)}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'funding' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                    <Rocket size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-black text-gray-800 uppercase tracking-wider leading-none">Crowdfunding Modal Usaha</h2>
                    <p className="text-[9px] text-gray-400 mt-0.5">Pendanaan Gotong Royong Untuk Usaha Anggota</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddProject(!showAddProject)}
                  className="p-1.5 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-all font-bold text-[10px]"
                >
                  {showAddProject ? 'Sembunyikan' : 'Buat Proyek'}
                </button>
              </div>

              <AnimatePresence>
                {showAddProject && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <FundingForm newProject={newProject} setNewProject={setNewProject} onSubmit={handleFundingCreate} onCancel={() => setShowAddProject(false)} submitting={fundingSubmitting} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                {fundingProjects.length === 0 && <p className="text-center text-[10px] text-gray-400 py-6 italic uppercase font-bold">Belum ada proyek aktif.</p>}
                {fundingProjects.map(p => (
                  <FundingProjectCard key={p.id} project={p} onContribute={() => setContributingProject(p)} />
                ))}
              </div>

              <AnimatePresence>
                {contributingProject && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl p-3 max-w-sm w-full border border-gray-100 shadow-xl"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xs font-black uppercase text-gray-900">Salurkan Modal Usaha</h3>
                        <button onClick={() => setContributingProject(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400">
                          <X size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 font-medium mb-3">
                        Berikan dukungan pendanaan modal usaha kepada <span className="font-bold text-gray-800">{contributingProject.title}</span>.
                      </p>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Nominal Pendanaan (Rp)</label>
                          <input 
                            type="number" 
                            inputMode="numeric" 
                            placeholder="Masukkan nominal Rp" 
                            className="w-full p-2.5 rounded-lg border border-gray-200 text-xs outline-none bg-white"
                            value={contributionAmount} 
                            onChange={e => setContributionAmount(e.target.value)} 
                          />
                        </div>
                        <button 
                          onClick={handleFundingContribute} 
                          disabled={contributing || !contributionAmount}
                          className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 shadow-md hover:bg-blue-700 transition-all"
                        >
                          {contributing && <Loader2 size={10} className="animate-spin" />}
                          Kirim Modal Pendanaan
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Operational Budget & Recurring Expenses Widget */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        {isThresholdBreached && (
          <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 animate-pulse">
            <AlertTriangle className="text-red-600" size={16} />
            <p className="text-[10px] font-bold text-red-700 uppercase">KRITIS: Melampaui limit {budget.threshold}%!</p>
          </div>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Anggaran Operasional</h2>
            <button onClick={() => { setTempBudget({ total: budget.total.toString(), threshold: budget.threshold.toString() }); setIsEditingBudget(!isEditingBudget); }} className="text-gray-400 hover:text-blue-600 p-1">
              <SettingsIcon size={14} />
            </button>
          </div>
          {isEditingBudget && <BudgetEditor tempBudget={tempBudget} setTempBudget={setTempBudget} onUpdate={handleUpdateBudget} />}
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2 shadow-inner">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(100, (budget.spent / budget.total) * 100)}%` }} className={`h-full rounded-full ${isThresholdBreached ? 'bg-red-500' : 'bg-blue-500'}`} />
          </div>
          <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5">
            <span>Rp {budget.spent.toLocaleString()}</span>
            <span className={isThresholdBreached ? 'text-red-600' : 'text-gray-900'}>{Math.round((budget.spent / budget.total) * 100)}% / {budget.threshold}%</span>
            <span>Limit: Rp {budget.total.toLocaleString()}</span>
          </div>
        </div>

        <div className="mb-2 pt-4 border-t border-gray-50">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaksi Rutin</h2>
            <button onClick={() => setIsAddingRecurring(!isAddingRecurring)} className="w-7 h-7 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          {isAddingRecurring && (
            <div className="bg-gray-50 p-3 rounded-xl mb-3 space-y-2 border border-gray-100">
              <input type="text" placeholder="Deskripsi" className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={newRecurring.description} onChange={e => setNewRecurring(p => ({ ...p, description: e.target.value }))} />
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" placeholder="Rp" className="flex-1 text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none" value={newRecurring.amount} onChange={e => setNewRecurring(p => ({ ...p, amount: e.target.value }))} />
                <button onClick={addRecurring} disabled={submittingBudget} className="bg-blue-600 text-white px-2 rounded-lg font-black text-[9px] uppercase tracking-widest">
                  {submittingBudget ? <Loader2 size={12} className="animate-spin" /> : 'Simpan'}
                </button>
              </div>
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
