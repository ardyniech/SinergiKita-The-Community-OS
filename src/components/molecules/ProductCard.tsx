import { MarketplaceItem } from '../../types';
import { LucideIcon, Trash2, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface ProductCardProps {
  item: MarketplaceItem;
  category: Category;
  isOwner: boolean;
  onDelete: (id: string) => void;
}

export function ProductCard({ item, category, isOwner, onDelete }: ProductCardProps) {
  const Icon = category.icon;

  return (
    <motion.div
      layout
      className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className={`p-2 rounded-lg bg-gray-50 ${category.color} group-hover:scale-110 transition-transform`}>
          <Icon size={16} />
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Harga</p>
          <p className="text-sm font-black text-blue-600">Rp {item.price.toLocaleString('id-ID')}</p>
        </div>
      </div>

      <h4 className="text-xs font-black text-gray-900 line-clamp-1 uppercase tracking-tight mb-1">{item.name}</h4>
      <div className="flex gap-1 mb-1.5">
        {item.isNegotiable && (
          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[7px] font-black uppercase tracking-widest border border-blue-100">Nego</span>
        )}
        <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 rounded text-[7px] font-black uppercase tracking-widest border border-gray-100">Ready</span>
      </div>
      <p className="text-[10px] text-gray-500 leading-snug line-clamp-2 h-7 mb-3">{item.description || 'Tidak ada deskripsi.'}</p>

      <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div>
          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Penjual</p>
          <p className="text-[10px] font-black text-gray-700">{item.sellerName}</p>
        </div>
        <div className="flex gap-2">
          {isOwner ? (
            <button
              onClick={() => onDelete(item.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <a
              href={item.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-600 transition-all"
            >
              <MessageCircle size={12} />
              Beli
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
