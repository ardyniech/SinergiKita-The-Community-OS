import { useState, useEffect } from 'react';
import { SocialPost, AppUser } from '../../../shared/models';
import { socialStorage } from '../storage/socialStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useSocial(tenantId: string | null, profile: AppUser | null) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!tenantId) return;
    return socialStorage.subscribeToFeed(tenantId, (data) => {
      setPosts(data);
      setLoading(false);
    });
  }, [tenantId]);

  const handleCreatePost = async (content: string, image?: string) => {
    if (!tenantId || !profile || !content.trim()) return;
    setSubmitting(true);
    try {
      await socialStorage.createPost(tenantId, {
        content,
        image,
        authorId: profile.uid,
        authorName: profile.displayName || profile.email.split('@')[0],
        authorAvatar: profile.photoURL
      });
      dispatcher.emit('AUDIT_LOG', `Post Created by ${profile.displayName}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string, likes: string[]) => {
    if (!profile) return;
    const hasLiked = likes.includes(profile.uid);
    await socialStorage.toggleLike(postId, profile.uid, hasLiked);
  };

  return {
    posts,
    loading,
    submitting,
    handleCreatePost,
    handleLike
  };
}
