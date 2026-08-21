import React, { useState } from 'react';
import { LetterHeader } from './LetterHeader';
import { LetterCard } from './LetterCard';
import { RequestLetterModal } from './RequestLetterModal';
import { ApproveLetterModal } from './ApproveLetterModal';
import { LetterPreviewModal } from './LetterPreviewModal';
import { useLetters } from '../logic/useLetters';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { LetterRequest } from '../../../shared/models/letters';
import { FileText, Inbox } from 'lucide-react';

export const LettersContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const { letters, myLetters, loading, error, requestLetter, approveLetter, rejectLetter } = useLetters(
    tenant?.id,
    profile
  );

  const [activeTab, setActiveTab] = useState<'my' | 'manage'>('my');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedForApprove, setSelectedForApprove] = useState<LetterRequest | null>(null);
  const [selectedForPreview, setSelectedForPreview] = useState<LetterRequest | null>(null);

  const isAdmin = checkAdmin(profile);
  const displayedLetters = activeTab === 'manage' && isAdmin ? letters : myLetters;
  const pendingCount = letters.filter(l => l.status === 'submitted').length;

  return (
    <div className="space-y-3 pb-6">
      <LetterHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRequestNew={() => setShowRequestModal(true)}
        isAdmin={isAdmin}
        pendingCount={pendingCount}
      />

      {error && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Memuat data surat...</div>
      ) : displayedLetters.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl space-y-1.5">
          <Inbox size={28} className="mx-auto text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">Belum Ada Surat</h4>
          <p className="text-[11px] text-slate-400">
            {activeTab === 'manage' 
              ? 'Belum ada pengajuan surat dari warga yang masuk.' 
              : 'Klik tombol "Ajukan Surat" untuk membuat permohonan surat pengantar.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayedLetters.map((l) => (
            <LetterCard
              key={l.id}
              letter={l}
              tenantName={tenant?.name || 'Komunitas Warga'}
              isAdmin={isAdmin}
              onPreview={setSelectedForPreview}
              onApprove={isAdmin ? setSelectedForApprove : undefined}
              onReject={isAdmin ? (item) => rejectLetter(item.id, 'Data belum sesuai') : undefined}
            />
          ))}
        </div>
      )}

      <RequestLetterModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={async (data) => { await requestLetter(data); }}
      />

      {selectedForApprove && (
        <ApproveLetterModal
          letter={selectedForApprove}
          isOpen={true}
          onClose={() => setSelectedForApprove(null)}
          onConfirm={async (num, name, role) => {
            await approveLetter(selectedForApprove.id, num, name, role);
          }}
          defaultSignerName={profile?.displayName || 'Ketua RT'}
        />
      )}

      {selectedForPreview && (
        <LetterPreviewModal
          letter={selectedForPreview}
          tenantName={tenant?.name || 'Komunitas Warga'}
          isOpen={true}
          onClose={() => setSelectedForPreview(null)}
        />
      )}
    </div>
  );
};
