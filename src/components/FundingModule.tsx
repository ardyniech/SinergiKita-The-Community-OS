import { useState, useEffect } from 'react';
import { Rocket, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { collection, addDoc, query, where, onSnapshot, orderBy, serverTimestamp, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FundingProjectCard } from './molecules/FundingProjectCard';
import { FundingForm } from './molecules/FundingForm';

export default function FundingModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', target: '', description: '', category: 'Bisnis' });

  useEffect(() => {
    if (!profile?.tenantId) return;
    return onSnapshot(query(collection(db, 'projects'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc')), (snap) => {
      setProjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleCreate = async () => {
    if (!profile?.tenantId || !newProject.title || submitting) return;
    setSubmitting(true);
    await addDoc(collection(db, 'projects'), { ...newProject, tenantId: profile.tenantId, uid: profile.uid, ownerName: profile.displayName || profile.email.split('@')[0], target: Number(newProject.target), current: 0, backers: 0, status: 'active', createdAt: serverTimestamp() });
    showToast("Proyek berhasil!"); setNewProject({ title: '', target: '', description: '', category: 'Bisnis' }); setShowAdd(false); setSubmitting(false);
  };

  const handleContribute = async (id: string) => {
    const amount = prompt("Jumlah modal (Rp):");
    if (!amount || isNaN(Number(amount))) return;
    await updateDoc(doc(db, 'projects', id), { current: increment(Number(amount)), backers: increment(1) });
    showToast("Terima kasih!");
  };

  if (loading) return <div className="p-8 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">Memuat...</div>;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Rocket size={24} /></div><div><h2 className="text-lg font-black text-gray-900 tracking-tight">Founding Bisnis</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Modal Bersama</p></div></div>
        <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100"><Plus size={20} /></button>
      </div>

      <AnimatePresence>{showAdd && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden"><FundingForm newProject={newProject} setNewProject={setNewProject} onSubmit={handleCreate} onCancel={() => setShowAdd(false)} submitting={submitting} /></motion.div>}</AnimatePresence>
      <div className="space-y-4">{projects.length === 0 && <p className="text-center text-[10px] text-gray-400 py-8 italic uppercase font-bold">Belum ada proyek aktif.</p>}{projects.map(p => <FundingProjectCard key={p.id} project={p} onContribute={handleContribute} />)}</div>
    </div>
  );
}
