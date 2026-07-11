import { motion } from 'motion/react';
import { Megaphone } from 'lucide-react';

interface SOSConfirmationModalProps {
  isSending: boolean;
  onCancel: () => void;
  onSend: (type: 'security' | 'medical' | 'fire' | 'other') => void;
}

export function SOSConfirmationModal({ isSending, onCancel, onSend }: SOSConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={() => !isSending && onCancel()}
      />
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="relative w-full max-w-sm bg-white rounded-2xl p-5 shadow-2xl"
      >
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Megaphone size={24} className="animate-bounce" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Kirim Alarm?</h2>
          <p className="text-[10px] text-gray-500 mt-1">Notifikasi akan dikirim ke seluruh warga.</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          {(['security', 'medical', 'fire', 'other'] as const).map(type => (
            <button
              key={type}
              onClick={() => onSend(type)}
              disabled={isSending}
              className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-center group"
            >
              <p className="text-[9px] font-black text-gray-400 group-hover:text-red-600 uppercase tracking-widest">{type}</p>
            </button>
          ))}
        </div>

        <button 
          onClick={onCancel}
          disabled={isSending}
          className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600"
        >
          Batal
        </button>
      </motion.div>
    </div>
  );
}
