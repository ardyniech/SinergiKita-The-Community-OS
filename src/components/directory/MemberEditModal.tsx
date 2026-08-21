import React from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle, Loader2, Save, Trash2 } from 'lucide-react';
import { AppUser } from '../../types';

interface MemberEditModalProps {
  editingMember: AppUser;
  onClose: () => void;
  editForm: any;
  setEditForm: (form: any) => void;
  saveLoading: boolean;
  handleSaveEdit: (e: React.FormEvent) => void;
  handleApproveInstant: () => void;
  onDeleteMember: (m: AppUser) => void;
  isCurrentAdmin: boolean;
  currentUserId?: string;
}

export function MemberEditModal({
  editingMember,
  onClose,
  editForm,
  setEditForm,
  saveLoading,
  handleSaveEdit,
  handleApproveInstant,
  onDeleteMember,
  isCurrentAdmin,
  currentUserId
}: MemberEditModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="liquid-glass rounded-[32px] shadow-3d-lg border-white/60 max-w-md w-full overflow-hidden relative"
      >
        <div className="p-5 border-b border-white/40 flex justify-between items-center bg-white/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
              <Save size={18} />
            </div>
            <div>
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Registry Editor</h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Update Citizen Profile</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/60 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-white flex items-center justify-center shadow-3d-sm active:translate-y-0.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSaveEdit} className="p-6 space-y-6 max-h-[70vh] sm:max-h-[80vh] overflow-y-auto scrollbar-hide pb-8">
          {!editForm.isApproved && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
              <div className="flex-1">
                <h4 className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-none">Awaiting Approval</h4>
                <p className="text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tight">Status: Authorization Pending</p>
              </div>
              <button
                type="button"
                onClick={handleApproveInstant}
                disabled={saveLoading}
                className="btn-3d px-3 py-2 bg-amber-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-3d-sm flex items-center gap-1.5"
              >
                <CheckCircle size={12} /> Approve
              </button>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner"
                  value={editForm.displayName}
                  onChange={e => setEditForm({ ...editForm, displayName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 opacity-60">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Verified Email</label>
                <input
                  type="text"
                  disabled
                  className="w-full p-3 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-xs font-bold text-slate-400 cursor-not-allowed shadow-inner"
                  value={editingMember.email}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Contact No.</label>
                <input
                  type="tel"
                  required
                  className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner"
                  value={editForm.phoneNumber}
                  onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Address / Block</label>
                <input
                  type="text"
                  required
                  className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner"
                  value={editForm.address}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Access Role</label>
                <select
                  className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner appearance-none"
                  value={editForm.role}
                  onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="member">Standard Citizen</option>
                  <option value="admin">Executive Admin</option>
                  <option value="ketua">Unit Head</option>
                  <option value="bendahara">Finance Admin</option>
                  <option value="sekretaris">Secretary</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Security Status</label>
                <select
                  className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-[10px] font-black text-slate-700 uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner appearance-none"
                  value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value, isApproved: e.target.value === 'active' })}
                >
                  <option value="active">Active (Verified)</option>
                  <option value="pending">Pending (Locked)</option>
                  <option value="inactive">Inactive (Suspended)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] px-1">Registry Observations</label>
              <textarea
                rows={2}
                className="w-full p-3 bg-white/50 border border-slate-200/50 rounded-2xl text-xs font-black uppercase tracking-tight outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 shadow-inner"
                placeholder="Notes for identity verification..."
                value={editForm.observations}
                onChange={e => setEditForm({ ...editForm, observations: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl shadow-inner group">
              <input
                type="checkbox"
                id="isCritical"
                className="w-5 h-5 text-rose-600 border-slate-200 rounded-lg focus:ring-rose-500/20"
                checked={editForm.isCritical}
                onChange={e => setEditForm({ ...editForm, isCritical: e.target.checked })}
              />
              <label htmlFor="isCritical" className="text-[10px] font-black text-rose-600 uppercase tracking-widest cursor-pointer select-none">
                Emergency Priority (SOS)
              </label>
            </div>
          </div>

          <div className="pt-5 border-t border-white/40 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-3d flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-white border border-slate-200 shadow-3d-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="btn-3d flex-1 py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-3d-sm border border-blue-400 flex items-center justify-center gap-2"
              >
                {saveLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Confirm
              </button>
            </div>

            {isCurrentAdmin && editingMember.id !== currentUserId && editingMember.uid !== currentUserId && (
              <button
                type="button"
                onClick={() => onDeleteMember(editingMember)}
                disabled={saveLoading}
                className="btn-3d w-full py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 border border-rose-500/20"
              >
                <Trash2 size={16} />
                Delete Entry
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
