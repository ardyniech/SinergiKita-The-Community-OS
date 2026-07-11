import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Timer, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { motion } from 'motion/react';

export default function ResponseTimeCard() {
  const { profile } = useAuth();
  const [avgTimeMinutes, setAvgTimeMinutes] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.tenantId) return;

    // Fetch last 50 resolved incidents to calculate average
    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      where('status', '==', 'resolved'),
      orderBy('resolvedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        setAvgTimeMinutes(null);
        setLoading(false);
        return;
      }

      let totalDurationMs = 0;
      let count = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.createdAt && data.resolvedAt) {
          const start = data.createdAt.toDate().getTime();
          const end = data.resolvedAt.toDate().getTime();
          totalDurationMs += (end - start);
          count++;
        }
      });

      if (count > 0) {
        setAvgTimeMinutes(Math.round((totalDurationMs / count) / 60000));
      } else {
        setAvgTimeMinutes(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [profile?.tenantId]);

  if (loading) return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse h-24" />
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Timer size={48} className="text-blue-600" />
      </div>

      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
          <Timer size={14} />
        </div>
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Responsivitas</h3>
      </div>

      <div className="flex items-end gap-2">
        <div className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
          {avgTimeMinutes !== null ? `${avgTimeMinutes}m` : '--'}
        </div>
        <div className="flex flex-col mb-0.5">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tight leading-none">Rata-rata Respon</span>
          <div className="flex items-center gap-1 mt-1">
             {avgTimeMinutes === null ? (
               <Minus size={10} className="text-gray-300" />
             ) : avgTimeMinutes < 30 ? (
               <TrendingDown size={10} className="text-green-500" />
             ) : (
               <TrendingUp size={10} className="text-amber-500" />
             )}
             <span className={`text-[8px] font-black uppercase ${avgTimeMinutes === null ? 'text-gray-300' : avgTimeMinutes < 30 ? 'text-green-500' : 'text-amber-500'}`}>
               {avgTimeMinutes === null ? 'No Data' : avgTimeMinutes < 30 ? 'Sangat Cepat' : 'Perlu Atensi'}
             </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
