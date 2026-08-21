// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import React from 'react';
import { motion } from 'motion/react';
import { Camera, X, AlertCircle, RotateCcw, Save, Loader2, Upload } from 'lucide-react';
import { AppUser } from '../../types';

interface MemberCameraModalProps {
  capturingMember: AppUser;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  capturedImage: string | null;
  setCapturedImage: (img: string | null) => void;
  cameraError: string | null;
  photoSaving: boolean;
  handleCapture: () => void;
  handleSavePhoto: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MemberCameraModal({
  capturingMember,
  onClose,
  videoRef,
  fileInputRef,
  capturedImage,
  setCapturedImage,
  cameraError,
  photoSaving,
  handleCapture,
  handleSavePhoto,
  handleFileUpload
}: MemberCameraModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="liquid-glass rounded-[32px] shadow-3d-lg border-white/60 max-w-[320px] w-full overflow-hidden relative"
      >
        <div className="p-5 border-b border-white/40 flex justify-between items-center bg-white/40 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-3d-sm">
              <Camera size={18} />
            </div>
            <div>
              <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-tight leading-tight">Identity Capture</h3>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest opacity-70">Capture Profile Portrait</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/60 hover:bg-white rounded-xl text-slate-400 hover:text-slate-600 transition-all border border-white flex items-center justify-center shadow-3d-sm active:translate-y-0.5">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="relative aspect-square w-full max-w-[200px] mx-auto rounded-3xl overflow-hidden bg-slate-950 border-4 border-white shadow-3d-lg flex items-center justify-center">
            {!capturedImage && !cameraError && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {!capturedImage && !cameraError && (
              <div className="absolute inset-0 border-[12px] border-black/40 rounded-3xl pointer-events-none flex items-center justify-center">
                <div className="w-full h-full border border-white/40 rounded-2xl border-dashed" />
              </div>
            )}

            {capturedImage && (
              <img
                src={capturedImage}
                alt="Captured Profile"
                className="w-full h-full object-cover"
              />
            )}

            {cameraError && !capturedImage && (
              <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center bg-slate-900">
                <AlertCircle size={32} className="text-amber-500 mb-3 drop-shadow-sm" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white mb-2 leading-none">Access Restricted</p>
                <p className="text-[9px] font-bold text-slate-400 leading-normal uppercase tracking-tight">{cameraError}</p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.1em]">
              {capturingMember.displayName || capturingMember.email.split('@')[0]}
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-tight opacity-70 leading-relaxed px-4">
              {capturedImage ? "Verify preview. Confirm selection to update registry." : "Align focal points. Ensure adequate lighting for verification."}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {!capturedImage && !cameraError && (
              <button
                type="button"
                onClick={handleCapture}
                className="btn-3d w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-3d-sm border border-blue-400 flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
              >
                <Camera size={18} />
                Execute Capture
              </button>
            )}

            {capturedImage && (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={photoSaving}
                  className="btn-3d w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-3d-sm border border-emerald-400 flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
                >
                  {photoSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                  Confirm & Save
                </button>
                <button
                  type="button"
                  onClick={() => setCapturedImage(null)}
                  className="btn-3d w-full py-3.5 bg-white text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 shadow-3d-sm flex items-center justify-center gap-2 transition-all active:translate-y-0.5"
                >
                  <RotateCcw size={16} />
                  Retry Capture
                </button>
              </div>
            )}

            <div className="border-t border-white/40 pt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-3d w-full py-3 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-200 border-dashed shadow-inner"
              >
                <Upload size={14} />
                Import from Local Storage
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
