import React from 'react';
import { useEmergency } from '../hooks/useEmergency';
import { EmergencyHeader } from './emergency/EmergencyHeader';
import { EmergencySOSButton } from './emergency/EmergencySOSButton';
import { EmergencyHistoryList } from './emergency/EmergencyHistoryList';

export default function EmergencySystem() {
  const { emergencies, isSending, triggerSOS } = useEmergency();

  return (
    <div className="w-full max-w-lg mx-auto space-y-3 px-2 sm:px-3 pb-8">
      <EmergencyHeader activeCount={emergencies.length} />
      <EmergencySOSButton isSending={isSending} onConfirmSOS={triggerSOS} />
      <EmergencyHistoryList emergencies={emergencies} />
    </div>
  );
}
