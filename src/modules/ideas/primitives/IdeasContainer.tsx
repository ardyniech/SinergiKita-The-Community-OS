import React, { useState } from 'react';
import { Lightbulb, Plus, Star, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useIdeas } from '../logic/useIdeas';
import { useToast } from '../../../context/ToastContext';

export const IdeasContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const { ideas, loading, hasMore, loadMoreIdeas, handleCreateIdea, handleReviewIdea } = useIdeas(
    tenant?.id, profile?.uid, profile?.displayName || 'Anggota'
  );

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Inovasi');

  const [reviewingIdeaId, setReviewingIdeaId] = useState<string | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'didengar' | 'setuju' | 'follow-up' | 'pendalaman' | 'ditolak' | 'selesai'>('setuju');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewNote, setReviewNote] = useState('');

  const isAdminOrLeader = ['admin', 'ketua', 'satgas', 'superadmin'].includes(profile?.role || '');

  const onSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    await handleCreateIdea(title.trim(), description.trim(), selectedCategory);
    setTitle('');
    setDescription('');
    setShowForm(false);
    showToast('Gagasan Anda berhasil dikirim ke Pengurus Komunitas!');
  };

  const onSubmitReview = async (ideaId: string) => {
    await handleReviewIdea(ideaId, reviewStatus, reviewRating, reviewNote);
    setReviewingIdeaId(null);
    setReviewNote('');
    showToast('Status & rating gagasan berhasil diperbarui!');
  };

  return (
    <div className="px-2 sm:px-3 py-2 space-y-3 max-w-2xl mx-auto">
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lightbulb size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Gagasan Komunitas</h2>
            <p className="text-[10px] text-slate-500">Aspirasi, inovasi & masukan warga</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
        >
          <Plus size={14} />
          <span>Buat Gagasan</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmitIdea} className="bg-white p-3 rounded-2xl border border-amber-200 shadow-xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800">Ajukan Gagasan Baru</h3>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Judul Gagasan</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="mis. Pengadaan Lampu Jalan Jalur Selatan"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none font-medium"
            >
              <option value="Inovasi">Inovasi Komunitas</option>
              <option value="Infrastruktur">Fasilitas & Infrastruktur</option>
              <option value="Kegiatan">Kegiatan Sosial</option>
              <option value="Keamanan">Keamanan & Siskamling</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-600 mb-1">Penjelasan Gagasan</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan latar belakang dan dampak positif dari gagasan ini..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Send size={12} />
              <span>Kirim Gagasan</span>
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="p-6 text-center text-xs text-slate-400">Memuat gagasan komunitas...</div>
      ) : ideas.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-2xl">
          Belum ada gagasan diajukan. Jadilah yang pertama menyampaikan usulan!
        </div>
      ) : (
        <div className="space-y-2.5">
          {ideas.map((idea) => (
            <div key={idea.id} className="p-3 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                  {idea.category}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  idea.status === 'setuju' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  idea.status === 'pendalaman' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                  idea.status === 'ditolak' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                  'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {idea.status.toUpperCase()}
                </span>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900">{idea.title}</h3>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{idea.description}</p>
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Oleh: <strong>{idea.authorName}</strong></span>
                {idea.rating && (
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold">
                    <Star size={12} className="fill-amber-400" />
                    <span>{idea.rating}/5</span>
                  </div>
                )}
              </div>

              {idea.reviewNote && (
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-600 space-y-0.5">
                  <span className="font-bold text-slate-700 block">Tanggapan Pengurus ({idea.reviewedBy}):</span>
                  <p>{idea.reviewNote}</p>
                </div>
              )}

              {isAdminOrLeader && (
                <div className="pt-1">
                  {reviewingIdeaId === idea.id ? (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold text-amber-800 block">Penilaian Pengurus</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">Status</label>
                          <select
                            value={reviewStatus}
                            onChange={(e) => setReviewStatus(e.target.value as any)}
                            className="w-full text-[10px] p-1.5 bg-white border border-slate-200 rounded-lg"
                          >
                            <option value="didengar">DIDENGAR</option>
                            <option value="setuju">SETUJU</option>
                            <option value="pendalaman">PENDALAMAN</option>
                            <option value="follow-up">FOLLOW-UP</option>
                            <option value="selesai">SELESAI</option>
                            <option value="ditolak">DITOLAK</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-slate-600 block">Rating (1-5)</label>
                          <input
                            type="number"
                            min={1} max={5}
                            value={reviewRating}
                            onChange={(e) => setReviewRating(Number(e.target.value))}
                            className="w-full text-[10px] p-1.5 bg-white border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                      <input
                        type="text"
                        placeholder="Catatan peninjauan..."
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        className="w-full text-[10px] p-1.5 bg-white border border-slate-200 rounded-lg"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setReviewingIdeaId(null)}
                          className="px-2 py-1 text-[10px] text-slate-600 bg-white border rounded-lg font-bold"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => onSubmitReview(idea.id)}
                          className="px-2 py-1 text-[10px] text-white bg-amber-600 rounded-lg font-bold"
                        >
                          Simpan Review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setReviewingIdeaId(idea.id);
                        setReviewStatus(idea.status);
                        setReviewRating(idea.rating || 5);
                        setReviewNote(idea.reviewNote || '');
                      }}
                      className="text-[10px] font-bold text-amber-700 hover:underline block"
                    >
                      + Penilaian Pengurus / Satgas
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <div className="text-center pt-1">
              <button
                onClick={loadMoreIdeas}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Muat Lebih Banyak
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
