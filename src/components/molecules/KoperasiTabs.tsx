import { ArrowDownLeft, ArrowUpRight, History, LucideIcon } from 'lucide-react';

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface KoperasiTabsProps {
  activeTab: string;
  onTabChange: (id: any) => void;
}

const TABS: Tab[] = [
  { id: 'save', label: 'Simpan', icon: ArrowDownLeft },
  { id: 'loan', label: 'Pinjam', icon: ArrowUpRight },
  { id: 'history', label: 'Riwayat', icon: History },
];

export function KoperasiTabs({ activeTab, onTabChange }: KoperasiTabsProps) {
  return (
    <div className="flex gap-2 mb-6">
      {TABS.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === tab.id 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          <tab.icon size={14} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}
