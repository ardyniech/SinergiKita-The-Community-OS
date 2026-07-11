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

    // Listen for NEW social alerts of type incident
    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
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
      console.error("RealTimeNotifications error:", error);
    });

    return () => unsubscribe();
  }, [profile, showToast]);

  return null; // This is a logic-only component
}
