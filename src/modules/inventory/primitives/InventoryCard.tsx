import React from 'react';
import { PackageCheck, MapPin, Phone, ArrowUpRight } from 'lucide-react';
import { InventoryItem } from '../../../shared/models';
import { getConditionBadge, formatInventoryCategory } from '../logic/inventoryUtils';

interface InventoryCardProps {
  item: InventoryItem;
  onBorrow: (item: InventoryItem) => void;
}

export function InventoryCard({ item, onBorrow }: InventoryCardProps) {
  const cond = getConditionBadge(item.condition);
  const isAvailable = (item.availableQuantity || 0) > 0;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2.5">
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md border border-teal-100 text-[10px] font-bold">
              {formatInventoryCategory(item.category)}
            </span>
            <span className={`px-1.5 py-0.5 rounded border text-[10px] font-bold ${cond.color}`}>
              {cond.label}
            </span>
          </div>
          <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">{item.name}</h3>
          {item.notes && <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{item.notes}</p>}
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-slate-400 block font-medium">Ketersediaan</span>
          <span className={`text-xs font-black ${isAvailable ? 'text-emerald-600' : 'text-rose-600'}`}>
            {item.availableQuantity} / {item.totalQuantity} unit
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 truncate">
          <MapPin size={11} className="text-slate-400 shrink-0" />
          <span className="truncate">{item.location || 'Pos Ronda / Gudang RT'}</span>
        </div>
        {item.picName && (
          <div className="flex items-center gap-1 text-slate-400 shrink-0">
            <Phone size={10} />
            <span>PIC: {item.picName}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => onBorrow(item)}
        disabled={!isAvailable}
        className={`w-full h-8.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors ${
          isAvailable
            ? 'bg-teal-600 hover:bg-teal-700 text-white'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <PackageCheck size={14} />
        <span>{isAvailable ? 'Ajukan Pinjam' : 'Stok Sedang Habis'}</span>
      </button>
    </div>
  );
}
