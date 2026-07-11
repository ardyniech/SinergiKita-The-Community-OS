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
  onToggle: (id: string, status: string) => void;
}

export function RecurringTransactionItem({ item, onToggle }: RecurringTransactionItemProps) {
  const isActive = item.status === 'active';

  return (
    <div className={`flex justify-between items-center p-3 rounded-xl border border-gray-50 ${isActive ? 'bg-white shadow-sm' : 'bg-gray-50 opacity-60'}`}>
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
          <Calendar size={16} />
        </div>
        <div>
          <p className="text-[11px] font-black text-gray-900">{item.description}</p>
          <p className="text-[9px] font-bold text-gray-400">Rp {item.amount.toLocaleString()} • {item.nextBillingDate}</p>
        </div>
      </div>
      <button 
        onClick={() => onToggle(item.id, item.status)}
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
      >
        {isActive ? <Power size={16} /> : <PowerOff size={16} />}
      </button>
    </div>
  );
}
