import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, AlertTriangle, Construction, Clock, User, ChevronRight, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isAdmin } from '../lib/permissions';
import { useToast } from '../context/ToastContext';

const INCIDENT_ICONS: Record<string, any> = {
  traffic: Construction,
  accident: AlertCircle,
  roadblock: AlertTriangle,
};

const SEVERITY_STYLES: Record<string, string> = {
  high: 'bg-rose-50 text-rose-600 border-rose-100',
  medium: 'bg-amber-50 text-amber-600 border-amber-100',
  low: 'bg-blue-50 text-blue-600 border-blue-100',
};

export default function RecentIncidentsFeed() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [escalatingId, setEscalatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      where('status', '!=', 'resolved'), // Only show active incidents
      orderBy('status'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  const escalateToSOS = async (incident: any) => {
    if (!profile || !isAdmin(profile)) return;
    
    setEscalatingId(incident.id);
    try {
      await addDoc(collection(db, 'emergencies'), {
        type: 'other',
        senderName: `ADMIN (${profile.displayName || profile.email})`,
        senderAddress: `ESKALASI: ${incident.title}`,
        senderId: profile.uid,
        tenantId: profile.tenantId,
        timestamp: serverTimestamp(),
        incidentId: incident.id // Reference to original incident
      });
      
      showToast("LAPORAN TELAH DIESKALASI KE SOS WARGA!");
    } catch (err) {
      console.error("Escalation failed:", err);
      showToast("Gagal melakukan eskalasi.");
    } finally {
      setEscalatingId(null);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4">
      <div className="px-4 py-3 border-bottom border-gray-50 flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
          <Clock size={14} className="text-blue-600" />
          Laporan Pantauan Terbaru
        </h3>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
          {incidents.length} Laporan Aktif
        </span>
      </div>

      <div className="max-h-[300px] overflow-y-auto divide-y divide-gray-50 custom-scrollbar">
        <AnimatePresence initial={false}>
          {incidents.map((incident, index) => {
            const Icon = INCIDENT_ICONS[incident.incidentType] || AlertCircle;
            const timeStr = incident.createdAt?.toDate 
              ? new Date(incident.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Baru saja';

            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 hover:bg-gray-50/50 transition-colors group cursor-default"
              >
                <div className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${SEVERITY_STYLES[incident.severity] || SEVERITY_STYLES.low}`}>
                    <Icon size={20} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[11px] font-black uppercase tracking-tight text-gray-900 truncate pr-2">
                        {incident.title}
                      </h4>
                      <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                        {timeStr}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2 mb-2">
                      {incident.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                          <User size={10} className="text-gray-400" />
                        </div>
                        <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight">
                          {incident.userName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {isAdmin(profile) && (
                          <>
                            <button
                              onClick={() => escalateToSOS(incident)}
                              disabled={escalatingId === incident.id}
                              className="mr-1 flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-red-700 active:scale-95 transition-all disabled:opacity-50"
                              title="Eskalasi ke SOS"
                            >
                              {escalatingId === incident.id ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                <ShieldAlert size={10} />
                              )}
                              SOS
                            </button>
                            <button
                              onClick={async () => {
                                try {
                                  await updateDoc(doc(db, 'social_alerts', incident.id), {
                                    status: 'resolved',
                                    resolvedAt: serverTimestamp()
                                  });
                                  showToast("Laporan telah diselesaikan.");
                                } catch (e) {
                                  console.error(e);
                                  showToast("Gagal menyelesaikan laporan.");
                                }
                              }}
                              className="mr-1 flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm hover:bg-green-700 active:scale-95 transition-all"
                            >
                              <CheckCircle2 size={10} />
                              Selesai
                            </button>
                          </>
                        )}
                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-green-50 text-green-600 rounded border border-green-100">
                          Aktif
                        </span>
                        <ChevronRight size={12} className="text-gray-300 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {incidents.length === 0 && (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto text-gray-200 mb-2" />
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Belum ada laporan masuk
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
