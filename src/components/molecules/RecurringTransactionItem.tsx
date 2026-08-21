import { Calendar, Power, PowerOff } from 'lucide-react';

interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  status: 'active' | 'paused';
  nextBillingDate: string;
}

interface RecurringTransactionItemProps {
  item: RecurringTransaction;
  isTreasurer: boolean;
  onToggle: (id: string, status: string) => void;
}

export function RecurringTransactionItem({ item, isTreasurer, onToggle }: RecurringTransactionItemProps) {
  const isActive = item.status === 'active';

  return (
    <div className={`flex justify-between items-center p-4 rounded-2xl border transition-all duration-300 ${isActive ? 'bg-white shadow-3d-sm border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-3d-sm ${isActive ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-200 text-slate-400 border border-slate-300'}`}>
          <Calendar size={18} />
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.description}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rp {item.amount.toLocaleString()} • Next: {item.nextBillingDate}</p>
        </div>
      </div>
      {isTreasurer && (
        <button 
          onClick={() => onToggle(item.id, item.status)}
          className={`btn-3d w-10 h-10 rounded-2xl flex items-center justify-center transition-all border shadow-3d-sm ${isActive ? 'bg-white text-rose-500 border-rose-100 hover:bg-rose-50' : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'}`}
          title={isActive ? "Pause Protocol" : "Resume Protocol"}
        >
          {isActive ? <Power size={18} /> : <PowerOff size={18} />}
        </button>
      )}
    </div>
  );
}
