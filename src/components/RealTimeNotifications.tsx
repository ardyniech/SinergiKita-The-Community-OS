// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    if (!profile?.uid || !profile?.tenantId) return;

    const updateGPSLocation = () => {
      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await setDoc(doc(db, 'active_locations', profile.uid), {
              uid: profile.uid,
              displayName: profile.displayName || profile.email.split('@')[0],
              email: profile.email,
              role: profile.role || 'Warga',
              tenantId: profile.tenantId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              updatedAt: serverTimestamp(),
              isOnline: true
            });
          } catch (err) {
            console.error("Gagal memperbarui lokasi GPS latar belakang:", err);
          }
        },
        (error) => {
          console.warn("Gagal mendeteksi lokasi GPS latar belakang:", error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    };

    // Update immediately on mount
    updateGPSLocation();

    // Periodically update every 20 seconds
    const intervalId = setInterval(updateGPSLocation, 20000);

    return () => clearInterval(intervalId);
  }, [profile]);

  useEffect(() => {
    if (!profile?.tenantId) return;

    const unsubscribers: (() => void)[] = [];

    // Synthesized alarm siren using Web Audio API (100% reliable offline / online)
    const playSiren = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(600, ctx.currentTime);
        osc2.frequency.setValueAtTime(620, ctx.currentTime);
        
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(2, ctx.currentTime);
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);
        
        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 6);
        
        lfo.start();
        osc1.start();
        osc2.start();
        
        lfo.stop(ctx.currentTime + 6);
        osc1.stop(ctx.currentTime + 6);
        osc2.stop(ctx.currentTime + 6);
      } catch (e) {
        console.warn("Failed to play synthesized siren:", e);
      }
    };

    // Voice announcer using SpeechSynthesis API (TTS) in Indonesian
    const playSpeechSOS = (senderName: string, type: string) => {
      try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const text = `Peringatan darurat! ${senderName} membutuhkan bantuan segera untuk darurat ${type}!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 0.85;
        utterance.pitch = 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
        if (idVoice) utterance.voice = idVoice;
        
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("Failsafe Speech Synthesis:", e);
      }
    };

    // 1. Listen for NEW social alerts of type incident (ONLY for Admins)
    if (isAdmin(profile)) {
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

            if (createdAt > lastSeenRef.current) {
              lastSeenRef.current = createdAt;

              showToast(`DARURAT: ${data.title}`);

              if (Notification.permission === 'granted') {
                new Notification('SinergiKita: Laporan Baru!', {
                  body: `${data.title} - ${data.description}`,
                  icon: '/assets/logo.png',
                });
              }

              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                audio.volume = 0.5;
                audio.play().catch(() => {});
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
    }

    // 2. Listen for NEW emergencies (SOS alarms) - FOR ALL USERS (Admins & Members)
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
                requireInteraction: true
              });
            }

            // 3. Play dual-tone synthesized police siren sound
            playSiren();

            // 4. Speak SOS voice notification via Indonesian TTS
            setTimeout(() => {
              playSpeechSOS(data.senderName, data.type);
            }, 1000); // Slight delay after siren start
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
