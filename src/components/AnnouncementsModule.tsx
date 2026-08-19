import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Plus, X, Loader2 } from 'lucide-react';
import { SectionHeader } from './atoms/SectionHeader';
import { AnnouncementCard } from './molecules/AnnouncementCard';
import { isAdmin } from '../lib/permissions';

export default function AnnouncementsModule() {
  const { profile } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', priority: 'medium' as any });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    setError(null);
    const yesterday = Timestamp.fromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
    const q = query(
      collection(db, 'announcements'), 
      where('tenantId', '==', profile.tenantId),
      where('createdAt', '>=', yesterday),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, 
      (snap) => {
        setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Announcements subscription failed:", err);
        setError("Gagal menyinkronkan pengumuman secara real-time.");
        setLoading(false);
      }
    );
  }, [profile?.tenantId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnn,
        tenantId: profile.tenantId,
        authorName: profile.displayName || profile.email,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewAnn({ title: '', content: '', priority: 'medium' });
    } catch (err: any) {
      console.error("Gagal menambahkan pengumuman:", err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-gray-100">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span>Memuat informasi terbaru...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500 bg-white rounded-3xl border border-red-100 flex flex-col items-center gap-3 shadow-sm">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }} 
          className="px-2 py-2 bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-orange-700 transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <SectionHeader title="Info Terbaru" subtitle="Warta Warga" icon={Megaphone} colorClass="text-orange-600" bgClass="bg-orange-50" />
        {isAdmin(profile) && (
          <button 
            onClick={() => setShowAdd(true)}
            className="p-1.5 bg-orange-600 text-white rounded-lg shadow-lg hover:bg-orange-700 transition-all"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold">Belum ada pengumuman.</p>
          </div>
        ) : (
          announcements.map(ann => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-3 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 text-sm">Tambah Pengumuman</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input 
                type="text" placeholder="Judul" required value={newAnn.title}
                onChange={e => setNewAnn({...newAnn, title: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select 
                value={newAnn.priority}
                onChange={e => setNewAnn({...newAnn, priority: e.target.value as any})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="low">Rendah</option>
                <option value="medium">Sedang</option>
                <option value="high">Tinggi</option>
              </select>
              <textarea 
                placeholder="Isi Pengumuman" required rows={4} value={newAnn.content}
                onChange={e => setNewAnn({...newAnn, content: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-400 resize-none"
              />
              <button type="submit" className="w-full py-3 bg-orange-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-200 hover:bg-orange-700 transition-all">
                PUBLIKASI
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
