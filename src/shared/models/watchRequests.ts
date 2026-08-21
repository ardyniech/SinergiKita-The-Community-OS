export interface WatchRequest {
  id: string;
  tenantId: string;
  requesterId: string;
  requesterName: string;
  destinationNote?: string;
  lat?: number;
  lng?: number;
  status: 'pending' | 'watching' | 'done' | 'escalated';
  watcherId?: string;
  watcherName?: string;
  createdAt: number;
  updatedAt: number;
}
