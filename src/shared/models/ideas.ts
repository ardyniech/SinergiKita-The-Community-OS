export interface CommunityIdea {
  id: string;
  tenantId: string;
  authorId: string;
  authorName: string;
  authorRole?: string;
  title: string;
  description: string;
  category?: string;
  status: 'didengar' | 'setuju' | 'follow-up' | 'pendalaman' | 'ditolak' | 'selesai';
  rating?: number; // 1 - 5
  reviewNote?: string;
  reviewedBy?: string;
  createdAt: number;
  updatedAt: number;
}
