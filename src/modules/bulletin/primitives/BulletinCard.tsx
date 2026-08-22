import React from 'react';
import { User } from 'lucide-react';
import { BulletinPost } from '../storage/bulletinStorage';
import { CATEGORY_MAP, BulletinCategory } from './bulletinCategories';

export const BulletinCard: React.FC<{ post: BulletinPost }> = ({ post }) => {
  const cat = CATEGORY_MAP[(post.category as BulletinCategory)] || CATEGORY_MAP.umum;
  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    : '';

  return (
    <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2">
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
};
