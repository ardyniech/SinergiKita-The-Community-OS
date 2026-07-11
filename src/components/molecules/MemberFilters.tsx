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
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Cari warga..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all text-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg shrink-0">
            <Filter size={10} className="text-gray-400" />
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Filter:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${
              filter === 'all' 
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
              : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${
              filter === 'active' 
              ? 'bg-green-600 text-white border-green-600 shadow-sm' 
              : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <CheckCircle2 size={10} />
            Aktif
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${
              filter === 'pending' 
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm' 
              : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <Clock size={10} />
            Menunggu
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tight transition-all border ${
              filter === 'inactive' 
              ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
              : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
            }`}
          >
            <UserX size={10} />
            Ditangguhkan
          </button>
        </div>
      )}
    </div>
  );
}
