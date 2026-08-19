import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Send } from 'lucide-react';
import { SectionHeader } from './atoms/SectionHeader';
import { ChatMessageItem } from './molecules/ChatMessageItem';

export default function CommunicationModule() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const q = query(
      collection(db, 'messages'), 
      where('tenantId', '==', profile.tenantId),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (e) => {
      console.warn("CommunicationModule messages snapshot error:", e);
    });
  }, [profile?.tenantId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    await addDoc(collection(db, 'messages'), {
      tenantId: profile.tenantId,
      senderId: profile.uid,
      senderName: profile.displayName || profile.email.split('@')[0],
      text,
      timestamp: serverTimestamp()
    });
  };

  return (
    <div className="bg-white rounded-[40px] p-4 shadow-sm border border-gray-100 flex flex-col h-[500px]">
      <SectionHeader title="Ruang Obrolan" subtitle="Komunikasi Antar Warga" icon={MessageSquare} colorClass="text-green-600" bgClass="bg-green-50" />
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center">
              Belum ada obrolan.<br/>Mulai sapa warga lain!
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <ChatMessageItem key={msg.id} message={msg} isMe={msg.senderId === profile?.uid} />
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input 
          type="text" placeholder="Tulis pesan..." value={inputText}
          onChange={e => setInputText(e.target.value)}
          className="flex-1 px-2 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-green-400"
        />
        <button type="submit" className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
