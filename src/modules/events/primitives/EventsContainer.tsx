import React, { useState } from 'react';
import { EventsHeader } from './EventsHeader';
import { EventCard } from './EventCard';
import { CreateEventModal } from './CreateEventModal';
import { useEvents } from '../logic/useEvents';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { Calendar, Inbox } from 'lucide-react';

export const EventsContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const {
    events,
    selectedCategory,
    setSelectedCategory,
    loading,
    addEvent,
    toggleRSVP
  } = useEvents(tenant?.id, profile);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const isAdmin = checkAdmin(profile);

  return (
    <div className="space-y-3 pb-6">
      <EventsHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onCreateNew={() => setShowCreateModal(true)}
        isAdmin={isAdmin}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Memuat agenda kegiatan...</div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl space-y-1.5">
          <Inbox size={28} className="mx-auto text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">Belum Ada Agenda</h4>
          <p className="text-[11px] text-slate-400">
            Belum ada kegiatan warga yang dijadwalkan untuk kategori ini.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              tenantName={tenant?.name || 'Komunitas Warga'}
              currentUserId={profile?.uid}
              onToggleRSVP={toggleRSVP}
            />
          ))}
        </div>
      )}

      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={async (data) => { await addEvent(data); }}
      />
    </div>
  );
};
