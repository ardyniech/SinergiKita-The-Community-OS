import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Tenant } from '../types';
import { Search, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';
import { SuperAdminHeader } from './molecules/SuperAdminHeader';
import { TenantCard } from './molecules/TenantCard';

export default function SuperAdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    return onSnapshot(query(collection(db, 'tenants')), (snap) => {
      const data = snap.docs.map(d => {
        const d_ = d.data();
        return { id: d.id, ...d_, createdAt: d_.createdAt?.toMillis?.() || d_.createdAt || Date.now() } as Tenant;
      }).sort((a, b) => b.createdAt - a.createdAt);
      setTenants(data); setLoading(false);
    });
  }, []);

  const handleApprove = async (id: string, status: 'approved' | 'pending') => {
    await updateDoc(doc(db, 'tenants', id), { status });
    const t = tenants.find(x => x.id === id);
    if (t && status === 'approved') await updateDoc(doc(db, 'users', t.ownerId), { role: 'admin', tenantId: id, isApproved: true });
  };

  const filtered = tenants.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const stats = { total: tenants.length, pending: tenants.filter(t => t.status === 'pending').length, approved: tenants.filter(t => t.status === 'approved').length };

  if (loading) return <div className="flex items-center justify-center p-20"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <SuperAdminHeader stats={stats} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Cari..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <button className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500"><LayoutGrid size={20} /></button>
      </div>
      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-16 rounded-3xl border-2 border-dashed border-gray-100 text-center"><h3 className="text-sm font-bold text-gray-900">Tidak ada hasil</h3></motion.div>
          ) : (
            filtered.map((t, i) => <TenantCard key={t.id} tenant={t} index={i} onApprove={handleApprove} />)
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

