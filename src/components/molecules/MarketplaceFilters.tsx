import { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

interface MarketplaceFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filter: string;
  setFilter: (val: string) => void;
  categories: Category[];
}

export function MarketplaceFilters({ searchQuery, setSearchQuery, filter, setFilter, categories }: MarketplaceFiltersProps) {
  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Cari barang atau jasa..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs focus:ring-2 focus:ring-blue-100 outline-none transition-all"
      />

      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-hide">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight shrink-0 transition-all ${
            filter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
          }`}
        >
          Semua
        </button>
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tight shrink-0 transition-all ${
                filter === cat.id ? 'bg-blue-600 text-white shadow-md shadow-blue-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
              }`}
            >
              <Icon size={12} className={filter === cat.id ? 'text-white' : cat.color} />
              {cat.label}
            </button>
          )
        })}
      </div>
    </div>
  );
}
