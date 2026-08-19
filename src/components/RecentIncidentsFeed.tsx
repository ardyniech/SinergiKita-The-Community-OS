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
      })).filter((item: any) => {
        if (!item.createdAt) return true;
        const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      });
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

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4 p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded-full" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-100 rounded w-full" />
          <div className="h-10 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="tech-card rounded-lg border border-slate-200 overflow-hidden mb-3 bg-white/95 relative shadow-sm">
      <div className="px-4 py-3 border-b border-dashed border-slate-200 flex items-center justify-between">
        <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <Clock size={12} className="text-cyan-500 animate-pulse" />
          LIVE_PATROL_FEED
        </h3>
        <span className="text-[8px] font-mono font-bold text-cyan-600 bg-cyan-50 border border-cyan-200/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
          {incidents.length} ACTIVE_REPORTS
        </span>
      </div>

      <div className="max-h-[300px] overflow-y-auto divide-y divide-dashed divide-slate-150 custom-scrollbar">
        <AnimatePresence initial={false}>
          {incidents.map((incident, index) => {
            const Icon = INCIDENT_ICONS[incident.incidentType] || AlertCircle;
            const timeStr = incident.createdAt?.toDate 
              ? new Date(incident.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Baru saja';

            return (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3.5 hover:bg-slate-50/50 transition-colors group cursor-default"
              >
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    incident.severity === 'high' ? 'bg-rose-50 border-rose-200 text-rose-600' :
                    incident.severity === 'medium' ? 'bg-amber-50 border-amber-200 text-amber-600' :
                    'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                    <Icon size={14} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[11px] font-mono font-black uppercase tracking-wide text-slate-900 truncate pr-2">
                        {incident.title}
                      </h4>
                      <span className="text-[8px] font-mono font-bold text-slate-400 whitespace-nowrap">
                        {timeStr}
                      </span>
                    </div>
                    
                    <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2 mb-2">
                      {incident.description}
                    </p>

                    <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <User size={10} className="text-slate-400" />
                        </div>
                        <span className="text-[8px] font-mono font-extrabold text-slate-500 uppercase tracking-wide">
                          {incident.userName}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        {isAdmin(profile) && (
                          <>
                            <button
                              onClick={() => escalateToSOS(incident)}
                              disabled={escalatingId === incident.id}
                              className="flex items-center gap-1 px-2 py-1 bg-rose-550 border border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white rounded text-[8px] font-mono font-black uppercase tracking-wider shadow-3xs cursor-pointer transition-all"
                              title="Eskalasi ke SOS"
                            >
                              {escalatingId === incident.id ? (
                                <Loader2 size={8} className="animate-spin" />
                              ) : (
                                <ShieldAlert size={8} />
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
                              className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded text-[8px] font-mono font-black uppercase tracking-wider shadow-3xs cursor-pointer transition-all"
                            >
                              <CheckCircle2 size={8} />
                              RESOLVE
                            </button>
                          </>
                        )}
                        <span className="text-[8px] font-mono font-black uppercase px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded border border-cyan-150/50">
                          ACTIVE
                        </span>
                        <ChevronRight size={10} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {incidents.length === 0 && (
          <div className="py-12 text-center border-t border-dashed border-slate-200 bg-slate-50/50">
            <AlertCircle size={24} className="mx-auto text-slate-300 mb-1.5" />
            <p className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              NO_ACTIVE_REPORTS_IN_QUEUE
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
