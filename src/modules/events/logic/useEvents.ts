import { useState, useEffect } from 'react';
import { CommunityEvent, EventCategory } from '../../../shared/models/events';
import { AppUser } from '../../../shared/models/auth';
import { subscribeEvents, createEvent, toggleRSVP } from '../storage/eventsStorage';

export function useEvents(tenantId?: string, user?: AppUser | null) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeEvents(
      tenantId,
      (data) => {
        setEvents(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [tenantId]);

  const filteredEvents = selectedCategory === 'all'
    ? events
    : events.filter(e => e.category === selectedCategory);

  const handleCreateEvent = async (params: {
    title: string;
    category: EventCategory;
    date: string;
    time: string;
    location: string;
    description?: string;
  }) => {
    if (!tenantId || !user) throw new Error('Pengguna belum login');
    return createEvent({
      tenantId,
      title: params.title,
      category: params.category,
      date: params.date,
      time: params.time,
      location: params.location,
      description: params.description,
      organizer: user.displayName || 'Pengurus RT'
    });
  };

  const handleToggleRSVP = async (eventId: string, currentAttendees: string[] = []) => {
    if (!user) return;
    const isAttending = currentAttendees.includes(user.uid);
    await toggleRSVP(eventId, user.uid, isAttending);
  };

  return {
    events: filteredEvents,
    allEventsCount: events.length,
    selectedCategory,
    setSelectedCategory,
    loading,
    addEvent: handleCreateEvent,
    toggleRSVP: handleToggleRSVP
  };
}
