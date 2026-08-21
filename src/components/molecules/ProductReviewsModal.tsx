import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { MarketplaceItem } from '../../types';
import { useProductReviews } from '../../hooks/useProductReviews';
import { ProductReviewsList } from './ProductReviewsList';
import { ProductReviewForm } from './ProductReviewForm';

interface ProductReviewsModalProps {
  item: MarketplaceItem;
  onClose: () => void;
}

export function ProductReviewsModal({ item, onClose }: ProductReviewsModalProps) {
  const {
    rating,
    setRating,
    comment,
    setComment,
    isSubmitting,
    reviews,
    averageRating,
    hasReviewed,
    profile,
    handleSubmit
  } = useProductReviews(item);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800"
      >
        <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">
              Ulasan & Rating
            </h3>
            <p className="text-[10px] text-slate-500 line-clamp-1">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <ProductReviewsList reviews={reviews} averageRating={averageRating} />

        {profile?.uid !== item.sellerUid && !hasReviewed && (
          <ProductReviewForm
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        )}
      </motion.div>
    </div>
  );
}
