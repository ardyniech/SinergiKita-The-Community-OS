import { Search, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Tenant } from '../../types';

interface NodeDirectoryProps {
  tenants: Tenant[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  filteredTenants: Tenant[];
  onSelectNode: (t: Tenant) => void;
}

export const NodeDirectory = ({
  tenants,
  searchQuery,
  setSearchQuery,
  filteredTenants,
  onSelectNode
}: NodeDirectoryProps) => {
  return (
    <div className="tech-card p-3 rounded-xl space-y-4 bg-white/95 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
          <Globe size={16} className="text-cyan-600" />
          Network Node Directory
        </h3>
        <div className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[9px] font-mono font-bold text-slate-400">
          {tenants.length} NODES_DETECTION
        </div>
      </div>
      
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors" size={14} />
        <input 
          type="text" 
          placeholder="Lookup community node by name or ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 font-bold transition-all shadow-inner"
        />
      </div>

      <AnimatePresence>
        {searchQuery && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-50/50 p-2 rounded-xl border border-slate-100 space-y-1.5 max-h-48 overflow-y-auto"
          >
            {filteredTenants.length > 0 ? (
              filteredTenants.map((t) => (
                <div 
                  key={t.id}
                  onClick={() => onSelectNode(t)}
                  className="p-3 bg-white hover:bg-cyan-50 rounded-lg border border-slate-200 hover:border-cyan-200 transition-all cursor-pointer flex justify-between items-center group"
                >
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tight group-hover:text-cyan-700 transition-colors">{t.name}</p>
                    <p className="text-[9px] font-mono text-slate-400 mt-0.5">ID: {t.id} // Tipe: {t.type?.toUpperCase() || 'GENERAL'}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <div className="p-4 text-center">
                <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest italic leading-none">Target Node Not Found</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
