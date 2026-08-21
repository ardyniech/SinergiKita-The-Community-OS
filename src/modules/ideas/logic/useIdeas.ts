import { useState, useEffect } from 'react';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { CommunityIdea } from '../../../shared/models/ideas';
import { fetchCommunityIdeas, createCommunityIdea, reviewCommunityIdea } from '../storage/ideasStorage';

export function useIdeas(tenantId?: string, userId?: string, userName?: string) {
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSnap, setLastSnap] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const loadIdeas = async () => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { ideas: newIdeas, lastSnap: snap } = await fetchCommunityIdeas(tenantId, 15);
    setIdeas(newIdeas);
    setLastSnap(snap);
    setHasMore(newIdeas.length >= 15);
    setLoading(false);
  };

  const loadMoreIdeas = async () => {
    if (!tenantId || !lastSnap || !hasMore) return;
    const { ideas: nextIdeas, lastSnap: snap } = await fetchCommunityIdeas(tenantId, 15, lastSnap);
    setIdeas((prev) => [...prev, ...nextIdeas]);
    setLastSnap(snap);
    if (nextIdeas.length < 15) {
      setHasMore(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, [tenantId]);

  const handleCreateIdea = async (title: string, description: string, category?: string) => {
    if (!tenantId || !userId || !userName) return;
    const created = await createCommunityIdea(tenantId, userId, userName, 'Anggota', title, description, category);
    if (created) {
      setIdeas((prev) => [created, ...prev]);
    }
  };

  const handleReviewIdea = async (
    ideaId: string,
    status: 'didengar' | 'setuju' | 'follow-up' | 'pendalaman' | 'ditolak' | 'selesai',
    rating: number,
    reviewNote: string
  ) => {
    if (!userId) return;
    const ok = await reviewCommunityIdea(ideaId, status, rating, reviewNote, userName || userId);
    if (ok) {
      setIdeas((prev) =>
        prev.map((i) => (i.id === ideaId ? { ...i, status, rating, reviewNote, reviewedBy: userName } : i))
      );
    }
  };

  return {
    ideas,
    loading,
    hasMore,
    loadMoreIdeas,
    handleCreateIdea,
    handleReviewIdea,
    refresh: loadIdeas
  };
}
