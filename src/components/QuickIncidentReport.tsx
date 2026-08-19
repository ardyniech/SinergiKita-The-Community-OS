import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { AlertCircle, AlertTriangle, Construction, MapPin, Loader2, Mic, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkAndGrantAchievements } from '../lib/achievements';

const INCIDENTS = [
  { 
    id: 'traffic', 
    label: 'Macet Padat', 
    icon: Construction, 
    color: 'bg-amber-50 text-amber-700 border-amber-200/60',
    severity: 'medium'
  },
  { 
    id: 'accident', 
    label: 'Laka / Darurat', 
    icon: AlertCircle, 
    color: 'bg-rose-50 text-rose-700 border-rose-200/60',
    severity: 'high'
  },
  { 
    id: 'roadblock', 
    label: 'Penutupan Jalan', 
    icon: AlertTriangle, 
    color: 'bg-blue-50 text-blue-700 border-blue-200/60',
    severity: 'medium'
  }
];

export default function QuickIncidentReport() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'id-ID';

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Izin mikrofon belum aktif');
        }
      };
    }
  }, [showToast]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        showToast('Fitur suara belum didukung di browser ini');
        return;
      }
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      showToast('Mendengarkan... Silakan ceritakan situasinya');
    }
  };

  const handleReport = async (incident: typeof INCIDENTS[0]) => {
    if (!profile?.tenantId || loadingId) return;

    setLoadingId(incident.id);
    if (isListening) {
      recognitionRef.current?.stop();
    }

    try {
      let location = null;
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      } catch (err) {
        console.warn("Geolocation skipped", err);
      }

      const description = transcript.trim() 
        ? `${transcript.trim()}. (Laporan lisan via suara)`
        : `Kabar dari ${profile.displayName || 'Sahabat Warga'} di sekitar lokasi saat ini.`;

      await addDoc(collection(db, 'social_alerts'), {
        tenantId: profile.tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email.split('@')[0],
        title: `Kabar Warga: ${incident.label}`,
        description,
        severity: incident.severity,
        helpers: 0,
        createdAt: serverTimestamp(),
        type: 'incident',
        incidentType: incident.id,
        location
      });

      addAuditEntry(`Melaporkan situasi: ${incident.label}`);
      showToast(`Terima kasih! Informasi "${incident.label}" berhasil dibagikan ke warga.`);
      
      if (profile) {
        checkAndGrantAchievements(profile, profile.tenantId!);
      }
      
      setTranscript('');
    } catch (error) {
      showToast('Mohon maaf, pengiriman laporan sedang terkendala');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 mb-2.5 shadow-xs">
      <div className="flex items-center justify-between mb-2.5 border-b border-slate-100 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
            <MapPin size={14} />
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-100">Kabar Kilat Lingkungan</h2>
            <p className="text-[9px] text-slate-400">Saling peduli dan pantau situasi sekitar</p>
          </div>
        </div>

        <button
          onClick={toggleListening}
          className={`min-h-[44px] min-w-[44px] rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            isListening 
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
              : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 border-slate-200 dark:border-slate-700'
          }`}
          title={isListening ? 'Selesai merekam' : 'Lapor via pesan suara'}
        >
          <Mic size={16} />
        </button>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-lg p-2.5 border border-blue-200 dark:border-blue-800 relative group"
          >
            <button 
              onClick={() => setTranscript('')}
              className="absolute top-1 right-1 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={14} />
            </button>
            <p className="text-[10px] text-blue-900 dark:text-blue-300 italic pr-4">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-3 gap-2">
        {INCIDENTS.map((incident) => {
          const Icon = incident.icon;
          const isLoading = loadingId === incident.id;

          return (
            <motion.button
              key={incident.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleReport(incident)}
              disabled={!!loadingId}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all cursor-pointer ${incident.color} disabled:opacity-50`}
            >
              <div className="p-1 rounded bg-white/80 dark:bg-slate-800 shrink-0">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
              </div>
              <span className="text-[9px] font-bold tracking-tight text-center leading-tight">
                {incident.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
