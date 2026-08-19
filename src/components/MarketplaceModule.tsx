import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAudit } from '../context/AuditContext';
import { MarketplaceItem } from '../types';
import { ShoppingBag, Wrench, Utensils, Box } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { AnimatePresence, motion } from 'motion/react';
import { MarketplaceHeader } from './molecules/MarketplaceHeader';
import { MarketplaceFilters } from './molecules/MarketplaceFilters';
import { MarketplaceForm } from './molecules/MarketplaceForm';
import { ProductCard } from './molecules/ProductCard';
import { ProductReviewsModal } from './molecules/ProductReviewsModal';

const CATEGORIES = [
  { id: 'sparepart', label: 'Sparepart', icon: Wrench, color: 'text-orange-500' },
  { id: 'food', label: 'Kuliner', icon: Utensils, color: 'text-red-500' },
  { id: 'service', label: 'Jasa', icon: ShoppingBag, color: 'text-blue-500' },
  { id: 'other', label: 'Lainnya', icon: Box, color: 'text-gray-500' },
];

export default function MarketplaceModule() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { addAuditEntry } = useAudit();
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newItem, setNewItem] = useState({ name: '', price: '', description: '', category: 'other' as any, isNegotiable: true });
  const [selectedItemForReview, setSelectedItemForReview] = useState<MarketplaceItem | null>(null);

  useEffect(() => {
    if (!profile?.tenantId) return;
    return onSnapshot(query(collection(db, 'marketplace'), where('tenantId', '==', profile.tenantId), orderBy('createdAt', 'desc')), (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as MarketplaceItem)));
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.tenantId) return;
    const waLink = `https://wa.me/${(profile.phoneNumber || '').replace(/^0/, '62')}?text=Halo%20${profile.displayName},%20saya%20tertarik%20dengan%20${newItem.name}`;
    await addDoc(collection(db, 'marketplace'), { ...newItem, price: Number(newItem.price), sellerName: profile.displayName || 'Brother', sellerUid: profile.uid, whatsappLink: waLink, tenantId: profile.tenantId, createdAt: Date.now(), reviews: [] });
    addAuditEntry(`Menambahkan listing produk: ${newItem.name}`);
    setNewItem({ name: '', price: '', description: '', category: 'other', isNegotiable: true });
    setIsAdding(false);
    showToast('Iklan berhasil dipasang!');
  };

  const filtered = items.filter(i => (filter === 'all' || i.category === filter) && (i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.description?.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <MarketplaceHeader onAdd={() => setIsAdding(!isAdding)} isAdding={isAdding} />
        <MarketplaceFilters searchQuery={searchQuery} setSearchQuery={setSearchQuery} filter={filter} setFilter={setFilter} categories={CATEGORIES} />
      </div>
      <AnimatePresence>{isAdding && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><MarketplaceForm newItem={newItem} setNewItem={setNewItem} onSubmit={handleAddItem} onCancel={() => setIsAdding(false)} categories={CATEGORIES} /></motion.div>}</AnimatePresence>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(item => <ProductCard key={item.id} item={item} category={CATEGORIES.find(c => c.id === item.category) || CATEGORIES[3]} isOwner={profile?.uid === item.sellerUid} onDelete={async (id) => { await deleteDoc(doc(db, 'marketplace', id)); addAuditEntry(`Menghapus listing produk: ${item.name}`); showToast('Iklan dihapus'); }} onShowReviews={setSelectedItemForReview} />)}
        {filtered.length === 0 && !loading && <div className="col-span-full py-12 flex flex-col items-center justify-center opacity-30"><ShoppingBag size={48} className="text-gray-400 mb-2" /><p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Belum ada iklan tersedia</p></div>}
      </div>

      <AnimatePresence>
        {selectedItemForReview && (
          <ProductReviewsModal 
            item={selectedItemForReview} 
            onClose={() => setSelectedItemForReview(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
