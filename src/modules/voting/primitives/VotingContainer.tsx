import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useVoting } from '../logic/useVoting';
import { VotingHeader } from './VotingHeader';
import { PollCard } from './PollCard';
import { CreatePollModal } from './CreatePollModal';
import { Loader2, Vote } from 'lucide-react';

export const VotingContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const { polls, votedPollMap, loading, submitting, handleCreatePoll, handleVote, handleClosePoll } = useVoting(profile?.tenantId || null, profile);

  const [activeFilter, setActiveFilter] = useState<'active' | 'closed'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = ['admin', 'ketua', 'bendahara', 'sekretaris', 'superadmin'].includes(profile?.role || '');
  const tenantName = tenant?.name || profile?.tenantName || 'Komunitas Warga';

  const activePolls = polls.filter(p => p.status === 'active');
  const closedPolls = polls.filter(p => p.status === 'closed');
  const displayedPolls = activeFilter === 'active' ? activePolls : closedPolls;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <VotingHeader
        onAddPoll={() => setShowCreateModal(true)}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        isAdmin={isAdmin}
        activeCount={activePolls.length}
      />

      <div className="animate-in fade-in duration-300">
        {displayedPolls.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-1">
            <Vote size={24} className="mx-auto text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">
              {activeFilter === 'active' ? 'Belum ada rembuk warga yang aktif.' : 'Belum ada rembuk yang selesai.'}
            </p>
            <p className="text-[10px] text-slate-400">Gunakan fitur ini untuk mengambil keputusan bersama secara mufakat.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayedPolls.map(poll => (
              <PollCard
                key={poll.id}
                poll={poll}
                tenantName={tenantName}
                userVotedOptionId={votedPollMap.get(poll.id)}
                onVote={handleVote}
                isAdmin={isAdmin}
                onClosePoll={handleClosePoll}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePollModal
          submitting={submitting}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePoll}
        />
      )}
    </div>
  );
};
