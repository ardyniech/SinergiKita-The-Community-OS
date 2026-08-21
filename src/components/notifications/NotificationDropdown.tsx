import React from 'react';
import { motion } from 'motion/react';
import { NotificationItem } from '../../hooks/useNotifications';

interface NotificationDropdownProps {
  notifications: NotificationItem[];
  onClose: () => void;
}

export function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden"
      >
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Notifikasi
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">{notifications.length} Pesan</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-slate-400 italic">Tidak ada notifikasi baru.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                    n.type === 'emergency' ? 'bg-rose-50/50 dark:bg-rose-950/30 hover:bg-rose-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      n.type === 'emergency' ? 'bg-red-600 animate-pulse' :
                      n.type === 'approval' ? 'bg-amber-500' :
                      n.type === 'request' ? 'bg-blue-500' : 'bg-emerald-500'
                    }`} />
                    <p className={`text-[11px] font-bold ${
                      n.type === 'emergency' ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100'
                    }`}>{n.title}</p>
                  </div>
                  <p className={`text-[10px] leading-relaxed ${
                    n.type === 'emergency' ? 'text-red-900 dark:text-red-300 font-medium' : 'text-slate-600 dark:text-slate-300'
                  }`}>{n.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {notifications.length > 0 && (
          <div className="p-2 bg-slate-50 dark:bg-slate-800/50 text-center">
            <button className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 cursor-pointer">
              Tandai semua dibaca
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
