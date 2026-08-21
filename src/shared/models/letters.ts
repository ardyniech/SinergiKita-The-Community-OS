export type LetterType = 
  | 'pengantar_skck' 
  | 'domisili' 
  | 'keterangan_usaha' 
  | 'keterangan_tidak_mampu' 
  | 'keterangan_kematian' 
  | 'keterangan_kelahiran' 
  | 'pengantar_umum';

export type LetterRequestStatus = 'submitted' | 'approved' | 'rejected' | 'completed';

export interface LetterRequest {
  id: string;
  tenantId: string;
  userId: string;
  citizenName: string;
  nik: string;
  houseNumber: string;
  phoneNumber?: string;
  letterType: LetterType;
  purpose: string;
  status: LetterRequestStatus;
  letterNumber?: string;
  notes?: string;
  signerName?: string;
  signerRole?: string;
  issuedAt?: any;
  createdAt: any;
}
