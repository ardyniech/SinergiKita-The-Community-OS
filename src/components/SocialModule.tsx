import { useState, useEffect } from 'react';
import { SocialAlert, Proposal } from '../types';
import Voting from './Voting';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, increment, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Heart, Plus, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SocialModule() {
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const { profile } = useAuth();
  
  const [alerts, setAlerts] = useState<SocialAlert[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    // Listen for Social Alerts (Info Musibah / Santunan)
    const qAlerts = query(
      collection(db, 'social_alerts'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(qAlerts, (snap) => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() } as SocialAlert)));
      setLoading(false);
    });

    // Listen for Proposals (Voting)
    const qProps = query(
      collection(db, 'proposals'), 
      where('tenantId', '==', profile.tenantId)
    );
    const unsubProps = onSnapshot(qProps, (snap) => {
      setProposals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Proposal)));
    });

    return () => {
      unsubAlerts();
      unsubProps();
    };
  }, [profile?.tenantId, profile?.isApproved]);

  const handleHelp = async (alertId: string, title: string) => {
    showToast(`Terima kasih telah menawarkan bantuan untuk "${title}".`);
    addAuditEntry(`Offered help: ${title}`);
    try {
      await updateDoc(doc(db, 'social_alerts', alertId), {
        helpers: increment(1)
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.title || !newAlert.description || !profile?.tenantId) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'social_alerts'), {
        tenantId: profile.tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email.split('@')[0],
        title: newAlert.title,
        description: newAlert.description,
        severity: 'medium',
        helpers: 0,
        createdAt: serverTimestamp()
      });
      addAuditEntry(`Published social info: ${newAlert.title}`);
      showToast("Info santunan dipublikasikan.");
      setNewAlert({ title: '', description: '' });
      setShowAddAlert(false);
    } catch (err) {
      showToast("Gagal memublikasikan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (id: string, type: 'yes' | 'no') => {
    try {
      const proposal = proposals.find(p => p.id === id);
      await updateDoc(doc(db, 'proposals', id), {
        [type === 'yes' ? 'yesVotes' : 'noVotes']: increment(1)
      });
      addAuditEntry(`Voted ${type.toUpperCase()} on proposal: ${proposal?.title || id}`);
      showToast("Vote berhasil dicatat.");
    } catch (err) {
      showToast("Gagal mencatat vote.");
    }
  };

  if (loading) return <div className="p-8 text-center text-[10px] text-gray-400">Memuat modul sosial...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Santunan & Kepedulian</h2>
          <p className="text-lg font-black text-gray-900">Sinergi Sosial</p>
        </div>
        <button 
          onClick={() => setShowAddAlert(!showAddAlert)}
          className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pencapaian Komunitas</h3>
          <span className="text-[10px] font-black text-rose-600 uppercase">Target: Rp 10jt</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2 shadow-inner">
          <div className="h-full bg-rose-500 rounded-full transition-all duration-1000" style={{ width: '72%' }} />
        </div>
        <div className="flex justify-between items-center">
          <p className="text-[9px] font-bold text-gray-500 uppercase">Total Santunan Tersalurkan</p>
          <p className="text-[10px] font-black text-gray-900">Rp 7.200.000 (72%)</p>
        </div>
      </div>

      <AnimatePresence>
        {showAddAlert && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-50 p-3 rounded-xl mb-4 space-y-2 border border-rose-100 overflow-hidden"
          >
            <input 
              type="text" 
              placeholder="Judul" 
              className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-400"
              value={newAlert.title}
              onChange={e => setNewAlert({...newAlert, title: e.target.value})}
            />
            <textarea 
              placeholder="Deskripsi..." 
              className="w-full text-xs p-2.5 bg-white border border-rose-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-400 h-16 resize-none"
              value={newAlert.description}
              onChange={e => setNewAlert({...newAlert, description: e.target.value})}
            />
            <button 
              onClick={handleAddAlert}
              disabled={submitting}
              className="w-full py-2.5 bg-rose-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={12} className="animate-spin" />}
              Kirim Info
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3 mb-5">
        {alerts.length === 0 && <p className="text-center text-[9px] text-gray-400 py-3 italic">Kosong.</p>}
        {alerts.map(alert => (
          <div key={alert.id} className="bg-white border border-rose-100 p-3 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">{alert.title}</span>
            </div>
            <p className="text-[11px] text-gray-700 leading-snug mb-3">{alert.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-gray-400">{alert.helpers || 0} Membantu</span>
              <button 
                onClick={() => handleHelp(alert.id, alert.title)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors"
              >
                <Heart size={12} /> Bantu
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-50">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Voting Kebijakan</h3>
        <Voting proposals={proposals} onVote={handleVote} />
      </div>
    </div>
  );
}
