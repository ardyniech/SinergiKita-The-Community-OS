import React, { useState } from 'react';
import { useToast } from '../../../context/ToastContext';
import { Plus } from 'lucide-react';
import { CATEGORY_MAP, BulletinCategory } from './bulletinCategories';

interface Props { onCreate: (t: string, c: string, cat: BulletinCategory) => Promise<void>; }

export const BulletinForm: React.FC<Props> = ({ onCreate }) => {
  const { showToast } = useToast();
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [cat, setCat] = useState<BulletinCategory>('umum');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return showToast('Harap isi judul dan penjelasan informasi');
    setBusy(true);
    await onCreate(title, content, cat);
    setTitle(''); setContent(''); setCat('umum'); setShow(false); setBusy(false);
  };

  if (!show) return (
    <button onClick={() => setShow(true)} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
      <Plus size={14} /><span>Bagikan Info Bengkel / Tempat Rehat</span>
    </button>
  );

  return (
    <form onSubmit={submit} className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs space-y-2.5">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-black text-slate-800">Bagikan Informasi Baru</h4>
        <button type="button" onClick={() => setShow(false)} className="text-[10px] text-slate-400 font-bold">Batal</button>
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul (contoh: Tambal Ban Murah Kalideres)" className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Ketik penjelasan detail di sini..." rows={2} className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs focus:outline-none focus:border-indigo-500 resize-none" />
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(Object.keys(CATEGORY_MAP) as BulletinCategory[]).map((k) => (
          <button key={k} type="button" onClick={() => setCat(k)} className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold shrink-0 ${cat === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
            {CATEGORY_MAP[k].icon}<span>{CATEGORY_MAP[k].label}</span>
          </button>
        ))}
      </div>
      <button type="submit" disabled={busy} className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold disabled:opacity-50">{busy ? 'Mengirim...' : 'Kirim Informasi'}</button>
    </form>
  );
};
