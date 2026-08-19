import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Radio, Mic, Volume2, Users, History, AlertCircle } from 'lucide-react';
import { SectionHeader } from './atoms/SectionHeader';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../context/ToastContext';

interface PTTMessage {
  id: string;
  senderId: string;
  senderName: string;
  audioUrl: string;
  timestamp: any;
  tenantId: string;
}

export default function HandyTalkieModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<PTTMessage[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<PTTMessage | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const lastPlayedIdRef = useRef<string | null>(null);

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

      // Auto-play new message if it's the latest and we haven't played it
      if (data.length > 0) {
        const latest = data[0];
        if (latest.id !== lastPlayedIdRef.current && latest.senderId !== profile.uid) {
          const now = Date.now();
          const msgTime = latest.timestamp?.toMillis() || now;
          // Only play if message is fresh (less than 10 seconds old)
          if (now - msgTime < 10000) {
            playAudio(latest);
          }
          lastPlayedIdRef.current = latest.id;
        }
      }
    });

    return () => unsubscribe();
  }, [profile?.tenantId, profile?.uid]);

  const playAudio = (msg: any) => {
    setActiveSpeaker(msg);
    const audio = new Audio(msg.audioUrl);
    audio.play().catch(e => console.error("Auto-play failed:", e));
    audio.onended = () => setActiveSpeaker(null);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length === 0) return;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoice(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      showToast("Gagal mengakses mikrofon. Pastikan izin diberikan.");
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
      const fileName = `ptt/${profile.tenantId}/${Date.now()}.webm`;
      const storageRef = ref(storage, fileName);
      await uploadBytes(storageRef, blob);
      const audioUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'ptt_messages'), {
        tenantId: profile.tenantId,
        senderId: profile.uid,
        senderName: profile.displayName || profile.email.split('@')[0],
        audioUrl,
        timestamp: serverTimestamp(),
      });
    } catch (err) {
      console.error("Upload failed:", err);
      showToast("Gagal mengirim suara.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#2a2a2a] rounded-[40px] p-6 shadow-2xl border-4 border-[#1a1a1a] flex flex-col h-[600px] text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <SectionHeader 
        title="HANDY TALKIE" 
        subtitle="SinergiNet Frequency 144.500" 
        icon={Radio} 
        colorClass="text-cyan-400" 
        bgClass="bg-[#1a1a1a]" 
      />

      <div className="mt-2 bg-[#1a1a1a] rounded-2xl p-4 border-2 border-[#333] relative overflow-hidden flex-1 flex flex-col">
        <div className="absolute top-2 right-4 flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-[10px] font-mono font-bold text-emerald-500 uppercase tracking-widest">Signal_High</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <AnimatePresence mode="wait">
            {activeSpeaker ? (
              <motion.div 
                key="speaking"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping" />
                  <div className="w-20 h-20 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-cyan-900/50 relative z-10 border-4 border-cyan-400">
                    <Volume2 size={32} className="text-white" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[10px] font-mono font-black text-cyan-400 uppercase tracking-[0.2em] mb-1">Incoming_Transmission</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">{activeSpeaker.senderName}</p>
                  <div className="flex items-end justify-center gap-1 h-8 mt-3 w-32">
                    {[1.2, 0.6, 1.5, 0.8, 1.3, 0.5, 1.1, 0.7, 1.4, 0.9].map((delay, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-cyan-400 rounded-full soundwave-bar"
                        style={{ 
                          height: '100%', 
                          animationDelay: `${delay}s`,
                          animationDuration: `${0.5 + delay * 0.3}s` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : isRecording ? (
              <motion.div 
                key="recording"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-300"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/30 rounded-full animate-ping" />
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-900/50 relative z-10 border-4 border-red-400">
                    <Mic size={32} className="text-white" />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-[10px] font-mono font-black text-red-500 uppercase tracking-[0.2em] mb-1">Broadcasting_Live</p>
                  <p className="text-xl font-black text-white uppercase tracking-tight">GANTI...</p>
                  <div className="flex items-end justify-center gap-1 h-8 mt-3 w-32">
                    {[0.8, 1.4, 0.5, 1.2, 0.7, 1.3, 0.6, 1.1, 0.9, 1.5].map((delay, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-red-500 rounded-full soundwave-bar"
                        style={{ 
                          height: '100%', 
                          animationDelay: `${delay}s`,
                          animationDuration: `${0.4 + delay * 0.4}s` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center opacity-40"
              >
                <Radio size={64} className="text-[#444]" />
                <p className="mt-4 text-[10px] font-mono font-black text-[#555] uppercase tracking-[0.3em]">Standby_Mode</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-auto pt-4 border-t border-[#333]">
          <div className="flex items-center gap-2 mb-2">
            <History size={12} className="text-[#666]" />
            <span className="text-[9px] font-mono font-bold text-[#666] uppercase tracking-widest">Recent_Activity</span>
          </div>
          <div className="h-20 overflow-y-auto space-y-1 custom-scrollbar">
            {messages.map(msg => (
              <div key={msg.id} className="flex items-center justify-between text-[10px] font-mono bg-[#222] px-2 py-1 rounded">
                <span className="text-gray-400 font-bold truncate max-w-[100px]">{msg.senderName}</span>
                <button 
                  onClick={() => playAudio(msg)}
                  className="text-cyan-500 hover:text-cyan-400 font-black uppercase tracking-tighter"
                >
                  Listen
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="mb-4 flex items-center gap-4 px-4 py-2 bg-[#1a1a1a] rounded-full border border-[#333] shadow-inner">
           <div className="flex items-center gap-1.5">
             <Users size={12} className="text-gray-500" />
             <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Channel_01</span>
           </div>
           <div className="w-px h-3 bg-[#333]" />
           <div className="flex items-center gap-1.5">
             <AlertCircle size={12} className="text-gray-500" />
             <span className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest">Squelch_Auto</span>
           </div>
        </div>

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          disabled={isUploading}
          className={`
            w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl relative group
            ${isRecording 
              ? 'bg-red-600 scale-95 shadow-[0_0_30px_rgba(220,38,38,0.5)] border-4 border-red-400' 
              : 'bg-[#333] hover:bg-[#444] border-4 border-[#1a1a1a] active:scale-95'
            }
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="absolute inset-0 rounded-full border-t-2 border-white/10" />
          <Mic size={32} className={`${isRecording ? 'text-white' : 'text-gray-400'} group-hover:scale-110 transition-transform`} />
          <span className={`mt-1 text-[8px] font-black uppercase tracking-widest ${isRecording ? 'text-white' : 'text-gray-500'}`}>
            {isUploading ? 'SENDING...' : isRecording ? 'PUSHING' : 'PUSH_TALK'}
          </span>
        </button>

        <p className="mt-4 text-[9px] font-mono font-black text-gray-500 uppercase tracking-widest animate-pulse text-center">
          Hold button to transmit<br/>Gunakan seperti Handy Talkie sungguhan
        </p>
      </div>
    </div>
  );
}
