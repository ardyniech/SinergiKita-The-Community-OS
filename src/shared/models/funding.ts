export interface FundingProject {
  id: string;
  tenantId: string;
  creatorId: string;
  creatorName: string;
  title: string;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  category: 'social' | 'infrastructure' | 'event' | 'business';
  status: 'active' | 'funded' | 'completed' | 'cancelled';
  deadline: string;
  createdAt: any;
  images?: string[];
}

export interface Contribution {
  id: string;
  projectId: string;
  tenantId: string;
  contributorId: string;
  contributorName: string;
  amount: number;
  message?: string;
  timestamp: any;
  status: 'pending' | 'verified' | 'failed';
}
