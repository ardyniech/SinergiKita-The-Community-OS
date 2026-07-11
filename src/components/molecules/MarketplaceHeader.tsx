import { Store, Plus } from 'lucide-react';

interface MarketplaceHeaderProps {
  onAdd: () => void;
  isAdding: boolean;
}

export function MarketplaceHeader({ onAdd, isAdding }: MarketplaceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Store size={18} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Pasar Brotherhood</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ekonomi Mandiri Ojol</p>
        </div>
      </div>
      <button
        onClick={onAdd}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-lg ${
          isAdding ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white shadow-blue-100'
        }`}
      >
        <Plus size={18} className={isAdding ? 'rotate-45 transition-transform' : ''} />
      </button>
    </div>
  );
}
