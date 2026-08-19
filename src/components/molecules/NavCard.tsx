import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface NavCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  data?: { label: string; value: string };
  onClick: (id: any) => void;
}

export const NavCard = ({ id, title, subtitle, icon: Icon, color, data, onClick }: NavCardProps) => (
  <motion.div 
    whileHover={{ scale: 1.01, y: -1 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onClick(id)}
    className="tech-card p-3.5 rounded-xl active:scale-[0.98] cursor-pointer transition-all relative group overflow-hidden border-l-4 border-l-transparent hover:border-l-cyan-500"
  >
    {/* Identification Tag */}
    <div className="absolute top-0 right-0 px-2 py-0.5 bg-slate-50 border-b border-l border-slate-200 rounded-bl-lg text-[7px] font-mono font-bold text-slate-400 group-hover:text-cyan-600 transition-colors">
      ID:{id.toUpperCase()}
    </div>
    
    <div className="flex items-start gap-3 mt-1">
      <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center shrink-0 border border-slate-200/50 group-hover:bg-white group-hover:shadow-[0_0_10px_rgba(6,182,212,0.2)] transition-all`}>
        <Icon size={16} className="group-hover:text-cyan-600 transition-colors" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-mono font-bold uppercase tracking-[0.2em] text-cyan-600 leading-none mb-1.5 opacity-80">{subtitle}</p>
        <h3 className="text-xs font-black text-slate-900 leading-tight group-hover:text-cyan-700 transition-colors uppercase tracking-tight">{title}</h3>
      </div>
    </div>

    {data && (
      <div className="mt-4 pt-3 border-t border-dashed border-slate-200 flex justify-between items-center bg-slate-50/50 -mx-3.5 -mb-3.5 px-3.5 pb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-cyan-500" />
          <span className="text-[7px] font-mono font-bold text-slate-500 uppercase tracking-widest">{data.label}</span>
        </div>
        <span className="text-[9px] font-mono font-black text-slate-900 px-1.5 py-0.5 rounded border border-slate-300 bg-white shadow-xs">{data.value}</span>
      </div>
    )}
  </motion.div>
);
