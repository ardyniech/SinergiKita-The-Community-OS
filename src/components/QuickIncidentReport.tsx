import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { AlertCircle, AlertTriangle, Construction, MapPin, Loader2, Mic, MicOff, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { checkAndGrantAchievements } from '../lib/achievements';

const INCIDENTS = [
  { 
    id: 'traffic', 
    label: 'Macet Parah', 
    icon: Construction, 
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    hover: 'hover:bg-orange-100',
    severity: 'medium'
  },
  { 
    id: 'accident', 
    label: 'Lakalantas', 
    icon: AlertCircle, 
    color: 'bg-rose-50 text-rose-600 border-rose-100',
    hover: 'hover:bg-rose-100',
    severity: 'high'
  },
  { 
    id: 'roadblock', 
    label: 'Razia/Blokade', 
    icon: AlertTriangle, 
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    hover: 'hover:bg-amber-100',
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
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Izin mikrofon ditolak');
        }
      };
    }
  }, [showToast]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (!recognitionRef.current) {
        showToast('Speech-to-text tidak didukung di browser ini');
        return;
      }
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
      showToast('Mendengarkan... Silakan bicara');
    }
  };

  const handleReport = async (incident: typeof INCIDENTS[0]) => {
    if (!profile?.tenantId || loadingId) return;

    setLoadingId(incident.id);
    if (isListening) {
      recognitionRef.current?.stop();
    }

    try {
      // Try to get location
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
        console.warn("Geolocation failed or denied", err);
      }

      const description = transcript.trim() 
        ? `${transcript.trim()}. (Dilaporkan via suara)`
        : `Dilaporkan oleh ${profile.displayName || 'rekan ojol'} di sekitar lokasi saat ini.`;

      await addDoc(collection(db, 'social_alerts'), {
        tenantId: profile.tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email.split('@')[0],
        title: `Laporan: ${incident.label}`,
        description,
        severity: incident.severity,
        helpers: 0,
        createdAt: serverTimestamp(),
        type: 'incident',
        incidentType: incident.id,
        location: location
      });

      addAuditEntry(`Reported incident: ${incident.label}${transcript ? ' (with voice notes)' : ''}`);
      showToast(`Laporan "${incident.label}" berhasil disiarkan!`);
      
      if (profile) {
        checkAndGrantAchievements(profile, profile.tenantId!);
      }
      
      setTranscript('');
    } catch (error) {
      console.error(error);
      showToast('Gagal mengirim laporan');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="tech-card p-3 rounded-lg border border-slate-200 mb-3 relative overflow-hidden shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-dashed border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-center text-cyan-600 shadow-xs">
            <MapPin size={12} />
          </div>
          <div>
            <h2 className="text-[10px] font-mono font-extrabold text-slate-800 uppercase tracking-widest">INCIDENT_BROADCAST</h2>
            <p className="text-[7px] font-mono text-slate-400 uppercase tracking-wider leading-none mt-0.5">Saling Jaga di Aspal / Road Patrol</p>
          </div>
        </div>

        <button
          onClick={toggleListening}
          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
            isListening 
              ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-lg shadow-rose-200' 
              : 'bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 border-slate-200'
          }`}
          title={isListening ? 'Berhenti mendengarkan' : 'Lapor via suara'}
        >
          <Mic size={13} />
        </button>
      </div>

      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-cyan-50/40 rounded-lg p-2.5 border border-cyan-100 relative group"
          >
            <button 
              onClick={() => setTranscript('')}
              className="absolute top-1 right-1 p-1 text-cyan-500 hover:text-cyan-700 cursor-pointer"
            >
              <X size={12} />
            </button>
            <p className="text-[9px] font-mono text-cyan-800 italic pr-4">"{transcript}"</p>
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
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReport(incident)}
              disabled={!!loadingId}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all cursor-pointer ${
                incident.id === 'traffic' ? 'bg-orange-50/50 border-orange-200/50 text-orange-700 hover:bg-orange-100/60' :
                incident.id === 'accident' ? 'bg-rose-50/50 border-rose-200/50 text-rose-700 hover:bg-rose-100/60' :
                'bg-amber-50/50 border-amber-200/50 text-amber-700 hover:bg-amber-100/60'
              } disabled:opacity-50`}
            >
              <div className="p-1 rounded bg-white border border-slate-200/40 shrink-0">
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Icon size={14} />
                )}
              </div>
              <span className="text-[9px] font-mono font-extrabold uppercase tracking-wide text-center leading-none">
                {incident.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
