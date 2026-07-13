import { useState, useEffect } from 'react';
import { PiggyBank, ArrowUpRight, Wallet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { KoperasiStatCard } from './molecules/KoperasiStatCard';
import { KoperasiTabs } from './molecules/KoperasiTabs';
import { KoperasiHistoryItem } from './molecules/KoperasiHistoryItem';

export default function KoperasiModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'save' | 'loan' | 'history'>('save');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    setError(null);
    return onSnapshot(
      query(collection(db, 'koperasi'), where('tenantId', '==', profile.tenantId), orderBy('timestamp', 'desc')), 
      (snap) => {
        setRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Koperasi subscription failed:", err);
        setError("Gagal memuat data koperasi dari database secara real-time.");
        setLoading(false);
      }
    );
  }, [profile?.tenantId]);

  const handleSubmit = async (type: 'deposit' | 'loan') => {
    if (!profile?.tenantId || !amount || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'koperasi'), { 
        tenantId: profile.tenantId, 
        uid: profile.uid, 
        userName: profile.displayName || profile.email.split('@')[0], 
        type, 
        amount: Number(amount), 
        note, 
        status: type === 'deposit' ? 'completed' : 'pending', 
        timestamp: serverTimestamp() 
      });
      showToast(type === 'deposit' ? "Setoran berhasil disimpan!" : "Pinjaman berhasil diajukan!");
      setAmount(''); 
      setNote('');
      if (type === 'loan') setActiveTab('history');
    } catch (err: any) {
      console.error("Koperasi submission failed:", err);
      showToast(`Gagal mengirim data. Silakan periksa koneksi Anda dan coba lagi. Error: ${err.message || 'offline'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const totalS = records.filter(r => r.type === 'deposit' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);
  const totalP = records.filter(r => r.type === 'loan' && r.status === 'completed').reduce((sum, r) => sum + r.amount, 0);

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-gray-100">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
        <span>Memuat data koperasi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-xs text-red-500 bg-white rounded-3xl border border-red-100 flex flex-col items-center gap-3 shadow-sm">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }} 
          className="px-4 py-2 bg-indigo-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-indigo-700 transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600"><PiggyBank size={24} /></div><div><h2 className="text-lg font-black text-gray-900 tracking-tight">Koperasi Komunitas</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Simpan Pinjam & Kesejahteraan</p></div></div>
      <div className="grid grid-cols-3 gap-3 mb-6"><KoperasiStatCard label="Total Simpanan" value={`Rp ${totalS.toLocaleString()}`} icon={PiggyBank} color="text-green-600" /><KoperasiStatCard label="Total Pinjaman" value={`Rp ${totalP.toLocaleString()}`} icon={ArrowUpRight} color="text-red-600" /><KoperasiStatCard label="Sisa SHU" value="Rp 0" icon={Wallet} color="text-blue-600" /></div>
      <KoperasiTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <AnimatePresence mode="wait"><motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
        {activeTab === 'save' && <div className="p-4 bg-green-50 rounded-2xl border border-green-100"><h3 className="text-xs font-bold text-green-800 mb-2 uppercase tracking-widest">Setoran Baru</h3><div className="space-y-3"><input type="number" inputMode="numeric" placeholder="Rp" className="w-full p-3 rounded-xl border border-green-200 text-sm outline-none" value={amount} onChange={e => setAmount(e.target.value)} /><button onClick={() => handleSubmit('deposit')} disabled={submitting} className="w-full py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">{submitting && <Loader2 size={14} className="animate-spin" />}Setor</button></div></div>}
        {activeTab === 'loan' && <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100"><h3 className="text-xs font-bold text-orange-800 mb-2 uppercase tracking-widest">Pinjaman Baru</h3><div className="space-y-3"><input type="number" inputMode="numeric" placeholder="Rp" className="w-full p-3 rounded-xl border border-orange-200 text-sm outline-none" value={amount} onChange={e => setAmount(e.target.value)} /><textarea placeholder="Alasan..." className="w-full p-3 rounded-xl border border-orange-200 text-sm h-20 outline-none" value={note} onChange={e => setNote(e.target.value)} /><button onClick={() => handleSubmit('loan')} disabled={submitting} className="w-full py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">{submitting && <Loader2 size={14} className="animate-spin" />}Ajukan</button></div></div>}
        {activeTab === 'history' && <div className="space-y-2">{records.length === 0 && <p className="text-center text-[10px] text-gray-400 py-4 italic">Belum ada transaksi.</p>}{records.map(h => <KoperasiHistoryItem key={h.id} record={h} />)}</div>}
      </motion.div></AnimatePresence>
    </div>
  );
}
