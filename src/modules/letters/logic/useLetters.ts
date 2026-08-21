import { useState, useEffect } from 'react';
import { LetterRequest, LetterRequestStatus, LetterType } from '../../../shared/models/letters';
import { AppUser } from '../../../shared/models/auth';
import { subscribeLetters, submitLetterRequest, updateLetterStatus } from '../storage/lettersStorage';

export function useLetters(tenantId?: string, user?: AppUser | null) {
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeLetters(
      tenantId,
      (data) => {
        setLetters(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError('Gagal memuat daftar pengajuan surat');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [tenantId]);

  const handleRequestLetter = async (params: {
    letterType: LetterType;
    purpose: string;
    nik: string;
  }) => {
    if (!tenantId || !user) throw new Error('Pengguna belum terdaftar');
    return submitLetterRequest({
      tenantId,
      userId: user.uid,
      citizenName: user.displayName || 'Warga',
      nik: params.nik,
      houseNumber: user.houseNumber || user.address || '-',
      phoneNumber: user.phoneNumber || user.phone || '',
      letterType: params.letterType,
      purpose: params.purpose,
      status: 'submitted'
    });
  };

  const handleApprove = async (id: string, letterNumber: string, signerName: string, signerRole: string) => {
    await updateLetterStatus(id, 'approved', { letterNumber, signerName, signerRole });
  };

  const handleReject = async (id: string, notes: string) => {
    await updateLetterStatus(id, 'rejected', { notes });
  };

  return {
    letters,
    myLetters: letters.filter(l => l.userId === user?.uid),
    loading,
    error,
    requestLetter: handleRequestLetter,
    approveLetter: handleApprove,
    rejectLetter: handleReject
  };
}
