import React from 'react';
import { Calendar, User } from 'lucide-react';
import { Badge } from '../atoms/Badge';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  authorName: string;
  createdAt: any;
}

export const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({ announcement }) => {
  const date = announcement.createdAt?.toDate?.() || new Date();
  
  return (
    <div className="p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-1.5">
        <h4 className="text-xs font-black text-gray-900 leading-tight flex-1 mr-2">{announcement.title}</h4>
        <Badge 
          label={announcement.priority} 
          variant={announcement.priority === 'high' ? 'rose' : announcement.priority === 'medium' ? 'orange' : 'blue'} 
        />
      </div>
      <p className="text-[11px] text-gray-600 mb-2 line-clamp-2">{announcement.content}</p>
      <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400">
        <div className="flex items-center gap-1">
          <User size={10} />
          {announcement.authorName}
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={10} />
          {date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
        </div>
      </div>
    </div>
  );
};
