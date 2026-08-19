import { Users, TrendingUp } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  target: number;
  current: number;
  backers: number;
  category: string;
  description: string;
}

interface FundingProjectCardProps {
  project: Project;
  onContribute: (id: string) => void;
}

export function FundingProjectCard({ project, onContribute }: FundingProjectCardProps) {
  const percent = Math.min(100, Math.round((project.current / project.target) * 100));

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest px-2 py-1 bg-blue-50 rounded-full">{project.category}</span>
          <h4 className="text-sm font-black text-gray-900 mt-1">{project.title}</h4>
          <p className="text-[10px] text-gray-500 line-clamp-1">{project.description}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold text-gray-400 uppercase">Terkumpul</p>
          <p className="text-xs font-black text-blue-600">
            Rp {(project.current / 1000).toFixed(0)}rb / Rp {(project.target / 1000).toFixed(0)}rb
          </p>
        </div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-3 overflow-hidden">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${percent}%` }} />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-gray-500">
            <Users size={12} />
            <span className="text-[10px] font-bold">{project.backers} Pemodal</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <TrendingUp size={12} />
            <span className="text-[10px] font-bold">{percent}%</span>
          </div>
        </div>
        <button 
          onClick={() => onContribute(project.id)}
          className="text-[10px] font-black text-blue-600 hover:bg-blue-50 px-2 py-2 min-h-[44px] flex items-center justify-center rounded-lg border border-blue-100 transition-colors"
        >
          IKUT MODAL
        </button>
      </div>
    </div>
  );
}
