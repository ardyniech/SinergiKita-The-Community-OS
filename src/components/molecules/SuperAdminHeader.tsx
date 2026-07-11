import { ShieldCheck } from 'lucide-react';
import DataSeeder from '../DataSeeder';

interface SuperAdminHeaderProps {
  stats: { total: number; pending: number; approved: number };
}

export function SuperAdminHeader({ stats }: SuperAdminHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6 rounded-3xl shadow-2xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <ShieldCheck size={120} />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 rounded-2xl backdrop-blur-md border border-blue-400/20">
            <ShieldCheck className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Master Console</h1>
            <p className="text-xs text-blue-300/80 uppercase font-bold tracking-widest mt-0.5">Control Center • {stats.total} Tenants</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <DataSeeder />
          <div className="flex gap-3">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Pending</p>
              <p className="text-xl font-black text-orange-400">{stats.pending}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-2 rounded-2xl">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Approved</p>
              <p className="text-xl font-black text-green-400">{stats.approved}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
