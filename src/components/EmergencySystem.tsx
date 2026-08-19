import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { BellRing, ShieldAlert, History, MessageSquare, PhoneCall } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';
import { isAdmin } from '../lib/permissions';
import { EmergencyAlert } from './molecules/EmergencyAlert';
import { SOSConfirmationModal } from './molecules/SOSConfirmationModal';
import IncidentMap from './IncidentMap';

interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

const getGPSLocation = (): Promise<LocationCoords | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      resolve(null);
      return;
    }
    
    // Set a timeout of 6 seconds to avoid blocking the SOS trigger
    const timeoutId = setTimeout(() => {
      console.warn("Geolocation request timed out.");
      resolve(null);
    }, 6000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.warn("Geolocation error:", error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
};

export default function EmergencySystem() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    // Process pending SOS requests when back online
    const processPending = async () => {
      const pending = JSON.parse(localStorage.getItem('pendingSOS') || '[]');
      if (pending.length === 0) return;
      
      showToast(`Mengirim ${pending.length} laporan darurat yang tertunda...`);
      for (const sos of pending) {
        try {
          await addDoc(collection(db, 'emergencies'), { ...sos, timestamp: serverTimestamp() });
        } catch (e) {
          console.error("Failed to resend pending SOS:", e);
        }
      }
      localStorage.setItem('pendingSOS', '[]');
      showToast("Laporan darurat tertunda berhasil dikirim.");
    };
    
    window.addEventListener('online', processPending);
    processPending();

    const yesterday = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'emergencies'), 
      where('tenantId', '==', profile.tenantId),
      where('timestamp', '>=', yesterday)
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

    return () => {
      unsubscribe();
      window.removeEventListener('online', processPending);
    };
  }, [profile?.tenantId, profile?.isApproved]);

  const sendAlert = async (type: string) => {
    if (!profile) return;
    setIsSending(true);
    try {
      const senderAddress = profile.address || 'RT 04 / RW 02 Sektor B';
      const senderName = profile.displayName || profile.email.split('@')[0];

      // Access exact real-time GPS location
      showToast("⏳ Mengakses GPS lokasi Anda secara real-time...");
      const coords = await getGPSLocation();

      let latitude = coords?.latitude || null;
      let longitude = coords?.longitude || null;
      let locationAccuracy = coords?.accuracy || null;
      let isRealGPS = !!coords;

      if (!coords) {
        // Fallback: SinergiKita center coordinates with slight random noise
        latitude = -6.2088 + (Math.random() - 0.5) * 0.005;
        longitude = 106.8456 + (Math.random() - 0.5) * 0.005;
        locationAccuracy = 150;
        isRealGPS = false;
        showToast("⚠️ GPS tidak aktif atau izin diblokir. Menggunakan koordinat estimasi wilayah.");
      } else {
        showToast(`✅ GPS Berhasil Dikunci! Akurasi: ${Math.round(locationAccuracy || 0)} meter.`);
      }

      const sosData = {
        type,
        senderName,
        senderAddress,
        senderId: profile.uid,
        tenantId: profile.tenantId,
        status: 'triggered',
        triggeredAt: new Date().toISOString(),
        latitude,
        longitude,
        locationAccuracy,
        isRealGPS
      };

      // Try sending to Firebase
      try {
        if (!navigator.onLine) throw new Error("Offline");
        await addDoc(collection(db, 'emergencies'), { ...sosData, timestamp: serverTimestamp() });
        
        // Dispatch Firebase Cloud Messaging push notification to all community admins via backend
        try {
          const token = await auth.currentUser?.getIdToken();
          if (token) {
            await fetch('/api/community/emergencies/notify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                type,
                senderName,
                senderAddress,
                tenantId: profile.tenantId,
                latitude,
                longitude,
                isRealGPS
              })
            });
          }
        } catch (fcmErr) {
          console.error("FCM dispatch helper failed:", fcmErr);
        }
        showToast(`🚨 ALARM SOS DI-TRIGGER!`);
      } catch (err) {
        // Queue if offline or firebase fails
        const pending = JSON.parse(localStorage.getItem('pendingSOS') || '[]');
        pending.push(sosData);
        localStorage.setItem('pendingSOS', JSON.stringify(pending));
        showToast("🚨 SOS tersimpan di memori (Mode Offline). Akan dikirim saat koneksi pulih.");
      }
      
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

      <IncidentMap />

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
