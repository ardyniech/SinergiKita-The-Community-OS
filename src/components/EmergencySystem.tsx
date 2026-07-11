import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { BellRing, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { isAdmin } from '../lib/permissions';
import { EmergencyAlert } from './molecules/EmergencyAlert';
import { SOSConfirmationModal } from './molecules/SOSConfirmationModal';

export default function EmergencySystem() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;
    return onSnapshot(query(collection(db, 'emergencies'), where('tenantId', '==', profile.tenantId)), (s) => {
      setEmergencies(s.docs.map(d => ({ id: d.id, ...d.data() } as any)).sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)));
    });
  }, [profile?.tenantId, profile?.isApproved]);

  const sendAlert = async (type: string) => {
    if (!profile) return;
    setIsSending(true);
    await addDoc(collection(db, 'emergencies'), { type, senderName: profile.displayName || profile.email, senderAddress: profile.address || 'Alamat tidak diatur', senderId: profile.uid, tenantId: profile.tenantId, timestamp: serverTimestamp() });
    showToast("ALARM DARURAT TERKIRIM!");
    setShowConfirm(false);
    setIsSending(false);
  };

  if (!profile?.tenantId) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {emergencies.map(alert => <EmergencyAlert key={alert.id} alert={alert} isAdmin={isAdmin(profile)} onResolve={async (id) => { await deleteDoc(doc(db, 'emergencies', id)); showToast("Laporan diselesaikan."); }} />)}
      </AnimatePresence>

      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="p-2 bg-red-50 text-red-600 rounded-lg"><ShieldAlert size={20} /></div><div><h3 className="text-xs font-bold text-gray-900">Keamanan</h3><p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest">Tekan SOS jika bahaya</p></div></div>
        <motion.button onClick={() => setShowConfirm(true)} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 flex items-center gap-1.5"><BellRing size={14} /> SOS</motion.button>
      </div>

      <AnimatePresence>{showConfirm && <SOSConfirmationModal isSending={isSending} onCancel={() => setShowConfirm(false)} onSend={sendAlert} />}</AnimatePresence>
    </div>
  );
}
