import { useState } from 'react';
import { MarketplaceItem, ProductReview } from '../types';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function useProductReviews(item: MarketplaceItem) {
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

  return {
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
  };
}
