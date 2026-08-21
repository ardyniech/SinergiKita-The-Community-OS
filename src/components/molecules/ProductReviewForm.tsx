import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

interface ProductReviewFormProps {
  rating: number;
  setRating: (rating: number) => void;
  comment: string;
  setComment: (comment: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function ProductReviewForm({
  rating,
  setRating,
  comment,
  setComment,
  isSubmitting,
  onSubmit
}: ProductReviewFormProps) {
  return (
    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
      <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
        Tulis Ulasan Anda
      </h4>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-3 justify-center">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 hover:scale-110 transition-transform cursor-pointer"
            >
              <Star
                size={22}
                className={star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-700'}
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Bagaimana kualitas produk/jasa ini?"
          className="w-full text-[11px] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none mb-2 transition-all placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
          rows={3}
          required
        />
        <button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-md shadow-blue-200 dark:shadow-none cursor-pointer"
        >
          {isSubmitting ? 'Mengirim...' : (
            <>
              <MessageSquare size={14} />
              Kirim Ulasan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
