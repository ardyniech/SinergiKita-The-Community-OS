import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { PendingApproval } from '../../hooks/useLedgerApprovals';

interface LedgerApprovalsTabProps {
  pendingApprovals: PendingApproval[];
  profileUid?: string;
  handleReject: (id: string, description: string) => void;
  handleApprove: (app: PendingApproval, simulateSecondUser?: boolean) => void;
}

export function LedgerApprovalsTab({
  pendingApprovals,
  profileUid,
  handleReject,
  handleApprove
}: LedgerApprovalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Multi-Sig Authorization</h2>
            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Expenditures &gt; Rp 1.000.000 require dual verification.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingApprovals.length === 0 && (
          <div className="text-center py-16 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
            <ShieldCheck size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">All protocols cleared. No pending authorizations.</p>
          </div>
        )}

        {pendingApprovals.map(app => {
          const isApprovedByMe = app.approvals.includes(profileUid || '');
          const progress = (app.approvals.length / 2) * 100;
          
          return (
            <div key={app.id} className="liquid-glass p-5 rounded-[32px] border-white/60 shadow-3d-lg relative overflow-hidden group animate-in slide-in-from-bottom-2 duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-3d-sm border border-rose-400">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-700 px-3 py-1 rounded-full tracking-widest border border-rose-200/50">Awaiting Signature</span>
                    <h4 className="text-[14px] font-black text-slate-900 mt-2 uppercase tracking-tight leading-tight">{app.description}</h4>
                    <p className="text-lg font-black text-rose-600 tracking-tighter mt-1">Rp {app.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-white/60 px-4 py-2 rounded-2xl border border-white shadow-3d-sm mb-2 inline-block">
                    <span className="text-[11px] font-black text-indigo-600 tracking-widest">{app.approvals.length} / 2 Verified</span>
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Origin: {app.createdBy}</p>
                </div>
              </div>

              <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50 mb-6 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Verification Registry</p>
                  <p className="text-[9px] font-black text-indigo-500">{progress}% Authorized</p>
                </div>
                
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-indigo-500 rounded-full"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {app.approverNames.map((name, i) => (
                    <span key={i} className="bg-white text-indigo-600 text-[9px] px-3 py-1.5 rounded-xl flex items-center gap-2 font-black uppercase tracking-widest border border-slate-200 shadow-3d-sm">
                      <Check size={12} /> {name}
                    </span>
                  ))}
                  {app.approvals.length < 2 && (
                    <span className="bg-amber-50 text-amber-600 text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-amber-100 animate-pulse">
                      Waiting for Secondary Peer
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end relative z-10">
                <button
                  onClick={() => handleReject(app.id, app.description)}
                  className="btn-3d px-6 py-3.5 bg-white text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 shadow-3d-sm transition-all active:translate-y-0.5"
                >
                  Reject Protocol
                </button>
                <button
                  onClick={() => handleApprove(app, false)}
                  disabled={isApprovedByMe}
                  className={`btn-3d px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border shadow-3d-sm transition-all ${
                    isApprovedByMe 
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-50' 
                      : 'bg-indigo-600 text-white border-indigo-400 hover:bg-indigo-700 active:translate-y-0.5'
                  }`}
                >
                  <Check size={14} /> {isApprovedByMe ? 'Verified by Self' : 'Sign & Verify'}
                </button>
                <button
                  onClick={() => handleApprove(app, true)}
                  className="btn-3d px-4 py-3.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-700 shadow-3d-sm flex items-center justify-center transition-all active:translate-y-0.5"
                  title="Simulate Secondary Admin Signature"
                >
                  ⚡ Force Multi-Sig
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
