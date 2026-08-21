import React from 'react';
import { Calendar, Clock, MapPin, Users, Share2, CheckCircle2 } from 'lucide-react';
import { CommunityEvent } from '../../../shared/models/events';
import { getCategoryBadge, generateEventWhatsAppMessage } from '../logic/eventUtils';

interface EventCardProps {
  event: CommunityEvent;
  tenantName: string;
  currentUserId?: string;
  onToggleRSVP: (eventId: string, attendees: string[]) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  tenantName,
  currentUserId,
  onToggleRSVP
}) => {
  const badge = getCategoryBadge(event.category);
  const attendees = event.attendees || [];
  const isAttending = currentUserId ? attendees.includes(currentUserId) : false;

  const handleShareWA = () => {
    const text = generateEventWhatsAppMessage({
      tenantName,
      title: event.title,
      category: event.category,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      organizer: event.organizer
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${badge.color}`}>
            {badge.label}
          </span>
          <h3 className="text-xs font-bold text-slate-900 mt-1 truncate">
            {event.title}
          </h3>
        </div>

        <button
          onClick={handleShareWA}
          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-[10px] font-bold shrink-0"
        >
          <Share2 size={11} />
          <span>Bagikan WA</span>
        </button>
      </div>

      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-600">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <Calendar size={12} className="text-indigo-500" /> {event.date}
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-mono">
            <Clock size={12} className="text-amber-500" /> {event.time} WIB
          </span>
        </div>

        <div className="flex items-center gap-1 text-slate-600">
          <MapPin size={12} className="text-rose-500 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {event.description && (
          <p className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
            {event.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
          <Users size={12} className="text-slate-400" />
          <span>{attendees.length} Warga Hadir</span>
        </div>

        <button
          onClick={() => onToggleRSVP(event.id, attendees)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
            isAttending
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 size={12} />
          <span>{isAttending ? 'Saya Hadir' : 'Konfirmasi Hadir'}</span>
        </button>
      </div>
    </div>
  );
};
