// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send, Mic, MicOff, Play } from 'lucide-react';

export default function DashboardChatWidget() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(
      collection(db, 'messages'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('timestamp', 'asc'),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (e) => {
      console.warn("DashboardChatWidget messages snapshot error:", e);
    });
  }, [profile?.tenantId]);

  const handleSend = async (text: string, audio?: string) => {
    if (!profile) return;
    await addDoc(collection(db, 'messages'), {
      tenantId: profile.tenantId,
      senderId: profile.uid,
      senderName: profile.displayName || profile.email.split('@')[0],
      text,
      audio,
      timestamp: serverTimestamp()
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          await handleSend('[Audio Message]', reader.result as string);
        };
      };
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
  };

  const playAudio = (audio: string) => {
    const audioEl = new Audio(audio);
    audioEl.play();
  };

  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col h-64 w-full">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare size={16} className="text-green-600" />
        <h3 className="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Obrolan Live</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-1">
        {messages.map(msg => (
          <div key={msg.id} className={`text-[10px] ${msg.senderId === profile?.uid ? 'text-right' : 'text-left'}`}>
            <span className="font-bold text-gray-500">{msg.senderName}: </span>
            {msg.audio ? (
              <button onClick={() => playAudio(msg.audio)} className="text-green-600 flex items-center gap-1">
                <Play size={10} /> Putar Audio
              </button>
            ) : <span className="text-gray-800">{msg.text}</span>}
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="mt-2 flex gap-1">
        <button 
          onClick={isRecording ? stopRecording : startRecording}
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600'}`}
        >
          {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
        </button>
        <input 
          type="text" placeholder="Pesan..." value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={(e) => {
             if (e.key === 'Enter' && inputText.trim()) {
               handleSend(inputText.trim());
               setInputText('');
             }
          }}
          className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] outline-none focus:ring-1 focus:ring-green-400"
        />
        <button onClick={() => {
            if (inputText.trim()) {
                handleSend(inputText.trim());
                setInputText('');
            }
        }} className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center">
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}
