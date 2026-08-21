import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { AppUser } from '../../types';

interface MemberDeleteModalProps {
  deletingMember: AppUser;
  onClose: () => void;
  onConfirmDelete: () => void;
  saveLoading: boolean;
}

export function MemberDeleteModal({
  deletingMember,
  onClose,
  onConfirmDelete,
  saveLoading
}: MemberDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="liquid-glass rounded-[32px] p-6 max-w-[280px] w-full shadow-3d-lg border-rose-200/40 text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
        
        <div className="w-16 h-16 bg-rose-500/10 text-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner border border-rose-500/20">
          <AlertCircle size={32} className="drop-shadow-sm" />
        </div>
        
        <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight mb-2">Final Confirmation</h3>
        <p className="text-[10px] text-slate-500 font-bold leading-relaxed mb-8 uppercase tracking-tight opacity-70">
          Authorize deletion of <span className="text-rose-600 font-black">"{deletingMember.displayName || deletingMember.email}"</span>? 
          This action is permanent.
        </p>
        
        <div className="flex flex-col gap-3 relative z-10">
          <button
            onClick={onConfirmDelete}
            disabled={saveLoading}
            className="btn-3d w-full py-3.5 bg-rose-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-3d-sm border border-rose-400 hover:bg-rose-600 flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
          >
            {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Confirm Delete
          </button>
          <button
            onClick={onClose}
            className="btn-3d w-full py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white border border-slate-200 shadow-3d-sm transition-all active:translate-y-0.5"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
}
