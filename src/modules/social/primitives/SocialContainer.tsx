import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useSocial } from '../logic/useSocial';
import { PostCard } from './PostCard';
import { PostForm } from './PostForm';
import { Loader2, Users } from 'lucide-react';

export const SocialContainer: React.FC = () => {
  const { profile } = useAuth();
  const { posts, loading, submitting, handleCreatePost, handleLike } = useSocial(profile?.tenantId || null, profile);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-3d-sm">
          <Users size={22} />
        </div>
        <div>
          <h2 className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight">Kabar Warga</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-70">Jalin Silaturahmi Digital</p>
        </div>
      </div>

      <PostForm onPost={handleCreatePost} submitting={submitting} />

      <div className="space-y-4 animate-in fade-in duration-700">
        {posts.length === 0 ? (
          <div className="p-16 text-center bg-white/40 border border-white/80 rounded-[32px] opacity-50">
            <Users size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Belum ada kabar terbaru dari warga.</p>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={profile?.uid} 
              onLike={handleLike} 
            />
          ))
        )}
      </div>
    </div>
  );
};
