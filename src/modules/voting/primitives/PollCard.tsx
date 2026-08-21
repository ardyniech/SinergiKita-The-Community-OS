import React, { useState } from 'react';
import { Poll } from '../../../shared/models';
import { calculatePollResults, formatPollCategory, generatePollWhatsAppShareText } from '../logic/votingUtils';
import { Check, CheckCircle2, Share2, Users } from 'lucide-react';

interface PollCardProps {
  poll: Poll;
  tenantName: string;
  userVotedOptionId?: string;
  onVote: (pollId: string, optionId: string) => void;
  isAdmin: boolean;
  onClosePoll?: (pollId: string) => void;
}

export function PollCard({ poll, tenantName, userVotedOptionId, onVote, isAdmin, onClosePoll }: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const hasVoted = Boolean(userVotedOptionId);
  const isClosed = poll.status === 'closed';
  const showResults = hasVoted || isClosed;
  const optionsWithStats = calculatePollResults(poll.options, poll.totalVotes);

  const handleShare = () => {
    const text = generatePollWhatsAppShareText({
      tenantName, pollTitle: poll.title, category: formatPollCategory(poll.category),
      endDate: poll.endDate, totalVotes: poll.totalVotes
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100 text-[10px] font-bold">
              {formatPollCategory(poll.category)}
            </span>
            {isClosed ? (
              <span className="px-1.5 py-0.5 rounded border text-[10px] font-bold text-slate-600 bg-slate-100 border-slate-200">Ditutup</span>
            ) : hasVoted ? (
              <span className="px-1.5 py-0.5 rounded border text-[10px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={10} /> Sudah Memilih
              </span>
            ) : null}
          </div>
          <h3 className="text-xs font-bold text-slate-900 mt-1 leading-snug">{poll.title}</h3>
        </div>

        <button onClick={handleShare} className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors shrink-0">
          {copied ? <Check size={13} className="text-emerald-600" /> : <Share2 size={13} />}
        </button>
      </div>

      <div className="space-y-1.5">
        {optionsWithStats.map((opt) => {
          const isChosenByUser = userVotedOptionId === opt.id;
          const isSelected = selectedOption === opt.id;

          if (showResults) {
            return (
              <div key={opt.id} className="p-2 rounded-lg border border-slate-100 bg-slate-50/60 space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-semibold ${isChosenByUser ? 'text-indigo-700 font-bold' : 'text-slate-700'}`}>
                    {opt.text} {isChosenByUser && '✓'}
                  </span>
                  <span className="text-[10px] font-black text-slate-900">{opt.percentage}% ({opt.voteCount || 0})</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isChosenByUser ? 'bg-indigo-600' : 'bg-slate-400'}`} style={{ width: `${opt.percentage}%` }} />
                </div>
              </div>
            );
          }

          return (
            <button
              key={opt.id} onClick={() => setSelectedOption(opt.id)}
              className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                isSelected ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs' : 'border-slate-200 hover:border-slate-300 text-slate-800 font-medium'
              }`}
            >
              <span>{opt.text}</span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>

      {!showResults && (
        <button
          onClick={() => selectedOption && onVote(poll.id, selectedOption)} disabled={!selectedOption}
          className="w-full h-8.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
        >
          <CheckCircle2 size={13} />
          <span>Kirim Suara Saya</span>
        </button>
      )}

      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1"><Users size={11} /><span>{poll.totalVotes} Suara Masuk</span></div>
        <span>Batas: {poll.endDate || 'Fleksibel'}</span>
        {isAdmin && !isClosed && onClosePoll && (
          <button onClick={() => onClosePoll(poll.id)} className="text-rose-600 hover:underline font-bold">Tutup Polling</button>
        )}
      </div>
    </div>
  );
}
