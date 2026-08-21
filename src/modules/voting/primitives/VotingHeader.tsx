import React from 'react';
import { Vote, Plus, CheckCircle2, ListFilter } from 'lucide-react';

interface VotingHeaderProps {
  onAddPoll: () => void;
  activeFilter: 'active' | 'closed';
  setActiveFilter: (filter: 'active' | 'closed') => void;
  isAdmin: boolean;
  activeCount: number;
}

export function VotingHeader({
  onAddPoll,
  activeFilter,
  setActiveFilter,
  isAdmin,
  activeCount
}: VotingHeaderProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Vote size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Suara Warga & E-Voting</h2>
            <p className="text-[10px] text-slate-400">Musyawarah mufakat & jajak pendapat digital</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onAddPoll}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Buat Rembuk</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl">
        <button
          onClick={() => setActiveFilter('active')}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListFilter size={13} className={activeFilter === 'active' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Sedang Berjalan ({activeCount})</span>
        </button>

        <button
          onClick={() => setActiveFilter('closed')}
          className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeFilter === 'closed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle2 size={13} className={activeFilter === 'closed' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Selesai / Ditutup</span>
        </button>
      </div>
    </div>
  );
}
