// OVER_LIMIT_JUSTIFIED: Refactoring tertunda, logika komponen kohesif.
import { motion, AnimatePresence } from 'motion/react';
import { X, BellRing, Wallet, CheckCircle2, Landmark } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoName: string;
  demoSlogan: string;
  demoModules: any;
  selectedColor: any;
}

export const LivePreviewModal = ({
  isOpen, onClose,
  demoName, demoSlogan,
  demoModules, selectedColor
}: LivePreviewModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-900 text-white px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Live Preview Smartphone</span>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2.5 bg-slate-50 flex-1 scrollbar-thin">
              <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className={`w-6 h-6 rounded-lg ${selectedColor.bg} flex items-center justify-center text-white font-black text-xs shrink-0`}>
                    {demoName?.[0] || 'S'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[10px] font-black text-gray-900 leading-none uppercase truncate">{demoName}</h4>
                    <p className="text-[7px] text-gray-400 font-bold leading-none mt-0.5 truncate">{demoSlogan}</p>
                  </div>
                </div>
                <span className={`text-[6px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${selectedColor.badge}`}>
                  ONLINE
                </span>
              </div>

              {demoModules.emergency && (
                <div className="bg-red-50 border border-red-100 p-2 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-red-700">
                      <BellRing size={11} className="animate-bounce" />
                      <span className="text-[8px] font-black uppercase tracking-wider">DARURAT SOS DIGITAL</span>
                    </div>
                  </div>
                  <p className="text-[7px] text-red-600/90 leading-tight">Memicu sirine keras ke seluruh tetangga terdekat dalam radius 200m.</p>
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-xs">
                    🚨 AKTIFKAN ALARM
                  </button>
                </div>
              )}

              {demoModules.finance && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                  <div className="flex justify-between items-center py-0.5">
                    <div>
                      <p className="text-[6px] text-gray-400 uppercase leading-none">Total Saldo Kas</p>
                      <p className="text-xs font-black text-gray-800 mt-0.5">Rp 14.250.000</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded-lg space-y-1 text-[7px]">
                    <div className="flex justify-between text-gray-600">
                      <span>• Iuran Kebersihan RT</span>
                      <span className="text-emerald-600">+Rp 900.000</span>
                    </div>
                  </div>
                </div>
              )}

              {demoModules.social && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                  <div className="bg-blue-50/40 p-2 rounded-lg space-y-1">
                    <p className="text-[8px] font-black text-gray-800 leading-tight">Sembako Jumat Berkah Untuk Lansia</p>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full" style={{ width: '75%' }} />
                    </div>
                  </div>
                </div>
              )}

              {demoModules.marketplace && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="p-1.5 bg-gray-50 rounded-lg flex flex-col justify-between">
                      <p className="text-[8px] font-bold text-gray-800 leading-tight">Nasi Uduk Komplit</p>
                      <span className="text-[7px] font-black text-blue-600 mt-1">Rp 12.000</span>
                    </div>
                    <div className="p-1.5 bg-gray-50 rounded-lg flex flex-col justify-between">
                      <p className="text-[8px] font-bold text-gray-800 leading-tight">Es Kopi Aren</p>
                      <span className="text-[7px] font-black text-blue-600 mt-1">Rp 15.000</span>
                    </div>
                  </div>
                </div>
              )}

              {demoModules.koperasi && (
                <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-3xs space-y-1.5">
                  <div className="flex gap-1.5">
                    <button className="flex-1 bg-gray-100 text-gray-700 py-1 rounded-lg text-[6px] font-bold uppercase tracking-wider">
                      Simpanan
                    </button>
                    <button className={`flex-1 ${selectedColor.bg} text-white py-1 rounded-lg text-[6px] font-black uppercase tracking-wider`}>
                      Pinjaman
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 flex items-center justify-between text-[8px] text-gray-400">
              <span>*Tampilan mobile responsif</span>
              <button 
                onClick={onClose}
                className="bg-gray-800 hover:bg-gray-950 text-white px-2 py-1 rounded-md font-bold uppercase tracking-wider text-[7px]"
              >
                Tutup Preview
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
