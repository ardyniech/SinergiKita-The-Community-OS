import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { BulletinPost, createBulletinPost, subscribeBulletinPosts } from '../storage/bulletinStorage';
import { Newspaper } from 'lucide-react';
import { CATEGORY_MAP, BulletinCategory } from './bulletinCategories';
import { BulletinForm } from './BulletinForm';
import { BulletinCard } from './BulletinCard';

export const BulletinContainer: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<BulletinCategory | 'semua'>('semua');

  useEffect(() => {
    if (!profile?.tenantId) return;
    const unsub = subscribeBulletinPosts(profile.tenantId, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.tenantId]);

  const handleCreate = async (title: string, content: string, category: BulletinCategory) => {
    if (!profile?.tenantId || !profile?.uid) return;
    const authorName = profile.displayName || profile.email?.split('@')[0] || 'Driver';
    const post = await createBulletinPost(profile.tenantId, profile.uid, authorName, title, content, category);
    if (post) showToast('Info berhasil dibagikan di Papan Info!');
    else showToast('Gagal membagikan info');
  };

  const filtered = selectedCat === 'semua' ? posts : posts.filter((p) => p.category === selectedCat);

  return (
    <div className="space-y-3 px-1">
      <BulletinForm onCreate={handleCreate} />

      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <button onClick={() => setSelectedCat('semua')} className={`px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ${selectedCat === 'semua' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>Semua Info</button>
        {(Object.keys(CATEGORY_MAP) as BulletinCategory[]).map((k) => (
          <button key={k} onClick={() => setSelectedCat(k)} className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border shrink-0 ${selectedCat === k ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>{CATEGORY_MAP[k].label}</button>
        ))}
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">Memuat papan info...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-slate-100 space-y-1">
            <Newspaper size={20} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Belum Ada Informasi</p>
            <p className="text-[10px] text-slate-400">Jadilah yang pertama berbagi info bermanfaat hari ini!</p>
          </div>
        ) : (
          filtered.map((post) => <BulletinCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default BulletinContainer;
