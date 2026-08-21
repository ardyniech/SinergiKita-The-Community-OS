import React, { useState } from 'react';
import { Rocket, Plus, History, HeartHandshake } from 'lucide-react';

interface FundingHeaderProps {
  onAddProject: () => void;
  activeTab: 'active' | 'my-contributions';
  setActiveTab: (tab: 'active' | 'my-contributions') => void;
  isAdmin: boolean;
}

export function FundingHeader({ onAddProject, activeTab, setActiveTab, isAdmin }: FundingHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <HeartHandshake size={18} />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Crowdfunding & Donasi Proyek</h2>
            <p className="text-[10px] text-slate-400">Patungan gotong royong memajukan lingkungan</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={onAddProject}
            className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>Buat Proyek</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100/80 rounded-xl">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'active' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Rocket size={13} className={activeTab === 'active' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Proyek Aktif</span>
        </button>
        <button
          onClick={() => setActiveTab('my-contributions')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'my-contributions' 
              ? 'bg-white text-slate-900 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <History size={13} className={activeTab === 'my-contributions' ? 'text-indigo-600' : 'text-slate-400'} />
          <span>Kontribusi Saya</span>
        </button>
      </div>
    </div>
  );
}
