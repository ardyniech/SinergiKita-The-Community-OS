export interface Lesson {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  content: string; // Markdown supported
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  imageUrl?: string;
  order: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  lastAccessed: any;
}
