import { useState, useEffect } from 'react';

type Recommendation = {
  id: number;
  title: string;
  description: string;
};

export default function RecommendationsModule() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/recommendations')
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal memuat rekomendasi");
        return data;
      })
      .then(data => {
        setRecommendations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const dismiss = (id: number) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  if (loading) return <div className="p-4 text-center text-[10px] text-gray-400">Analisa AI sedang berjalan...</div>;

  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-2">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-800">Rekomendasi AI</h2>
        <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Beta</span>
      </div>
      <div className="flex flex-col gap-2">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-blue-50/50 p-2.5 rounded-lg text-xs border border-blue-100/50 hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start">
              <p className="font-bold text-blue-900">{rec.title}</p>
              <button onClick={() => dismiss(rec.id)} className="text-blue-400 hover:text-blue-600 font-bold px-1">×</button>
            </div>
            <p className="text-blue-800/80 mt-1 leading-relaxed">{rec.description}</p>
          </div>
        ))}
        {recommendations.length === 0 && <p className="text-xs text-gray-500 italic text-center py-2">Semua rekomendasi telah ditinjau.</p>}
      </div>
    </div>
  );
}
