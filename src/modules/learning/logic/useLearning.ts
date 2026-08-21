import { useState, useEffect } from 'react';
import { Lesson, AppUser } from '../../../shared/models';
import { learningStorage } from '../storage/learningStorage';
import { dispatcher } from '../../../core/dispatcher';

export function useLearning(tenantId: string | null, profile: AppUser | null) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) return;
    return learningStorage.subscribeToLessons(tenantId, (data) => {
      setLessons(data);
      setLoading(false);
    });
  }, [tenantId]);

  const completeLesson = async (lessonId: string) => {
    if (!profile) return;
    await learningStorage.markAsCompleted(profile.uid, lessonId);
    dispatcher.emit('AUDIT_LOG', `Lesson Completed: ${lessonId} by ${profile.displayName}`);
  };

  return {
    lessons,
    loading,
    completeLesson
  };
}
