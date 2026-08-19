import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BookMarked, Plus, X, Loader2 } from 'lucide-react';
import { SectionHeader } from './atoms/SectionHeader';
import { LearningItem } from './molecules/LearningItem';
import { isAdmin } from '../lib/permissions';

export default function LearningModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', content: '', category: 'Panduan' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    setError(null);
    const q = query(collection(db, 'learning'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, 
      (snap) => {
        setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Learning subscription failed:", err);
        setError("Gagal menyinkronkan modul pembelajaran secara real-time.");
        setLoading(false);
      }
    );
  }, [profile?.tenantId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || submitting) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'learning'), {
        ...newMaterial,
        tenantId: profile.tenantId,
        authorId: profile.uid,
        authorName: profile.displayName || profile.email,
        createdAt: serverTimestamp()
      });
      showToast('Materi pembelajaran berhasil ditambahkan.');
      setShowAdd(false);
      setNewMaterial({ title: '', content: '', category: 'Panduan' });
    } catch (err: any) {
      console.error("Failed to add learning material:", err);
      showToast(`Gagal menambahkan materi: ${err.message || 'offline'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-3xl border border-gray-100">
        <Loader2 size={24} className="animate-spin text-blue-500" />
        <span>Memuat modul pembelajaran...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500 bg-white rounded-3xl border border-red-100 flex flex-col items-center gap-3 shadow-sm">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }} 
          className="px-2 py-2 bg-blue-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-700 transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
      <div className="flex justify-between items-start">
        <SectionHeader title="Modul Pembelajaran" subtitle="Panduan Warga" icon={BookMarked} />
        {isAdmin(profile) && (
          <button 
            onClick={() => setShowAdd(true)}
            className="p-1.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {materials.length === 0 ? (
          <div className="p-4 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-bold">Belum ada materi.</p>
          </div>
        ) : (
          materials.map(item => (
            <LearningItem key={item.id} item={item} onClick={() => {}} />
          ))
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-3 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black text-gray-900 text-sm">Tambah Materi</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-gray-100 rounded-full"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input 
                type="text" placeholder="Judul Materi" required value={newMaterial.title}
                onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400"
              />
              <select 
                value={newMaterial.category}
                onChange={e => setNewMaterial({...newMaterial, category: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option>Panduan</option>
                <option>Tutorial</option>
                <option>Informasi</option>
              </select>
              <textarea 
                placeholder="Konten Materi" required rows={4} value={newMaterial.content}
                onChange={e => setNewMaterial({...newMaterial, content: e.target.value})}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <button type="submit" disabled={submitting} className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {submitting && <Loader2 size={12} className="animate-spin" />}
                {submitting ? 'MENYIMPAN...' : 'SIMPAN'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
