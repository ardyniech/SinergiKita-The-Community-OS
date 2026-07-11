import { motion } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';

interface Emergency {
  id: string;
  type: string;
  senderName: string;
  senderAddress: string;
  timestamp: any;
  tenantId: string;
}

interface EmergencyAlertProps {
  alert: Emergency;
  isAdmin: boolean;
  onResolve: (id: string) => void;
}

export function EmergencyAlert({ alert, isAdmin, onResolve }: EmergencyAlertProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="bg-red-600 text-white p-3 rounded-xl shadow-xl shadow-red-200 border-2 border-white flex items-center justify-between animate-pulse"
    >
      <div className="flex items-center gap-3">
        <div className="bg-white text-red-600 p-1.5 rounded-lg">
          <AlertCircle size={20} />
        </div>
        <div>
          <h3 className="text-[11px] font-black uppercase tracking-tight">DARURAT: {alert.type.toUpperCase()}</h3>
          <p className="text-[9px] font-bold opacity-90 truncate max-w-[150px]">{alert.senderName}</p>
        </div>
      </div>
      {isAdmin && (
        <button 
          onClick={() => onResolve(alert.id)}
          className="bg-white/20 hover:bg-white/40 p-1.5 rounded-lg transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}
