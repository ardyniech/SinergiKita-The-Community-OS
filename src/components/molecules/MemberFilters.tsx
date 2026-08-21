import { Search, Filter, CheckCircle2, Clock, UserX } from 'lucide-react';

export type FilterType = 'all' | 'active' | 'pending' | 'inactive';

interface MemberFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filter: FilterType;
  setFilter: (val: FilterType) => void;
  isAdmin: boolean;
}

export function MemberFilters({ searchTerm, setSearchTerm, filter, setFilter, isAdmin }: MemberFiltersProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
        <input
          type="text"
          placeholder="Cari warga..."
          className="w-full pl-11 pr-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all text-[11px] font-bold uppercase tracking-tight shadow-3d-sm placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-0.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/50 rounded-xl shrink-0 border border-slate-200/50">
            <Filter size={12} className="text-slate-500" />
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.1em]">Status</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`btn-3d px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filter === 'all' 
              ? 'bg-blue-600 text-white border-blue-500 shadow-3d-sm' 
              : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filter === 'active' 
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-3d-sm' 
              : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <CheckCircle2 size={12} />
            Aktif
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filter === 'pending' 
              ? 'bg-amber-500 text-white border-amber-400 shadow-3d-sm' 
              : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <Clock size={12} />
            Pending
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`btn-3d flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
              filter === 'inactive' 
              ? 'bg-rose-500 text-white border-rose-400 shadow-3d-sm' 
              : 'bg-white/60 text-slate-500 border-white/80 hover:bg-white'
            }`}
          >
            <UserX size={12} />
            Inactive
          </button>
        </div>
      )}
    </div>
  );
}
