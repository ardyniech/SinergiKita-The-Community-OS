import { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export interface PTTMessage {
  id: string;
  senderId: string;
  senderName: string;
  audioUrl: string;
  timestamp: any;
  tenantId: string;
}

export function usePTT() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<PTTMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<PTTMessage | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastPlayedIdRef = useRef<string | null>(null);

  const playAudio = (msg: PTTMessage) => {
    setActiveSpeaker(msg);
    const audio = new Audio(msg.audioUrl);
    audio.play().catch(e => console.error("Auto-play error:", e));
    audio.onended = () => setActiveSpeaker(null);
  };

  useEffect(() => {
    if (!profile?.tenantId) return;

    const q = query(
      collection(db, 'ptt_messages'),
      where('tenantId', '==', profile.tenantId),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PTTMessage));
      setMessages(data);

      if (data.length > 0) {
        const latest = data[0];
        if (latest.id !== lastPlayedIdRef.current && latest.senderId !== profile.uid) {
          const now = Date.now();
          const msgTime = latest.timestamp?.toMillis() || now;
          if (now - msgTime < 10000) {
            playAudio(latest);
          }
          lastPlayedIdRef.current = latest.id;
        }
      }
    });

    return () => unsubscribe();
  }, [profile?.tenantId, profile?.uid]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoice(audioBlob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      showToast("Gagal mengakses mikrofon.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const uploadVoice = async (blob: Blob) => {
    if (!profile?.tenantId) return;
    setIsUploading(true);
    try {
      const filename = `ptt/${profile.tenantId}/${Date.now()}_${profile.uid}.webm`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'ptt_messages'), {
        tenantId: profile.tenantId,
        senderId: profile.uid,
        senderName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
        audioUrl: downloadUrl,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      showToast("Gagal mengirim pesan suara.");
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isRecording,
    isUploading,
    messages,
    activeSpeaker,
    startRecording,
    stopRecording,
    playAudio
  };
}
