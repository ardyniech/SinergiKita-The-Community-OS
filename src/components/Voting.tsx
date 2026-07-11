import { Proposal } from '../types';
import { CheckCircle2, XCircle, Users } from 'lucide-react';

interface VotingProps {
  proposals: Proposal[];
  onVote: (id: string, type: 'yes' | 'no') => void;
}

export default function Voting({ proposals, onVote }: VotingProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Budget': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Initiative': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Policy': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  return (
    <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-100">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Voting Komunitas</h3>
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Users size={10} /> {proposals.length} Aktif
        </span>
      </div>

      {proposals.map(proposal => {
        const total = proposal.yesVotes + proposal.noVotes;
        const yesPercent = total === 0 ? 0 : Math.round((proposal.yesVotes / total) * 100);
        const noPercent = total === 0 ? 0 : Math.round((proposal.noVotes / total) * 100);

        return (
          <div key={proposal.id} className="bg-white rounded-xl border border-gray-100 p-3.5 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getCategoryColor(proposal.category)}`}>
                {proposal.category}
              </span>
              <span className="text-[10px] text-gray-400 font-medium">#{proposal.id}</span>
            </div>
            
            <h4 className="font-bold text-gray-900 text-sm mb-1">{proposal.title}</h4>
            <p className="text-gray-500 text-[11px] leading-relaxed mb-4">{proposal.description}</p>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-green-600">Setuju ({yesPercent}%)</span>
                <span className="text-red-600">Tolak ({noPercent}%)</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full flex overflow-hidden">
                <div 
                  className="bg-green-500 transition-all duration-500 ease-out" 
                  style={{ width: `${total === 0 ? 0 : yesPercent}%` }} 
                />
                <div 
                  className="bg-red-500 transition-all duration-500 ease-out" 
                  style={{ width: `${total === 0 ? 0 : noPercent}%` }} 
                />
              </div>
              <p className="text-center text-[9px] text-gray-400">Total: {total} Suara Terkumpul</p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onVote(proposal.id, 'yes')} 
                className="flex-1 flex items-center justify-center gap-1.5 bg-green-50 text-green-700 text-xs py-2 rounded-lg font-bold hover:bg-green-100 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 size={14} />
                Setuju
              </button>
              <button 
                onClick={() => onVote(proposal.id, 'no')} 
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-700 text-xs py-2 rounded-lg font-bold hover:bg-red-100 active:scale-[0.98] transition-all"
              >
                <XCircle size={14} />
                Tolak
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
