import { X, Loader2 } from 'lucide-react';

interface FundingFormProps {
  newProject: { title: string; target: string; description: string; category: string };
  setNewProject: (val: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export function FundingForm({ newProject, setNewProject, onSubmit, onCancel, submitting }: FundingFormProps) {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Galang Dana Baru</h3>
        <button onClick={onCancel} className="text-gray-400"><X size={16} /></button>
      </div>
      <div className="space-y-3">
        <input 
          type="text" placeholder="Nama Proyek" 
          className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none" 
          value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})}
        />
        <div className="flex gap-2">
          <input 
            type="number" placeholder="Target (Rp)" 
            className="flex-1 p-3 rounded-xl border border-gray-200 text-sm outline-none" 
            value={newProject.target} onChange={e => setNewProject({...newProject, target: e.target.value})}
          />
          <select 
            className="p-3 rounded-xl border border-gray-200 text-sm outline-none"
            value={newProject.category} onChange={e => setNewProject({...newProject, category: e.target.value})}
          >
            <option>Bisnis</option><option>Sosial</option><option>Fasilitas</option>
          </select>
        </div>
        <textarea 
          placeholder="Deskripsi..." 
          className="w-full p-3 rounded-xl border border-gray-200 text-sm h-24 outline-none" 
          value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})}
        />
        <button 
          onClick={onSubmit} disabled={submitting}
          className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Publikasikan
        </button>
      </div>
    </div>
  );
}
