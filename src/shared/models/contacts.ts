export type ContactCategory = 'darurat' | 'kesehatan' | 'keamanan' | 'layanan_publik' | 'fasilitas_rt';

export interface EmergencyContact {
  id: string;
  tenantId: string;
  name: string;
  category: ContactCategory;
  phone: string;
  address?: string;
  description?: string;
  isImportant?: boolean;
  createdAt: any;
}
