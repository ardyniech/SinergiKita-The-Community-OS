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
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98, y: 0 }}
    onClick={() => onClick(id)}
    className="card-3d p-2.5 shadow-3d-sm hover:shadow-3d-lg hover:border-blue-200 cursor-pointer transition-all relative group overflow-hidden flex flex-col justify-between"
  >
    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/30 pointer-events-none" />
    <div className="flex items-start gap-3 relative z-10">
      <div className={`w-9 h-9 ${color} rounded-2xl flex items-center justify-center shrink-0 shadow-3d-sm group-hover:scale-110 transition-transform border border-white/30`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[8px] font-black text-blue-600/70 leading-none mb-1 uppercase tracking-[0.15em]">{subtitle}</p>
        <h3 className="text-[12px] font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors tracking-tight uppercase">{title}</h3>
      </div>
    </div>

    {data && (
      <div className="mt-3 pt-2.5 border-t border-slate-100/50 flex justify-between items-center bg-slate-50/40 -mx-2.5 -mb-2.5 px-2.5 py-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0" />
          <span className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-tighter">{data.label}</span>
        </div>
        <span className="text-[10px] font-black text-slate-900 bg-white/80 px-2 py-0.5 rounded-lg border border-white shadow-3d-sm shrink-0">{data.value}</span>
      </div>
    )}
  </motion.div>
);
