import React, { useState } from 'react';
import { ContactsHeader } from './ContactsHeader';
import { ContactCard } from './ContactCard';
import { AddContactModal } from './AddContactModal';
import { useContacts } from '../logic/useContacts';
import { useAuth } from '../../../context/AuthContext';
import { isAdmin as checkAdmin } from '../../../lib/permissions';
import { PhoneCall, Inbox } from 'lucide-react';

export const ContactsContainer: React.FC = () => {
  const { profile, tenant } = useAuth();
  const {
    contacts,
    selectedCategory,
    setSelectedCategory,
    loading,
    createContact,
    deleteContact
  } = useContacts(tenant?.id);

  const [showAddModal, setShowAddModal] = useState(false);
  const isAdmin = checkAdmin(profile);

  return (
    <div className="space-y-3 pb-6">
      <ContactsHeader
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onAddNew={() => setShowAddModal(true)}
        isAdmin={isAdmin}
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Memuat daftar kontak darurat...</div>
      ) : contacts.length === 0 ? (
        <div className="p-8 text-center bg-white border border-slate-200/80 rounded-xl space-y-1.5">
          <Inbox size={28} className="mx-auto text-slate-300" />
          <h4 className="text-xs font-bold text-slate-700">Belum Ada Kontak Tersimpan</h4>
          <p className="text-[11px] text-slate-400">
            {isAdmin ? 'Klik "Tambah Kontak" untuk menambahkan fasilitas/instansi darurat.' : 'Belum ada kontak darurat yang didaftarkan oleh pengurus.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              isAdmin={isAdmin}
              onDelete={deleteContact}
            />
          ))}
        </div>
      )}

      <AddContactModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={async (data) => { await createContact(data); }}
      />
    </div>
  );
};
