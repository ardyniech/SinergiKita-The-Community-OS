import React, { useState } from 'react';
import { Send, Image as ImageIcon, Loader2 } from 'lucide-react';

interface PostFormProps {
  onPost: (content: string) => Promise<void>;
  submitting: boolean;
}

export function PostForm({ onPost, submitting }: PostFormProps) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    await onPost(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="card-3d bg-white p-4 border-white/60 shadow-3d-lg space-y-4">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
          <ImageIcon size={20} />
        </div>
        <textarea
          placeholder="Apa kabar hari ini, Tetangga?"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full bg-slate-50 border-none rounded-2xl p-3 text-[11px] font-bold text-slate-700 placeholder:text-slate-400 resize-none outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all min-h-[80px]"
        />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <button type="button" className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <ImageIcon size={20} />
          </button>
        </div>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn-3d bg-indigo-600 hover:bg-indigo-700 text-white px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-3d-sm active:translate-y-0.5 transition-all disabled:opacity-30 disabled:pointer-events-none"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Kirim Kabar
        </button>
      </div>
    </form>
  );
}
