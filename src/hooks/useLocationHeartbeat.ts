import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getGPSLocation } from './useEmergency';

export function useLocationHeartbeat() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.uid || !profile?.tenantId || !profile?.isApproved) return;

    const updateLocation = async () => {
      try {
        const coords = await getGPSLocation();
        if (coords) {
          await setDoc(doc(db, 'active_locations', profile.uid), {
            tenantId: profile.tenantId,
            uid: profile.uid,
            userName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
            lat: coords.latitude,
            lng: coords.longitude,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err) {
        console.warn("Location heartbeat update failed:", err);
      }
    };

    updateLocation();
    const interval = setInterval(updateLocation, 5 * 60 * 1000); // Heartbeat every 5 minutes
    return () => clearInterval(interval);
  }, [profile?.uid, profile?.tenantId, profile?.isApproved]);
}
