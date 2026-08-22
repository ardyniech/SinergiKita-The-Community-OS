import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { BulletinPost, createBulletinPost, subscribeBulletinPosts } from '../storage/bulletinStorage';
import { Newspaper, Plus, Wrench, Coffee, Settings, MessageSquare, Tag, User, Clock } from 'lucide-react';

const CATEGORY_MAP = {
  bengkel: { label: 'Bengkel', icon: <Wrench size={12} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  rest_area: { label: 'Tempat Rehat', icon: <Coffee size={12} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  spareparts: { label: 'Suku Cadang', icon: <Settings size={12} />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  umum: { label: 'Umum', icon: <MessageSquare size={12} />, color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const BulletinContainer: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<BulletinPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<BulletinPost['category'] | 'semua'>('semua');
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<BulletinPost['category']>('umum');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!profile?.tenantId) return;
    const unsub = subscribeBulletinPosts(profile.tenantId, (data) => {
      setPosts(data);
      setLoading(false);
    });
    return () => unsub();
  }, [profile?.tenantId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId || !profile?.uid) return;
    if (!title.trim() || !content.trim()) {
      showToast('Harap isi judul dan penjelasan informasi');
      return;
    }

    setIsSubmitting(true);
    const authorName = profile.displayName || profile.email?.split('@')[0] || 'Driver';
    const post = await createBulletinPost(profile.tenantId, profile.uid, authorName, title, content, category);
    
    if (post) {
      showToast('Info berhasil dibagikan di Papan Info!');
      setTitle('');
      setContent('');
      setCategory('umum');
      setShowForm(false);
    } else {
      showToast('Gagal membagikan info');
    }
    setIsSubmitting(false);
  };

  const filteredPosts = selectedCat === 'semua' ? posts : posts.filter(p => p.category === selectedCat);

  return (
    <div className="space-y-3 px-1">
      {/* Tombol Bagikan Info Baru */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus size={14} />
          <span>Bagikan Info Bengkel / Tempat Rehat</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2.5">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-black text-slate-800">Bagikan Informasi Baru</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-[10px] text-slate-400 font-bold">Batal</button>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul (contoh: Tambal Ban Murah Kalideres)"
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Ketik penjelasan detail di sini..."
            rows={2}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 resize-none"
          />

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {(Object.keys(CATEGORY_MAP) as BulletinPost['category'][]).map((catKey) => (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategory(catKey)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all shrink-0 ${
                  category === catKey ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {CATEGORY_MAP[catKey].icon}
                <span>{CATEGORY_MAP[catKey].label}</span>
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Informasi'}
          </button>
        </form>
      )}

      {/* Filter Kategori */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setSelectedCat('semua')}
          className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-colors shrink-0 ${
            selectedCat === 'semua' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
          }`}
        >
          Semua Info
        </button>
        {(Object.keys(CATEGORY_MAP) as BulletinPost['category'][]).map((catKey) => (
          <button
            key={catKey}
            onClick={() => setSelectedCat(catKey)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors shrink-0 ${
              selectedCat === catKey ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {CATEGORY_MAP[catKey].label}
          </button>
        ))}
      </div>

      {/* List Posts */}
      <div className="space-y-2">
        {loading ? (
          <div className="p-4 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
            Memuat papan info...
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-xl border border-slate-100 space-y-1">
            <Newspaper size={20} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold text-slate-700">Belum Ada Informasi</p>
            <p className="text-[10px] text-slate-400">Jadilah yang pertama berbagi info bermanfaat hari ini!</p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const cat = CATEGORY_MAP[post.category] || CATEGORY_MAP.umum;
            const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';
            return (
              <div key={post.id} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                      {post.authorName?.charAt(0) || <User size={10} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{post.title}</h4>
                      <p className="text-[8px] text-slate-400">Oleh {post.authorName} • {dateStr}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${cat.color}`}>
                    {cat.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 leading-normal break-words">{post.content}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
