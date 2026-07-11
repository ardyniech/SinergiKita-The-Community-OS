import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, limit, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ShieldCheck, Zap, Users, Info, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Tip {
  id: string;
  title: string;
  description: string;
  type: 'safety' | 'speed' | 'community' | 'general';
}

const TYPE_ICONS: Record<string, any> = {
  safety: ShieldCheck,
  speed: Zap,
  community: Users,
  general: Info
};

const TYPE_COLORS: Record<string, string> = {
  safety: 'text-rose-600 bg-rose-50 border-rose-100',
  speed: 'text-amber-600 bg-amber-50 border-amber-100',
  community: 'text-blue-600 bg-blue-50 border-blue-100',
  general: 'text-gray-600 bg-gray-50 border-gray-100'
};

export default function SmartTipsCard() {
  const { profile } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const CACHE_KEY = `smart_tips_${profile?.tenantId}`;
  const CACHE_TIME = 6 * 60 * 60 * 1000; // 6 hours

  const fetchAIInsights = async (incidents: any[], avgResponseTime: number) => {
    if (!profile?.tenantId) return;
    
    try {
      const res = await fetch('/api/community/smart-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidents: incidents.map(i => ({
            title: i.title,
            severity: i.severity,
            createdAt: i.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
          })),
          avgResponseTime
        })
      });
      const data = await res.json();
      if (data.tips) {
        setTips(data.tips);
        // Cache the result
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          tips: data.tips,
          timestamp: Date.now()
        }));
      }
    } catch (err) {
      console.error("Failed to fetch smart tips:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!profile?.tenantId) return;

    // 1. Try to load from cache first
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { tips: cachedTips, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TIME) {
        setTips(cachedTips);
        setLoading(false);
        return;
      }
    }

    // 2. If no cache or expired, fetch data for analysis (once)
    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    getDocs(q).then(snapshot => {
      const incidents = snapshot.docs.map(doc => doc.data());
      const resolved = incidents.filter(i => i.status === 'resolved' && i.resolvedAt && i.createdAt);
      let avgTime = 0;
      if (resolved.length > 0) {
        const total = resolved.reduce((acc, i) => {
          const start = i.createdAt.toDate().getTime();
          const end = i.resolvedAt.toDate().getTime();
          return acc + (end - start);
        }, 0);
        avgTime = Math.round((total / resolved.length) / 60000);
      }
      fetchAIInsights(incidents, avgTime);
    }).catch(err => {
      console.error("Firestore error:", err);
      setLoading(false);
    });
  }, [profile?.tenantId]);

  const handleRefresh = async () => {
    if (!profile?.tenantId) return;
    setRefreshing(true);
    
    // Manual force refresh
    const q = query(
      collection(db, 'social_alerts'),
      where('tenantId', '==', profile.tenantId),
      where('type', '==', 'incident'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    try {
      const snapshot = await getDocs(q);
      const incidents = snapshot.docs.map(doc => doc.data());
      const resolved = incidents.filter(i => i.status === 'resolved' && i.resolvedAt && i.createdAt);
      let avgTime = 0;
      if (resolved.length > 0) {
        const total = resolved.reduce((acc, i) => {
          const start = i.createdAt.toDate().getTime();
          const end = i.resolvedAt.toDate().getTime();
          return acc + (end - start);
        }, 0);
        avgTime = Math.round((total / resolved.length) / 60000);
      }
      await fetchAIInsights(incidents, avgTime);
    } catch (err) {
      console.error("Manual refresh error:", err);
      setRefreshing(false);
    }
  };

  if (loading && tips.length === 0) return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse h-40 mb-4" />
  );

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Sparkles size={14} />
          </div>
          <div>
            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-tight">AI Smart Tips</h3>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Analisis Kesehatan Komunitas</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {tips.map((tip, idx) => {
            const Icon = TYPE_ICONS[tip.type] || Info;
            return (
              <motion.div
                key={tip.id || idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-2.5 rounded-xl border ${TYPE_COLORS[tip.type]} flex gap-3`}
              >
                <div className="shrink-0 mt-0.5">
                  <Icon size={14} />
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-tight mb-0.5">{tip.title}</h4>
                  <p className="text-[9px] font-medium leading-relaxed opacity-80">{tip.description}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {tips.length === 0 && !loading && (
          <div className="text-center py-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Belum ada analisis tersedia.</p>
          </div>
        )}
      </div>
    </div>
  );
}
