import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { SOSConfirmationModal } from '../molecules/SOSConfirmationModal';

interface EmergencySOSButtonProps {
  isSending: boolean;
  onConfirmSOS: () => Promise<void>;
}

export function EmergencySOSButton({ isSending, onConfirmSOS }: EmergencySOSButtonProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleSend = async () => {
    setShowConfirmModal(false);
    await onConfirmSOS();
  };

  return (
    <div className="p-3.5 bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl flex flex-col items-center justify-center space-y-2.5">
      <button
        onClick={() => setShowConfirmModal(true)}
        disabled={isSending}
        className="w-28 h-28 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex flex-col items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition ring-8 ring-rose-200 dark:ring-rose-950 cursor-pointer"
      >
        {isSending ? (
          <Loader2 size={36} className="animate-spin" />
        ) : (
          <>
            <ShieldAlert size={36} />
            <span className="text-xs font-black uppercase tracking-wider mt-1">SOS PANIC</span>
          </>
        )}
      </button>

      <p className="text-[11px] font-bold text-rose-700 dark:text-rose-400 text-center max-w-xs">
        Tekan tombol merah jika membutuhkan bantuan medis, keamanan, atau pemadam kebakaran secara mendesak.
      </p>

      {showConfirmModal && (
        <SOSConfirmationModal
          isSending={isSending}
          onCancel={() => setShowConfirmModal(false)}
          onSend={handleSend}
        />
      )}
    </div>
  );
}
