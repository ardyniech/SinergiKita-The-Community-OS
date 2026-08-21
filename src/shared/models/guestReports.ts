export interface GuestReport {
  id: string;
  tenantId: string;
  hostUserId: string;
  hostName: string;
  hostHouseNumber: string;
  hostPhone?: string;
  guestName: string;
  guestNik?: string;
  guestPhone?: string;
  guestRelation: string; // Misal: Saudara, Teman, Keluarga, Rekan Kerja
  guestCount: number;
  arrivalDate: string; // YYYY-MM-DD
  stayDurationDays: number;
  vehiclePlate?: string;
  purpose: string;
  status: 'reported' | 'verified_by_security' | 'checked_out';
  verifiedBy?: string;
  verifiedAt?: any;
  createdAt: any;
}
