import { Plus } from 'lucide-react';

interface POSProductCardProps {
  product: any;
  onAdd: (product: any) => void;
}

export function POSProductCard({ product, onAdd }: POSProductCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:border-orange-200 transition-all group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-tight">
          {product.category || 'Umum'}
        </span>
        <p className="text-xs font-black text-gray-900">
          Rp {product.price?.toLocaleString('id-ID')}
        </p>
      </div>
      <h3 className="text-sm font-black text-gray-800 mb-4 line-clamp-1">{product.name}</h3>
      <button 
        onClick={() => onAdd(product)}
        className="w-full py-2 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all active:scale-95 shadow-sm"
      >
        <Plus size={14} />
        Tambah
      </button>
    </div>
  );
}
