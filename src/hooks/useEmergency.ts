import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAudit } from '../context/AuditContext';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { awardPoints } from '../lib/gamification';

export interface LocationCoords {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export const getGPSLocation = (): Promise<LocationCoords | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    const timeoutId = setTimeout(() => resolve(null), 6000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      () => {
        clearTimeout(timeoutId);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};

export function useEmergency() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();

  const [emergencies, setEmergencies] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId || !profile?.isApproved) return;

    const processPending = async () => {
      const pending = JSON.parse(localStorage.getItem('pendingSOS') || '[]');
      if (pending.length === 0) return;
      
      showToast(`Mengirim ${pending.length} laporan darurat tertunda...`);
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
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      list.sort((a: any, b: any) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
      setEmergencies(list);
    });

    return () => {
      window.removeEventListener('online', processPending);
      unsubscribe();
    };
  }, [profile?.tenantId, profile?.isApproved]);

  const triggerSOS = async () => {
    if (!profile) return;
    setIsSending(true);

    try {
      const gps = await getGPSLocation();
      const sosData = {
        tenantId: profile.tenantId,
        uid: profile.uid,
        userName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
        userRole: profile.role || 'member',
        userPhone: profile.phoneNumber || 'Tidak ada no hp',
        location: gps ? { lat: gps.latitude, lng: gps.longitude } : null,
        address: profile.address || 'Alamat Rumah Warga',
        type: 'SOS Panic Button',
        status: 'active'
      };

      if (!navigator.onLine) {
        const pending = JSON.parse(localStorage.getItem('pendingSOS') || '[]');
        pending.push(sosData);
        localStorage.setItem('pendingSOS', JSON.stringify(pending));
        showToast("Anda sedang offline. Sinyal SOS disimpan & dikirim otomatis saat online.");
      } else {
        await addDoc(collection(db, 'emergencies'), { ...sosData, timestamp: serverTimestamp() });
        awardPoints(profile.uid, 50, 'Menyalakan Sinyal SOS').catch(() => {});
        addAuditEntry("SOS panic signal triggered");
        showToast("ALARM SOS BERHASIL DIKIRIM KE SELURUH WARGA!");
      }
    } catch (err) {
      showToast("Gagal mengirim sinyal SOS.");
    } finally {
      setIsSending(false);
    }
  };

  return {
    emergencies,
    isSending,
    triggerSOS
  };
}
