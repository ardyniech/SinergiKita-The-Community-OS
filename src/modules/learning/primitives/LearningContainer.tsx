import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useLearning } from '../logic/useLearning';
import { LessonCard } from './LessonCard';
import { Loader2, GraduationCap, Info } from 'lucide-react';

export const LearningContainer: React.FC = () => {
  const { profile } = useAuth();
  const { lessons, loading, completeLesson } = useLearning(profile?.tenantId || null, profile);

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" /></div>;

  return (
    <div className="liquid-glass rounded-[40px] p-4 sm:p-6 shadow-3d-lg border-white/60 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-3d-sm">
          <GraduationCap size={22} />
        </div>
        <div>
          <h2 className="text-[15px] font-black text-slate-900 leading-tight uppercase tracking-tight">Pusat Belajar</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5 opacity-70">Tingkatkan Kapasitas Komunitas</p>
        </div>
      </div>

      <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-3xl flex gap-3">
        <Info className="text-indigo-600 shrink-0" size={20} />
        <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-wide">
          Pelajari berbagai panduan penggunaan sistem, tata tertib komunitas, dan tips produktivitas di sini.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-700">
        {lessons.length === 0 ? (
          <div className="col-span-full p-16 text-center bg-white/40 border border-white/80 rounded-[32px] opacity-50">
            <GraduationCap size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Belum ada materi pembelajaran.</p>
          </div>
        ) : (
          lessons.map(lesson => (
            <LessonCard 
              key={lesson.id} 
              lesson={lesson} 
              onComplete={completeLesson} 
            />
          ))
        )}
      </div>
    </div>
  );
};
