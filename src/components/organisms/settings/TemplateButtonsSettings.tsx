// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { useState } from 'react';
import { Save, Loader2, Plus, Trash2, MessageSquare, List } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

export default function TemplateButtonsSettings() {
  const { profile, tenant } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!profile?.tenantId || !newLabel || !newContent) return;
    setLoading(true);
    try {
      const newBtn = {
        id: crypto.randomUUID(),
        label: newLabel,
        content: newContent
      };
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        templateButtons: arrayUnion(newBtn)
      });
      setNewLabel('');
      setNewContent('');
      setIsAdding(false);
      showToast("Tombol template ditambahkan.");
    } catch (err) {
      showToast("Gagal menambahkan tombol.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (btn: any) => {
    if (!profile?.tenantId) return;
    if (!confirm("Hapus tombol ini?")) return;
    try {
      await updateDoc(doc(db, 'tenants', profile.tenantId), {
        templateButtons: arrayRemove(btn)
      });
      showToast("Tombol dihapus.");
    } catch (err) {
      showToast("Gagal menghapus tombol.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <List size={12} className="text-blue-600" /> Tombol Template
        </h3>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className={`p-1 rounded-md transition-colors ${isAdding ? 'bg-slate-100 text-slate-500' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
        >
          <Plus size={16} />
        </button>
      </div>

      {isAdding && (
        <div className="card-3d p-3 bg-blue-50/50 border-blue-100 space-y-3 shadow-3d-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest px-1">Label Tombol</label>
            <input 
              type="text" 
              className="w-full text-xs p-2.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 shadow-inner"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="Contoh: Info Iuran"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-blue-900 uppercase tracking-widest px-1">Isi Pesan / Aksi</label>
            <textarea 
              className="w-full text-xs p-2.5 bg-white border border-blue-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px] shadow-inner"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              placeholder="Tulis pesan otomatis yang akan dikirim saat tombol diklik..."
            />
          </div>
          <button 
            onClick={handleAdd}
            disabled={loading}
            className="btn-3d w-full bg-blue-600 text-white py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-3d-sm disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Simpan Tombol
          </button>
        </div>
      )}

      <div className="card-3d shadow-3d-lg divide-y divide-slate-50 overflow-hidden">
        {!tenant?.templateButtons || tenant.templateButtons.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-[10px] font-medium italic">
            Belum ada tombol template yang dibuat.
          </div>
        ) : (
          tenant.templateButtons.map((btn: any) => (
            <div key={btn.id} className="p-3 flex items-start gap-3 hover:bg-slate-50 transition-colors group">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                <MessageSquare size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{btn.label}</h4>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {btn.content}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(btn)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-all active:scale-90"
                title="Hapus"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
      
      <p className="px-1 text-[8px] text-slate-400 italic leading-relaxed">
        * Tombol template memudahkan pengurus mengirim pesan rutin atau informasi penting ke warga dengan satu klik.
      </p>
    </div>
  );
}
