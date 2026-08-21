export interface SocialPost {
  id: string;
  tenantId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  image?: string;
  likes: string[]; // Array of user IDs
  commentCount: number;
  timestamp: any;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: any;
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  category: 'Initiative' | 'Budget' | 'Policy';
  yesVotes: number;
  noVotes: number;
  status: 'active' | 'closed';
}

export interface SocialAlert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  helpers?: number;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: 'sparepart' | 'food' | 'service' | 'other';
  sellerName: string;
  sellerUid: string;
  whatsappLink: string;
  createdAt: number;
  tenantId: string;
  isNegotiable?: boolean;
  reviews?: ProductReview[];
}

export interface ProductReview {
  id: string;
  rating: number; // 1-5
  comment: string;
  reviewerName: string;
  reviewerUid: string;
  timestamp: number;
}

export interface CommunityData {
  balance: number;
  announcements: string[];
  fundingProjects: any[];
  marketplaceItems: any[];
  socialAlerts: any[];
}
