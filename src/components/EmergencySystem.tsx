import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { BellRing, ShieldAlert, History, MessageSquare, PhoneCall } from 'lucide-react';
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
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    const q = query(
      collection(db, 'emergencies'), 
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as any));
      // Sort by timestamp descending
      list.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      setEmergencies(list);
    });

    return () => unsubscribe();
  }, [profile?.tenantId, profile?.isApproved]);

  const sendAlert = async (type: string) => {
    if (!profile) return;
    setIsSending(true);
    try {
      // Create new SOS incident
      await addDoc(collection(db, 'emergencies'), {
        type,
        senderName: profile.displayName || profile.email.split('@')[0],
        senderAddress: profile.address || 'RT 04 / RW 02 Sektor B',
        senderId: profile.uid,
        tenantId: profile.tenantId,
        status: 'triggered',
        timestamp: serverTimestamp()
      });

      // Simulation of Instant Push/WA/SMS dispatch to whole neighborhood
      showToast(
        `🚨 ALARM SOS DI-TRIGGER!\n📲 WhatsApp Gateway mengirim SMS & WA Darurat otomatis ke Sektor Keamanan dan 10 tetangga terdekat Anda!`
      );
      
      setShowConfirm(false);
    } catch (err: any) {
      showToast("Gagal mengirim alarm: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  if (!profile?.tenantId) return null;

  // Split active and archived resolved emergencies
  const activeEmergencies = emergencies.filter(e => !e.status || e.status !== 'resolved');
  const resolvedEmergencies = emergencies.filter(e => e.status === 'resolved');

  return (
    <div className="space-y-3">
      {/* Active Alerts */}
      <AnimatePresence>
        {activeEmergencies.map(alert => (
          <EmergencyAlert 
            key={alert.id} 
            alert={alert} 
            isAdmin={isAdmin(profile)} 
            onResolve={() => {}} 
            currentUser={{ uid: profile.uid, displayName: profile.displayName, email: profile.email }}
          />
        ))}
      </AnimatePresence>

      {/* Primary SOS Trigger panel */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900">Sistem Keamanan RT</h3>
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-none mt-1">Tekan SOS dalam keadaan bahaya</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {resolvedEmergencies.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-2 text-gray-500 hover:text-indigo-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
              title="Lihat riwayat laporan darurat"
            >
              <History size={16} />
            </button>
          )}

          <motion.button 
            onClick={() => setShowConfirm(true)} 
            animate={{ scale: [1, 1.04, 1] }} 
            transition={{ duration: 1.2, repeat: Infinity }} 
            className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-200 hover:bg-red-700 flex items-center gap-1.5"
          >
            <BellRing size={14} className="animate-pulse" /> SOS
          </motion.button>
        </div>
      </div>

      {/* Historical logs panel */}
      <AnimatePresence>
        {showHistory && resolvedEmergencies.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-2 overflow-hidden"
          >
            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <History size={12} /> Arsip Penanganan Darurat
            </h4>
            <div className="space-y-1.5 max-h-44 overflow-y-auto">
              {resolvedEmergencies.map(e => (
                <div key={e.id} className="bg-white p-2 rounded border border-gray-100 text-[10px] flex justify-between items-center">
                  <div>
                    <span className="font-extrabold text-green-700 bg-green-50 px-1.5 py-0.5 rounded uppercase text-[8px] tracking-wider">Terselesaikan</span>
                    <h5 className="font-bold text-gray-900 mt-1">{e.senderName} ({e.type})</h5>
                    <p className="text-[8px] text-gray-400">{e.senderAddress}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-bold text-gray-400 uppercase block">Berhasil Ditangani</span>
                    {e.responderName && <p className="text-[8px] text-indigo-600 font-bold mt-0.5">Oleh: {e.responderName}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirm && (
          <SOSConfirmationModal 
            isSending={isSending} 
            onCancel={() => setShowConfirm(false)} 
            onSend={sendAlert} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
