import { useState, useEffect } from 'react';
import { Rocket, Plus, Loader2, X } from 'lucide-react';
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
  const [contributingProject, setContributingProject] = useState<any | null>(null);
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [contributing, setContributing] = useState(false);

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
      showToast("Proyek berhasil dipublikasikan!"); 
      setNewProject({ title: '', target: '', description: '', category: 'Bisnis' }); 
      setShowAdd(false); 
    } catch (err: any) {
      console.error("Project creation failed:", err);
      showToast(`Gagal mempublikasikan proyek: ${err.message || 'offline'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenContribute = (project: any) => {
    setContributingProject(project);
    setContributionAmount('');
  };

  const handleContribute = async () => {
    if (!contributingProject || !contributionAmount || contributing) return;
    setContributing(true);
    try {
      const amount = Number(contributionAmount);
      if (isNaN(amount) || amount <= 0) {
        showToast("Jumlah modal tidak valid!");
        return;
      }
      await updateDoc(doc(db, 'projects', contributingProject.id), { 
        current: increment(amount), 
        backers: increment(1) 
      });
      showToast("Investasi berhasil disimpan! Terima kasih.");
      setContributingProject(null);
      setContributionAmount('');
    } catch (err: any) {
      console.error("Contribution failed:", err);
      showToast(`Gagal memproses investasi: ${err.message || 'offline'}`);
    } finally {
      setContributing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-gray-100">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat data proyek...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Rocket size={24} /></div><div><h2 className="text-lg font-black text-gray-900 tracking-tight">Founding Bisnis</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Modal Bersama</p></div></div>
        <button onClick={() => setShowAdd(!showAdd)} className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 min-h-[44px] min-w-[44px] flex items-center justify-center"><Plus size={20} /></button>
      </div>

      <AnimatePresence>{showAdd && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden"><FundingForm newProject={newProject} setNewProject={setNewProject} onSubmit={handleCreate} onCancel={() => setShowAdd(false)} submitting={submitting} /></motion.div>}</AnimatePresence>
      <div className="space-y-4">{projects.length === 0 && <p className="text-center text-[10px] text-gray-400 py-8 italic uppercase font-bold">Belum ada proyek aktif.</p>}{projects.map(p => <FundingProjectCard key={p.id} project={p} onContribute={() => handleOpenContribute(p)} />)}</div>

      <AnimatePresence>
        {contributingProject && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 max-w-sm w-full border border-gray-100 shadow-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-black uppercase text-gray-900">Investasi Proyek</h3>
                <button onClick={() => setContributingProject(null)} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[10px] text-gray-500 font-medium mb-3">
                Investasikan modal Anda ke dalam proyek <span className="font-bold text-gray-800">{contributingProject.title}</span>.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-[8px] font-bold uppercase text-gray-400 mb-1">Nominal Modal (Rp)</label>
                  <input 
                    type="number" 
                    inputMode="numeric" 
                    placeholder="Masukkan jumlah modal" 
                    className="w-full p-3 rounded-xl border border-gray-200 text-xs outline-none focus:ring-2 focus:ring-blue-400"
                    value={contributionAmount} 
                    onChange={e => setContributionAmount(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleContribute} 
                  disabled={contributing || !contributionAmount}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all min-h-[44px]"
                >
                  {contributing && <Loader2 size={12} className="animate-spin" />}
                  {contributing ? 'MEMPROSES...' : 'KIRIM MODAL'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
