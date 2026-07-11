import { Check } from 'lucide-react';

interface BudgetEditorProps {
  tempBudget: { total: string; threshold: string };
  setTempBudget: (val: any) => void;
  onUpdate: () => void;
}

export function BudgetEditor({ tempBudget, setTempBudget, onUpdate }: BudgetEditorProps) {
  return (
    <div className="bg-blue-50 p-3 rounded-xl mb-3 space-y-2 border border-blue-100 animate-in fade-in duration-200">
      <div className="space-y-1">
        <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Total Budget (Rp)</label>
        <input 
          type="number" 
          className="w-full text-xs p-2.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
          value={tempBudget.total}
          onChange={e => setTempBudget((prev: any) => ({ ...prev, total: e.target.value }))}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Threshold Notifikasi (%)</label>
        <div className="flex gap-2">
          <input 
            type="number" 
            className="flex-1 text-xs p-2.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
            value={tempBudget.threshold}
            onChange={e => setTempBudget((prev: any) => ({ ...prev, threshold: e.target.value }))}
          />
          <button 
            onClick={onUpdate}
            className="bg-blue-600 text-white px-3 rounded-lg hover:bg-blue-700 font-bold"
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
