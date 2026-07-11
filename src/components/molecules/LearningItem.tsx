import React from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';

interface LearningMaterial {
  id: string;
  title: string;
  category: string;
  authorName: string;
}

export const LearningItem: React.FC<{ item: LearningMaterial, onClick: () => void }> = ({ item, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:shadow-sm hover:border-blue-100 transition-all text-left flex items-center justify-between group"
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <BookOpen size={18} />
      </div>
      <div>
        <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest leading-none mb-0.5">{item.category}</p>
        <h4 className="text-xs font-bold text-gray-900 leading-tight">{item.title}</h4>
        <p className="text-[9px] font-bold text-gray-400">Oleh: {item.authorName}</p>
      </div>
    </div>
    <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
  </button>
);
