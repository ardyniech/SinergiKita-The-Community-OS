import React from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, Loader2 } from 'lucide-react';
import { CartItem } from '../../../shared/models';

interface CartViewProps {
  cart: CartItem[];
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  total: number;
  onCheckout: (method: 'cash' | 'qris' | 'transfer') => Promise<void>;
  processing: boolean;
}

export function CartView({ cart, onUpdateQty, onRemove, total, onCheckout, processing }: CartViewProps) {
  return (
    <div className="card-3d bg-white/80 border-white/60 shadow-3d-lg rounded-[32px] overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-indigo-600" />
          <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Keranjang Belanja</h3>
        </div>
        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black tabular-nums">{cart.length} Item</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
        {cart.length === 0 ? (
          <div className="py-20 text-center opacity-30">
            <ShoppingCart size={40} className="mx-auto mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">Keranjang Kosong</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-3d-sm">
              <div className="min-w-0">
                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight truncate">{item.name}</h4>
                <p className="text-[10px] font-bold text-indigo-600 tabular-nums">Rp {item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onUpdateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Minus size={14} /></button>
                <span className="text-[11px] font-black w-6 text-center">{item.quantity}</span>
                <button onClick={() => onUpdateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Plus size={14} /></button>
                <button onClick={() => onRemove(item.id)} className="ml-1 text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-5 bg-slate-900 text-white space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Total Bayar</span>
          <span className="text-2xl font-black tabular-nums tracking-tighter">Rp {total.toLocaleString()}</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button 
            disabled={processing || cart.length === 0}
            onClick={() => onCheckout('cash')}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 disabled:opacity-30"
          >
            <Banknote size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Tunai</span>
          </button>
          <button 
            disabled={processing || cart.length === 0}
            onClick={() => onCheckout('qris')}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-500/80 hover:bg-emerald-500 transition-all border border-emerald-400/50 disabled:opacity-30"
          >
            <QrCode size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">QRIS</span>
          </button>
          <button 
            disabled={processing || cart.length === 0}
            onClick={() => onCheckout('transfer')}
            className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-indigo-500/80 hover:bg-indigo-500 transition-all border border-indigo-400/50 disabled:opacity-30"
          >
            <CreditCard size={20} />
            <span className="text-[8px] font-black uppercase tracking-widest">Transfer</span>
          </button>
        </div>
      </div>
    </div>
  );
}
