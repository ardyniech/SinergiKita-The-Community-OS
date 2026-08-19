import { useState, useEffect } from 'react';
import { ShoppingCart, Search, History, Loader2 } from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { POSProductCard } from './molecules/POSProductCard';

export default function POSModule() {
  const { profile } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    setError(null);
    const q = query(collection(db, 'products'), where('tenantId', '==', profile.tenantId));
    return onSnapshot(q, 
      (snap) => {
        setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("POS subscription failed:", err);
        setError("Gagal sinkronisasi data produk kasir.");
        setLoading(false);
      }
    );
  }, [profile?.tenantId]);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="p-4 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2 bg-white rounded-[40px] border border-gray-100">
        <Loader2 size={24} className="animate-spin text-orange-500" />
        <span>Memuat sistem kasir...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-xs text-red-500 bg-white rounded-[40px] border border-red-100 flex flex-col items-center gap-3 shadow-sm">
        <p className="font-bold">{error}</p>
        <button 
          onClick={() => { setLoading(true); setError(null); }} 
          className="px-2 py-2 bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-orange-700 transition-all min-h-[44px]"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[40px] p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <ShoppingCart size={24} />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight leading-none">Kasir Warung</h2>
        </div>
        <button className="w-10 h-10 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400"><History size={18} /></button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" placeholder="Cari produk..." value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map(product => <POSProductCard key={product.id} product={product} onAdd={() => {}} />)}
      </div>
    </div>
  );
}
