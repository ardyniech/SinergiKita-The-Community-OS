import React from 'react';
import { Star } from 'lucide-react';
import { ProductReview } from '../../types';

interface ProductReviewsListProps {
  reviews: ProductReview[];
  averageRating: string;
}

export function ProductReviewsList({ reviews, averageRating }: ProductReviewsListProps) {
  return (
    <div className="overflow-y-auto p-4 flex-1">
      <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-100 dark:border-blue-900">
        <div className="text-center">
          <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{averageRating}</span>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Rata-rata</p>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                size={14}
                className={star <= Number(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700'}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-500">Berdasarkan {reviews.length} ulasan</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Ulasan Pembeli</h4>
        {reviews.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic text-center py-4">Belum ada ulasan untuk produk ini.</p>
        ) : (
          [...reviews].sort((a, b) => b.timestamp - a.timestamp).map(review => (
            <div key={review.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{review.reviewerName}</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={10}
                      className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">{review.comment}</p>
              <p className="text-[8px] text-slate-400 mt-2">{new Date(review.timestamp).toLocaleDateString('id-ID')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
