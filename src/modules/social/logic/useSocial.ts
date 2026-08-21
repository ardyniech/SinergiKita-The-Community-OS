import { useState, useEffect, useCallback } from 'react';
import { SocialPost, AppUser } from '../../../shared/models';
import { socialStorage } from '../storage/socialStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useSocial(tenantId: string | null, profile: AppUser | null) {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});

  const loadPosts = useCallback(async (isNextPage = false) => {
    if (!tenantId) return;
    setLoading(true);
    
    const { posts: newPosts, lastVisible } = await socialStorage.fetchFeed(tenantId, isNextPage ? lastDoc : null);
    
    if (newPosts.length > 0) {
      setPosts(prev => isNextPage ? [...prev, ...newPosts] : newPosts);
      setLastDoc(lastVisible);
      setHasMore(newPosts.length === 20); // pageSize is 20
      
      // Load user likes
      if (profile?.uid) {
        newPosts.forEach(async (post) => {
          const liked = await socialStorage.checkUserLiked(post.id, profile.uid);
          setUserLikes(prev => ({ ...prev, [post.id]: liked }));
        });
      }
    } else {
      setHasMore(false);
      if (!isNextPage) setPosts([]);
    }
    setLoading(false);
  }, [tenantId, lastDoc, profile?.uid]);

  useEffect(() => {
    loadPosts();
  }, [tenantId]); // Initial load

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
      // Refresh feed
      loadPosts();
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (!profile) return;
    const isLiked = userLikes[postId] || false;
    // Optimistic UI update
    setUserLikes(prev => ({ ...prev, [postId]: !isLiked }));
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        // Handle undefined likeCount gracefully (migration)
        const currentLikes = p.likeCount || (p.likes ? p.likes.length : 0);
        return { ...p, likeCount: currentLikes + (!isLiked ? 1 : -1) };
      }
      return p;
    }));
    
    try {
      await socialStorage.toggleLike(postId, profile.uid);
    } catch (err) {
      // Revert on error
      setUserLikes(prev => ({ ...prev, [postId]: isLiked }));
      loadPosts();
    }
  };

  return {
    posts,
    loading,
    submitting,
    hasMore,
    userLikes,
    loadMore: () => loadPosts(true),
    handleCreatePost,
    handleLike
  };
}
