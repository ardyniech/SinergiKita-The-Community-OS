export type PollStatus = 'draft' | 'active' | 'closed' | 'archived';

export interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

export interface Poll {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'rembuk_rt' | 'pemilihan' | 'keamanan' | 'fasilitas' | 'anggaran';
  options: PollOption[];
  totalVotes: number;
  status: PollStatus;
  startDate: string;
  endDate: string;
  creatorId: string;
  creatorName: string;
  createdAt?: any;
}

export interface PollVote {
  id: string;
  tenantId: string;
  pollId: string;
  optionId: string;
  voterId: string;
  voterName: string;
  voterHouseNo: string;
  timestamp?: any;
}
