import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

const widgetModules = [
  { id: 'insights', label: 'Analisis AI (Executive Summary)', desc: 'Ringkasan mingguan otomatis oleh AI' },
  { id: 'stats', label: 'Statistik Ringkas', desc: 'Angka cepat di bagian atas dashboard' },
  { id: 'tips', label: 'Tips Cerdas (AI)', desc: 'Saran pencegahan & keamanan warga' },
  { id: 'features', label: 'Grid Menu Utama', desc: 'Kumpulan kartu fitur (Alarm, Kas, dll)' },
  { id: 'reports', label: 'Laporan Cepat SOS', desc: 'Tombol lapor insiden kilat' },
  { id: 'map', label: 'Peta Insiden', desc: 'Visualisasi lokasi darurat real-time' },
  { id: 'feed', label: 'Feed Insiden Terbaru', desc: 'Daftar kejadian terkini di wilayah' },
  { id: 'logs', label: 'Log Aktivitas (Admin)', desc: 'Riwayat sistem untuk pengurus' },
];

export default function WidgetOrderSettings() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const [orderedWidgets, setOrderedWidgets] = useState<string[]>([]);

  useEffect(() => {
    if (tenant) {
      const defaultWidgetOrder = widgetModules.map(m => m.id);
      const existingWidgetOrder = tenant.dashboardOrder || [];
      const combinedWidgets = [...existingWidgetOrder];
      defaultWidgetOrder.forEach(id => {
        if (!combinedWidgets.includes(id)) combinedWidgets.push(id);
      });
      setOrderedWidgets(combinedWidgets);
    }
  }, [tenant]);

  const moveItem = async (index: number, direction: 'up' | 'down') => {
    const list = [...orderedWidgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    
    setOrderedWidgets(list);

    if (!profile?.tenantId) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        dashboardOrder: list
      });
    } catch (error) {
      showToast("Gagal menyimpan urutan.");
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2 px-1">
        Tata Letak Dashboard (Widget)
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {orderedWidgets.map((modId, index) => {
          const mod = widgetModules.find(m => m.id === modId);
          if (!mod) return null;
          return (
            <div
              key={mod.id}
              className="flex items-center gap-2 p-3 rounded-xl border bg-gray-50 border-gray-100 transition-all"
            >
              <div className="flex flex-col gap-1 pr-2 border-r border-gray-100">
                <button 
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1 hover:bg-white rounded text-gray-400 disabled:opacity-10 transition-all active:scale-90"
                >
                  <ChevronUp size={14} />
                </button>
                <button 
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === orderedWidgets.length - 1}
                  className="p-1 hover:bg-white rounded text-gray-400 disabled:opacity-10 transition-all active:scale-90"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex-1">
                <h4 className="text-[12px] font-black text-gray-900">{mod.label}</h4>
                <p className="text-[10px] text-gray-500 leading-none mt-1">{mod.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
