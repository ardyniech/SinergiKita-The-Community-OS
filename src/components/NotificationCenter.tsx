import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationDropdown } from './notifications/NotificationDropdown';

export default function NotificationCenter() {
  const { notifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-full transition-all relative cursor-pointer"
      >
        <Bell size={20} />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
            {notifications.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <NotificationDropdown
            notifications={notifications}
            onClose={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
