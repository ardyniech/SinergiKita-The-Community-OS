import { useState, useEffect } from 'react';
import { EmergencyContact, ContactCategory } from '../../../shared/models/contacts';
import { subscribeContacts, addContact, removeContact } from '../storage/contactsStorage';

export function useContacts(tenantId?: string) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenantId) {
      setLoading(false);
      return;
    }
    const unsub = subscribeContacts(
      tenantId,
      (data) => {
        setContacts(data);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, [tenantId]);

  const filteredContacts = selectedCategory === 'all'
    ? contacts
    : contacts.filter(c => c.category === selectedCategory);

  const handleAddContact = async (data: {
    name: string;
    category: ContactCategory;
    phone: string;
    address?: string;
    description?: string;
    isImportant?: boolean;
  }) => {
    if (!tenantId) throw new Error('Komunitas belum dipilih');
    return addContact({
      tenantId,
      ...data
    });
  };

  const handleRemoveContact = async (id: string) => {
    await removeContact(id);
  };

  return {
    contacts: filteredContacts,
    totalCount: contacts.length,
    selectedCategory,
    setSelectedCategory,
    loading,
    createContact: handleAddContact,
    deleteContact: handleRemoveContact
  };
}
