import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Loader2, RefreshCcw, TrendingUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CommunityInsights() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    memberCount: 0,
    balance: 0,
    transactionCount: 0,
    announcementCount: 0,
    projectCount: 0,
    inventoryCount: 0
  });

  useEffect(() => {
    if (!profile?.tenantId) return;

    // Fetch snapshot of counts for the summary
    const fetchCounts = async () => {
      try {
        setError(null);
        const qMembers = query(collection(db, 'users'), where('tenantId', '==', profile.tenantId));
        const qTransactions = query(collection(db, 'transactions'), where('tenantId', '==', profile.tenantId));
        const qAnnouncements = query(collection(db, 'announcements'), where('tenantId', '==', profile.tenantId));
        const qProjects = query(collection(db, 'projects'), where('tenantId', '==', profile.tenantId));
        const qProducts = query(collection(db, 'products'), where('tenantId', '==', profile.tenantId));

        const [members, transactions, announcements, projects, products] = await Promise.all([
          getDocs(qMembers),
          getDocs(qTransactions),
          getDocs(qAnnouncements),
          getDocs(qProjects),
          getDocs(qProducts)
        ]);

        let totalBalance = 0;
        transactions.forEach(doc => {
          const d = doc.data();
          totalBalance += d.type === 'credit' ? d.amount : -d.amount;
        });

        setStats({
          memberCount: members.size,
          balance: totalBalance,
          transactionCount: transactions.size,
          announcementCount: announcements.size,
          projectCount: projects.size,
          inventoryCount: products.size
        });
      } catch (err: any) {
        console.error("Gagal memuat data statistik komunitas:", err);
        setError("Gagal memuat data statistik komunitas. Silakan periksa koneksi internet Anda.");
      }
    };

    fetchCounts();
  }, [profile?.tenantId]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const headers: HeadersInit = { 'Content-Type': 'application/json' };
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers,
        body: JSON.stringify({ data: stats })
      });
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Gagal menghasilkan analisis.");
      }
      
      setSummary(result.summary);
    } catch (error: any) {
      console.error("Failed to generate insights:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (profile?.role !== 'admin') return null;

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-xl shadow-indigo-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-5 opacity-10">
        <Sparkles size={100} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight leading-none">Community Insights</h2>
              <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">Analisis AI</p>
            </div>
          </div>
          
          <button 
            onClick={generateInsights}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-indigo-900/20"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCcw size={12} />}
            {summary ? 'Refresh' : 'Mulai'}
          </button>
        </div>

        {!summary && !loading && (
          <div className="flex flex-col items-center justify-center py-8 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <TrendingUp size={40} className="text-white/20 mb-3" />
            <p className="text-[10px] font-bold text-white/60 text-center px-6">
              Klik tombol di atas untuk rangkuman eksekutif komunitas menggunakan Gemini AI.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={40} className="text-white/40 animate-spin mb-3" />
            <p className="text-[10px] font-bold text-white/60 animate-pulse">Menganalisis data komunitas...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm text-center">
            <p className="text-[10px] font-bold text-white/90">{error}</p>
          </div>
        )}

        {summary && !loading && (
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-md border border-white/20 max-h-[300px] overflow-y-auto custom-scrollbar">
            <div className="prose prose-invert prose-sm max-w-none prose-p:text-[11px] prose-p:text-white/90 prose-headings:text-white prose-li:text-[11px] prose-li:text-white/90">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
