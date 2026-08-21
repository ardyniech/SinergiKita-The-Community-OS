import React from 'react';
import { Rocket, Plus, History, Filter } from 'lucide-react';

interface FundingHeaderProps {
  onAddProject: () => void;
  activeTab: 'active' | 'my-contributions';
  setActiveTab: (tab: 'active' | 'my-contributions') => void;
}

export function FundingHeader({ onAddProject, activeTab, setActiveTab }: FundingHeaderProps) {
  return (
    <div className="space-y-5 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-3d-sm">
            <Rocket size={22} />
          </div>
          <div>
            <h2 className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight">
              Crowdfunding Warga
            </h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-70">Dana Gotong Royong Komunitas</p>
          </div>
        </div>
        <button
          onClick={onAddProject}
          className="btn-3d w-11 h-11 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center shadow-3d-sm hover:bg-slate-50 transition"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex bg-slate-100/50 p-1.5 rounded-[20px] overflow-x-auto gap-2 border border-slate-200/50 backdrop-blur-md scrollbar-hide">
        <button
          onClick={() => setActiveTab('active')}
          className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
            activeTab === 'active' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
              : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
          }`}
        >
          <Rocket size={14} /> Proyek Aktif
        </button>
        <button
          onClick={() => setActiveTab('my-contributions')}
          className={`btn-3d flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border ${
            activeTab === 'my-contributions' 
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-3d-sm' 
              : 'bg-white/40 text-slate-500 border-white/80 hover:bg-white'
          }`}
        >
          <History size={14} /> Kontribusi Saya
        </button>
      </div>
    </div>
  );
}
