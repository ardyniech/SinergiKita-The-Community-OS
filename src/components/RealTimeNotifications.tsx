import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { isAdmin } from '../lib/permissions';

export default function RealTimeNotifications() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const lastSeenRef = useRef<number>(Date.now());

  useEffect(() => {
    // Request notification permission on mount if user is admin
    if (isAdmin(profile) && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [profile]);

  useEffect(() => {
    if (!profile?.tenantId || !isAdmin(profile)) return;

    const unsubscribers: (() => void)[] = [];

    // 1. Listen for NEW social alerts of type incident
    const qSocial = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribeSocial = onSnapshot(qSocial, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const createdAt = (data.createdAt as Timestamp)?.toMillis() || Date.now();

          // Only alert if it's truly new (created after component mount or last check)
          if (createdAt > lastSeenRef.current) {
            lastSeenRef.current = createdAt;

            // 1. Show Toast
            showToast(`DARURAT: ${data.title}`);

            // 2. Show Browser Notification if permitted
            if (Notification.permission === 'granted') {
              new Notification('SinergiKita: Laporan Baru!', {
                body: `${data.title} - ${data.description}`,
                icon: '/assets/logo.png', // Fallback to a generic icon if exists
              });
            }

            // 3. Play a subtle sound if possible (optional, but requested "real-time push" feel)
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {}); // Browsers might block auto-play
            } catch (e) {
              console.warn("Audio alert failed", e);
            }
          }
        }
      });
    }, (error) => {
      console.error("RealTimeNotifications social_alerts error:", error);
    });
    unsubscribers.push(unsubscribeSocial);

    // 2. Listen for NEW emergencies (SOS alarms)
    const qEmergency = query(
      collection(db, 'emergencies'),
      where('tenantId', '==', profile.tenantId)
    );

    const unsubscribeEmergency = onSnapshot(qEmergency, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const triggeredAtMillis = data.triggeredAt ? new Date(data.triggeredAt).getTime() : 
                                    (data.timestamp as Timestamp)?.toMillis() || Date.now();

          // Only alert if it's a newly triggered SOS
          if (triggeredAtMillis > lastSeenRef.current && (!data.status || data.status === 'triggered')) {
            lastSeenRef.current = Math.max(lastSeenRef.current, triggeredAtMillis);

            // 1. Show Toast Alert
            showToast(`🚨 ALARM SOS: ${data.senderName} membutuhkan bantuan darurat untuk ${data.type.toUpperCase()}!`);

            // 2. Show Browser Notification with critical urgency settings
            if (Notification.permission === 'granted') {
              new Notification(`🚨 PANGGILAN DARURAT: ${data.type.toUpperCase()}`, {
                body: `Korban: ${data.senderName}\nAlamat: ${data.senderAddress}`,
                icon: '/assets/logo.png',
                requireInteraction: true // keep notification on screen
              });
            }

            // 3. Play siren audio alarm at high volume
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 0.8;
              audio.play().catch(() => {});
            } catch (e) {
              console.warn("Emergency audio alert failed:", e);
            }
          }
        }
      });
    }, (error) => {
      console.error("RealTimeNotifications emergencies error:", error);
    });
    unsubscribers.push(unsubscribeEmergency);

    return () => unsubscribers.forEach(unsub => unsub());
  }, [profile, showToast]);

  return null; // This is a logic-only component
}
