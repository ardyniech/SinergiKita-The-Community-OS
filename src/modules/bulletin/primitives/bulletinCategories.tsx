import { Wrench, Coffee, Settings, MessageSquare } from 'lucide-react';

export const CATEGORY_MAP = {
  bengkel: { label: 'Bengkel', icon: <Wrench size={12} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  rest_area: { label: 'Tempat Rehat', icon: <Coffee size={12} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  spareparts: { label: 'Suku Cadang', icon: <Settings size={12} />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  umum: { label: 'Umum', icon: <MessageSquare size={12} />, color: 'bg-slate-50 text-slate-700 border-slate-200' },
} as const;

export type BulletinCategory = keyof typeof CATEGORY_MAP;
