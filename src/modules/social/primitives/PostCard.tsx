import React from 'react';
import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { SocialPost } from '../../../shared/models';

interface PostCardProps {
  post: SocialPost;
  isLiked: boolean;
  onLike: (postId: string) => void;
}

export function PostCard({ post, isLiked, onLike }: PostCardProps) {
  // Graceful fallback for legacy docs with likes array
  const displayLikeCount = post.likeCount ?? (post.likes?.length || 0);

  return (
    <div className="card-3d bg-white/70 border-white/60 shadow-3d-sm p-4 space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200 shadow-inner overflow-hidden">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[14px] font-black">{post.authorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-tight leading-tight">{post.authorName}</h4>
          </div>
        </div>
        <button className="text-slate-400 p-2"><MoreVertical size={16} /></button>
      </div>
      
      <p className="text-[11px] font-bold text-slate-600 leading-relaxed tracking-wide">{post.content}</p>
      
      {post.image && (
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-3d-sm">
          <img src={post.image} alt="Post content" className="w-full h-auto object-cover max-h-72" />
        </div>
      )}
      
      <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'}`}
          >
            <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]' : ''} />
            <span className="text-[10px] font-black tabular-nums">{displayLikeCount}</span>
          </button>
          
          <button className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-500 transition-colors">
            <MessageCircle size={18} />
            <span className="text-[10px] font-black tabular-nums">{post.commentCount}</span>
          </button>
        </div>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <Share2 size={18} />
        </button>
      </div>
    </div>
  );
}
