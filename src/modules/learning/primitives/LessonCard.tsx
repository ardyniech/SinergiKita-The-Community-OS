import React from 'react';
import { BookOpen, Clock, BarChart, CheckCircle } from 'lucide-react';
import { Lesson } from '../../../shared/models';

interface LessonCardProps {
  lesson: Lesson;
  onComplete: (id: string) => void;
}

export function LessonCard({ lesson, onComplete }: LessonCardProps) {
  return (
    <div className="card-3d bg-white/70 border-white/60 shadow-3d-sm p-4 space-y-4 hover:shadow-3d-lg transition-all group">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-[8px] font-black uppercase tracking-widest">
              {lesson.category}
            </span>
            <div className="flex items-center gap-1 text-[8px] font-black text-slate-400 uppercase tracking-widest">
              <Clock size={10} /> {lesson.duration}
            </div>
          </div>
          <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight mb-1">{lesson.title}</h3>
          <p className="text-[10px] font-bold text-slate-500 line-clamp-2 leading-relaxed opacity-80">{lesson.description}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200/50 shadow-inner">
          <BookOpen size={24} />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <BarChart size={12} className="text-indigo-500" /> {lesson.difficulty}
        </div>
        <button 
          onClick={() => onComplete(lesson.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-3d-sm active:translate-y-0.5"
        >
          <CheckCircle size={12} /> Selesai
        </button>
      </div>
    </div>
  );
}
