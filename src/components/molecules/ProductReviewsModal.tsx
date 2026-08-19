import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Star, MessageSquare } from 'lucide-react';
import { MarketplaceItem, ProductReview } from '../../types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface ProductReviewsModalProps {
  item: MarketplaceItem;
  onClose: () => void;
}

export function ProductReviewsModal({ item, onClose }: ProductReviewsModalProps) {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reviews = item.reviews || [];
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const hasReviewed = reviews.some(r => r.reviewerUid === profile?.uid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newReview: ProductReview = {
        id: Date.now().toString(),
        rating,
        comment: comment.trim(),
        reviewerName: profile.displayName || profile.email.split('@')[0],
        reviewerUid: profile.uid,
        timestamp: Date.now()
      };

      await updateDoc(doc(db, 'marketplace', item.id), {
        reviews: arrayUnion(newReview)
      });
      showToast('Ulasan berhasil ditambahkan!');
      setComment('');
      setRating(5);
    } catch (error) {
      console.error("Error adding review:", error);
      showToast('Gagal menambahkan ulasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Ulasan & Rating</h3>
            <p className="text-[10px] text-gray-500 line-clamp-1">{item.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-white hover:text-gray-900 rounded-full transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="text-center">
              <span className="text-3xl font-black text-blue-600">{averageRating}</span>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">Rata-rata</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className={star <= Number(averageRating) ? 'text-orange-400 fill-orange-400' : 'text-gray-200 fill-gray-200'} />
                ))}
              </div>
              <p className="text-[10px] text-gray-500">Berdasarkan {reviews.length} ulasan</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Ulasan Pembeli</h4>
            {reviews.length === 0 ? (
              <p className="text-[11px] text-gray-400 italic text-center py-4">Belum ada ulasan untuk produk ini.</p>
            ) : (
              reviews.sort((a, b) => b.timestamp - a.timestamp).map(review => (
                <div key={review.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-900">{review.reviewerName}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star key={star} size={10} className={star <= review.rating ? 'text-orange-400 fill-orange-400' : 'text-gray-200'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 leading-relaxed">{review.comment}</p>
                  <p className="text-[8px] text-gray-400 mt-2">{new Date(review.timestamp).toLocaleDateString('id-ID')}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {profile?.uid !== item.sellerUid && !hasReviewed && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">Tulis Ulasan Anda</h4>
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 mb-3 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star size={24} className={star <= rating ? 'text-orange-400 fill-orange-400' : 'text-gray-300'} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Bagaimana kualitas produk/jasa ini?"
                className="w-full text-[11px] p-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none resize-none mb-2 transition-all placeholder:text-gray-400 text-gray-800"
                rows={3}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="w-full flex items-center justify-center gap-1.5 p-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-200"
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
        )}
      </motion.div>
    </div>
  );
}
