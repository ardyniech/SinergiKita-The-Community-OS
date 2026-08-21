import React from 'react';
import { Phone, MapPin, Trash2, PhoneForwarded } from 'lucide-react';
import { EmergencyContact } from '../../../shared/models/contacts';
import { getContactCategoryBadge, formatPhoneNumber } from '../logic/contactUtils';

interface ContactCardProps {
  contact: EmergencyContact;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isAdmin,
  onDelete
}) => {
  const badge = getContactCategoryBadge(contact.category);
  const formattedPhone = formatPhoneNumber(contact.phone);

  const handleCall = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  const handleWA = () => {
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-md border ${badge.color}`}>
            {badge.label}
          </span>
          <h3 className="text-xs font-bold text-slate-900 mt-1">
            {contact.name}
          </h3>
        </div>

        {isAdmin && onDelete && (
          <button
            onClick={() => onDelete(contact.id)}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div className="p-2 bg-slate-50 rounded-lg space-y-1 text-[11px] text-slate-600">
        <div className="flex items-center justify-between font-mono font-medium text-slate-800">
          <span className="flex items-center gap-1">
            <Phone size={12} className="text-rose-600" /> {contact.phone}
          </span>
        </div>

        {contact.address && (
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <MapPin size={11} className="shrink-0 text-slate-400" />
            <span className="truncate">{contact.address}</span>
          </div>
        )}

        {contact.description && (
          <p className="text-[10px] text-slate-500 pt-0.5 border-t border-slate-200/60">
            {contact.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 pt-0.5">
        <button
          onClick={handleCall}
          className="flex items-center justify-center gap-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
        >
          <PhoneForwarded size={12} />
          <span>Panggil Langsung</span>
        </button>

        <button
          onClick={handleWA}
          className="flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-xs"
        >
          <span>Chat WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
