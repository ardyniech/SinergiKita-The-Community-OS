import { motion } from 'motion/react';
import { ShieldCheck, Clock, Users, CheckCircle, XCircle, Coins } from 'lucide-react';
import { Tenant } from '../../types';

interface TenantCardProps {
  tenant: Tenant;
  index: number;
  onApprove: (id: string, status: 'approved' | 'pending') => void;
  onManageLicense: (tenant: Tenant) => void;
}

export function TenantCard({ tenant, index, onApprove, onManageLicense }: TenantCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white p-3 rounded-3xl shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4">
        <div className={`p-4 rounded-2xl transition-colors ${
          tenant.status === 'approved' 
            ? 'bg-green-50 text-green-600 group-hover:bg-green-100' 
            : 'bg-amber-50 text-amber-600 group-hover:bg-amber-100'
        }`}>
          {tenant.status === 'approved' ? <ShieldCheck size={24} /> : <Clock size={24} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-900">{tenant.name}</h3>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
              tenant.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {tenant.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] font-mono font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">ID: {tenant.id}</p>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
              <Users size={10} /> {tenant.ownerId.slice(0, 8)}...
            </p>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <p className="text-[10px] text-gray-400 font-medium">
              {new Date(tenant.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onManageLicense(tenant)}
          className="flex-1 sm:flex-none bg-amber-500 text-white px-3 py-2.5 rounded-2xl text-xs font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-xs"
        >
          <Coins size={14} /> Lisensi Fitur
        </button>

        {tenant.status === 'pending' ? (
          <button 
            onClick={() => onApprove(tenant.id, 'approved')}
            className="flex-1 sm:flex-none bg-green-600 text-white px-3 py-2.5 rounded-2xl text-xs font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
          >
            <CheckCircle size={14} /> Approve
          </button>
        ) : (
          <button 
            onClick={() => onApprove(tenant.id, 'pending')}
            className="flex-1 sm:flex-none bg-gray-100 text-gray-600 px-3 py-2.5 rounded-2xl text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2"
          >
            <XCircle size={14} /> Suspend
          </button>
        )}
      </div>
    </motion.div>
  );
}
