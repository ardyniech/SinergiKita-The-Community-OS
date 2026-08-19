import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  HeartHandshake, Plus, Users, TrendingUp, 
  Loader2, AlertCircle, X, Check, Award, FileText 
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp, updateDoc, doc, increment 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FundingProject, FundingContribution } from '../../types';
import { FundingCertificateModal } from './FundingCertificateModal';

export function FundingModule() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'projects' | 'my_contributions'>('projects');
  const [projects, setProjects] = useState<FundingProject[]>([]);
  const [myContributions, setMyContributions] = useState<FundingContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [category, setCategory] = useState('Sosial & Fasilitas');
  const [description, setDescription] = useState('');

  // Contribution State
  const [contributingProject, setContributingProject] = useState<FundingProject | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Certificate Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<FundingContribution | null>(null);

  const tenantId = profile?.tenantId;

  // Real-time listener for Funding Projects
  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }

    const qProjects = query(
      collection(db, 'projects'),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc')
    );

    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FundingProject));
      setProjects(data);
      setLoading(false);
    }, (error) => {
      console.warn("Funding projects listener error:", error);
      setLoading(false);
    });

    const qContributions = query(
      collection(db, 'funding_contributions'),
      where('tenantId', '==', tenantId),
      where('uid', '==', profile?.uid || '')
    );

    const unsubContributions = onSnapshot(qContributions, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FundingContribution));
      setMyContributions(data);
    }, (error) => {
      console.warn("Contributions listener error:", error);
    });

    return () => {
      unsubProjects();
      unsubContributions();
    };
  }, [tenantId, profile?.uid]);

  // Handle Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !target || isNaN(Number(target)) || Number(target) <= 0) {
      showToast("Judul dan target dana wajib diisi dengan benar");
      return;
    }

    if (!profile?.uid || !tenantId) {
      showToast("Kredensial pengguna tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        tenantId,
        uid: profile.uid,
        ownerName: profile.displayName || profile.email?.split('@')[0] || 'Warga',
        title: title.trim(),
        target: Number(target),
        current: 0,
        backers: 0,
        category,
        description: description.trim(),
        status: 'active',
        createdAt: serverTimestamp()
      });

      showToast("Proyek pendanaan berhasil dipublikasikan!");
      setTitle('');
      setTarget('');
      setDescription('');
      setShowForm(false);
    } catch (err: any) {
      console.error("Create project error:", err);
      showToast("Gagal membuat proyek: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Contribute (Ikut Modal / Donasi)
  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributingProject || !contributionAmount || isNaN(Number(contributionAmount)) || Number(contributionAmount) <= 0) {
      showToast("Nominal kontribusi tidak valid");
      return;
    }

    setSubmitting(true);
    try {
      const projectRef = doc(db, 'projects', contributingProject.id);
      await updateDoc(projectRef, {
        current: increment(Number(contributionAmount)),
        backers: increment(1)
      });

      // Save contribution receipt
      await addDoc(collection(db, 'funding_contributions'), {
        tenantId,
        projectId: contributingProject.id,
        projectTitle: contributingProject.title,
        uid: profile?.uid,
        contributorName: profile?.displayName || profile?.email?.split('@')[0] || 'Warga',
        amount: Number(contributionAmount),
        timestamp: serverTimestamp()
      });

      showToast(`Terima kasih! Kontribusi Rp ${Number(contributionAmount).toLocaleString('id-ID')} tersalurkan.`);
      setContributingProject(null);
      setContributionAmount('');
    } catch (err: any) {
      console.error("Contribution error:", err);
      showToast("Gagal menyalurkan dana: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = selectedCategory === 'ALL'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-3 px-2 sm:px-3 pb-8">
      {/* Header */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <HeartHandshake size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">Funding Proyek Warga</h2>
              <p className="text-[10px] text-slate-500">Crowdfunding & Gotong Royong Modal</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="min-h-[44px] px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus size={14} /> Ajukan Proyek
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('projects')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'projects'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <HeartHandshake size={14} /> Daftar Proyek Warga
        </button>
        <button
          onClick={() => setActiveTab('my_contributions')}
          className={`min-h-[44px] px-3.5 py-2 text-xs font-black rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'my_contributions'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Award size={14} /> Sertifikat & Riwayat Saya ({myContributions.length})
        </button>
      </div>

      {/* Form Ajukan Proyek */}
      {showForm && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-blue-200 dark:border-blue-800/80 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
              Galang Dana Proyek Baru
            </h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          </div>
          <form onSubmit={handleCreateProject} className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Nama Proyek</label>
              <input
                type="text"
                required
                placeholder="Contoh: Pengadaan CCTV Pos Ronda"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Target Dana (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 3500000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Sosial & Fasilitas">Sosial & Fasilitas</option>
                  <option value="Usaha Bersama">Usaha Bersama</option>
                  <option value="Lingkungan">Lingkungan</option>
                  <option value="Keamanan">Keamanan</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Deskripsi & Rencana Penggunaan Dana</label>
              <textarea
                rows={2}
                placeholder="Jelaskan kebutuhan dan transparansi alokasi dana..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Publikasikan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Kontribusi */}
      {contributingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Ikut Modal / Donasi Proyek
              </h3>
              <button onClick={() => setContributingProject(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={16} />
              </button>
            </div>
            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{contributingProject.title}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{contributingProject.description}</p>
            </div>
            <form onSubmit={handleContribute} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase">Nominal Kontribusi (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="Contoh: 100000"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setContributingProject(null)}
                  className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[44px] px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-sm flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Salurkan Dana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: Projects List */}
      {activeTab === 'projects' && (
        <div className="space-y-3">
          {/* Filter Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['ALL', 'Sosial & Fasilitas', 'Usaha Bersama', 'Lingkungan', 'Keamanan'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[44px] px-3 py-1.5 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'Semua Kategori' : cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Loader2 size={24} className="animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-xs font-bold">Memuat proyek pendanaan...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <AlertCircle size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Belum Ada Proyek</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Jadilah yang pertama menggalang modal untuk kebaikan lingkungan.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {filteredProjects.map((p) => {
                const targetVal = p.target || 1;
                const currentVal = p.current || 0;
                const percent = Math.min(100, Math.round((currentVal / targetVal) * 100));

                return (
                  <div key={p.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-blue-200 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 rounded">
                          {p.category}
                        </span>
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-1">{p.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{p.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-bold text-slate-400 uppercase">Terkumpul</p>
                        <p className="text-xs font-black text-blue-600 tabular-nums">
                          Rp {(currentVal).toLocaleString('id-ID')} / Rp {(targetVal).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1"><Users size={12} /> {p.backers || 0} Donatur</span>
                        <span className="flex items-center gap-1"><TrendingUp size={12} /> {percent}%</span>
                      </div>
                      <button
                        onClick={() => setContributingProject(p)}
                        className="min-h-[44px] px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-black border border-blue-200 dark:border-blue-800 transition"
                      >
                        IKUT MODAL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: My Contributions & Digital Certificates */}
      {activeTab === 'my_contributions' && (
        <div className="space-y-3">
          {myContributions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
              <Award size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <h4 className="text-xs font-black uppercase text-slate-600 dark:text-slate-300">Belum Ada Kontribusi</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Partisipasi Anda pada proyek warga akan memunculkan piagam penghargaan di sini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {myContributions.map((c) => (
                <div key={c.id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded">
                        Tersalurkan
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">{c.projectTitle}</h4>
                      <p className="text-sm font-black text-emerald-600 tabular-nums mt-0.5">
                        Rp {c.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Award size={24} className="text-amber-500 shrink-0" />
                  </div>
                  <button
                    onClick={() => setSelectedCertificate(c)}
                    className="w-full min-h-[44px] px-3 py-2 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition"
                  >
                    <FileText size={14} /> Lihat & Unduh Piagam
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Certificate Modal */}
      {selectedCertificate && (
        <FundingCertificateModal
          contribution={selectedCertificate}
          tenantName={tenant?.name}
          onClose={() => setSelectedCertificate(null)}
        />
      )}
    </div>
  );
}
