import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useFunding } from '../logic/useFunding';
import { FundingHeader } from './FundingHeader';
import { ProjectCard } from './ProjectCard';
import { Loader2, Rocket, AlertCircle } from 'lucide-react';
import { FundingProject } from '../../../shared/models';

export const FundingContainer: React.FC = () => {
  const { profile } = useAuth();
  const { 
    projects, 
    loading, 
    submitting, 
    handleCreateProject, 
    handleContribute 
  } = useFunding(profile?.tenantId || null, profile);

  const [activeTab, setActiveTab] = useState<'active' | 'my-contributions'>('active');
  const [selectedProject, setSelectedProject] = useState<FundingProject | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60">
      <FundingHeader 
        onAddProject={() => {}} // TODO: Create Modal
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="space-y-4 animate-in fade-in duration-500">
        {activeTab === 'active' && (
          projects.length === 0 ? (
            <div className="p-12 text-center bg-white/40 border border-white/80 rounded-3xl">
              <Rocket size={32} className="mx-auto mb-3 text-slate-200" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum Ada Proyek Aktif</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onContribute={setSelectedProject} 
                />
              ))}
            </div>
          )
        )}

        {activeTab === 'my-contributions' && (
          <div className="p-12 text-center bg-white/40 border border-white/80 rounded-3xl">
            <AlertCircle size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat Kontribusi Kosong</p>
          </div>
        )}
      </div>

      {/* Simple Contribution Dialog Mockup */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm bg-white rounded-[32px] p-6 shadow-3d-lg border border-white space-y-5 animate-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
                <Rocket size={24} />
              </div>
              <h3 className="text-lg font-black text-slate-900 leading-tight mb-1">{selectedProject.title}</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bantu Wujudkan Proyek Ini</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nominal Donasi (Rp)</label>
                <input type="number" placeholder="50.000" className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" />
              </div>
              <button 
                onClick={() => handleContribute(selectedProject.id, 50000, 'Semangat!').then(() => setSelectedProject(null))}
                disabled={submitting}
                className="btn-3d w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Konfirmasi Donasi'}
              </button>
              <button onClick={() => setSelectedProject(null)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
