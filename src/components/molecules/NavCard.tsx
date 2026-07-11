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
    whileHover={{ scale: 1.01, y: -2 }}
    whileTap={{ scale: 0.99 }}
    onClick={() => onClick(id)}
    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-lg hover:shadow-blue-100/30 transition-all group"
  >
    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon size={20} />
    </div>
    <div className="mb-3">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">{subtitle}</p>
      <h3 className="text-base font-black text-gray-900 leading-tight">{title}</h3>
    </div>
    {data && (
      <div className="pt-3 border-t border-gray-50">
        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{data.label}</p>
        <p className="text-[10px] font-black text-gray-900">{data.value}</p>
      </div>
    )}
  </motion.div>
);
