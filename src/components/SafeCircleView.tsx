import React, { useState } from 'react';
import { Users, Phone, ShieldCheck, Plus, Trash2, Edit2, CheckCircle2, User, Eye, Send, Radio, Battery, MapPin } from 'lucide-react';
import { UserProfile, LiveLocationData, EmergencyContact } from '../types';

interface SafeCircleViewProps {
  user: UserProfile;
  location: LiveLocationData;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenGuardianPreview: () => void;
  onTriggerSOS: () => void;
}

export const SafeCircleView: React.FC<SafeCircleViewProps> = ({
  user,
  location,
  onUpdateUser,
  onOpenGuardianPreview,
  onTriggerSOS,
}) => {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelationship, setNewContactRelationship] = useState('Friend / Family');
  const [alertSuccess, setAlertSuccess] = useState<string | null>(null);

  const contacts = user.emergencyContacts || (user.emergencyContact ? [user.emergencyContact] : []);

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContact = {
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relationship: newContactRelationship,
      isPrimary: contacts.length === 0,
    };

    const updatedContacts = [...contacts, newContact];
    const updatedUser = {
      ...user,
      emergencyContacts: updatedContacts,
      emergencyContact: updatedContacts[0],
    };

    onUpdateUser(updatedUser);
    localStorage.setItem('aurasafe_user_profile', JSON.stringify(updatedUser));
    setNewContactName('');
    setNewContactPhone('');
    setIsAddingContact(false);
  };

  const handleSetPrimary = (index: number) => {
    const updatedContacts = contacts.map((c, i) => ({
      ...c,
      isPrimary: i === index,
    }));

    const updatedUser = {
      ...user,
      emergencyContacts: updatedContacts,
      emergencyContact: updatedContacts[index],
    };

    onUpdateUser(updatedUser);
    localStorage.setItem('aurasafe_user_profile', JSON.stringify(updatedUser));
  };

  const handleDeleteContact = (index: number) => {
    if (contacts.length <= 1) {
      alert('You must have at least one emergency contact in your Safe Circle.');
      return;
    }

    const updatedContacts = contacts.filter((_, i) => i !== index);
    if (!updatedContacts.some((c) => c.isPrimary)) {
      updatedContacts[0].isPrimary = true;
    }

    const updatedUser = {
      ...user,
      emergencyContacts: updatedContacts,
      emergencyContact: updatedContacts[0],
    };

    onUpdateUser(updatedUser);
    localStorage.setItem('aurasafe_user_profile', JSON.stringify(updatedUser));
  };

  const handleSendTestBeacon = (contact: EmergencyContact) => {
    setAlertSuccess(`Test beacon link dispatched to ${contact.name} (${contact.phone})`);
    setTimeout(() => setAlertSuccess(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card-blush-glass p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#388568]">
            <Users className="w-4 h-4" />
            <span>Guardian Network</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#34232D]">
            My Safe Circle & Trusted Guardians
          </h2>
          <p className="text-sm text-[#866F7A] max-w-xl leading-relaxed">
            These trusted contacts automatically receive your continuous GPS coordinates and instant notifications whenever you navigate after dark or trigger the panic siren.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenGuardianPreview}
            className="px-4 py-2.5 rounded-full bg-[#FFFAF7] hover:bg-[#FFE7ED] text-[#34232D] text-xs font-semibold border border-[#F5A5BC]/50 transition-colors flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4 text-[#E94F83]" />
            <span>Preview Guardian Screen</span>
          </button>

          <button
            onClick={() => setIsAddingContact(true)}
            className="px-4 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trusted Contact</span>
          </button>
        </div>
      </div>

      {alertSuccess && (
        <div className="p-4 rounded-2xl bg-[#388568]/10 border border-[#388568]/30 text-[#388568] text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{alertSuccess}</span>
        </div>
      )}

      {/* Add Contact Modal / Inline Drawer */}
      {isAddingContact && (
        <form
          onSubmit={handleAddContact}
          className="rounded-3xl bg-white p-6 sm:p-8 border border-[#F5A5BC]/50 shadow-md space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-[#34232D]">Add Guardian to Safe Circle</h3>
            <button
              type="button"
              onClick={() => setIsAddingContact(false)}
              className="text-xs text-[#866F7A] hover:text-[#34232D]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#866F7A] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="e.g. Sister (Priya)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFAF7] border border-[#F5A5BC]/40 text-xs text-[#34232D] focus:outline-none focus:border-[#E94F83]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#866F7A] mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFAF7] border border-[#F5A5BC]/40 text-xs text-[#34232D] focus:outline-none focus:border-[#E94F83]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-[#866F7A] mb-1">Relationship</label>
              <select
                value={newContactRelationship}
                onChange={(e) => setNewContactRelationship(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFAF7] border border-[#F5A5BC]/40 text-xs text-[#34232D] focus:outline-none focus:border-[#E94F83]"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Partner / Spouse">Partner / Spouse</option>
                <option value="Friend / Roommate">Friend / Roommate</option>
                <option value="Campus Security">Campus Security</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingContact(false)}
              className="px-4 py-2 rounded-full text-xs text-[#866F7A] hover:bg-[#FFE7ED]/40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#E94F83] text-white text-xs font-semibold hover:bg-[#d83c70]"
            >
              Save Guardian
            </button>
          </div>
        </form>
      )}

      {/* Contacts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {contacts.map((contact, idx) => (
          <div
            key={idx}
            className={`card-blush-glass p-6 transition-all duration-300 flex flex-col justify-between ${
              contact.isPrimary
                ? 'border-[#E94F83] ring-2 ring-[#F5A5BC]/50 shadow-[0_12px_32px_rgba(244,166,183,0.3)]'
                : 'hover:border-[#E94F83]/40'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFE7ED] text-[#E94F83] flex items-center justify-center font-bold text-sm">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif text-base font-bold text-[#34232D]">
                        {contact.name}
                      </h4>
                      {contact.isPrimary && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#388568]/15 text-[#388568] border border-[#388568]/30">
                          Primary
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#866F7A]">{contact.relationship}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteContact(idx)}
                  className="text-[#866F7A] hover:text-[#D83B52] p-1.5 rounded-lg hover:bg-[#FFE7ED]/50 transition-colors"
                  title="Remove contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-[#866F7A]">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#E94F83]" />
                  <span className="font-mono text-[#34232D]">{contact.phone || 'No phone set'}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#388568]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Configured in Live Broadcast</span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[#F5A5BC]/20 flex items-center justify-between gap-2">
              {!contact.isPrimary ? (
                <button
                  type="button"
                  onClick={() => handleSetPrimary(idx)}
                  className="text-xs font-semibold text-[#866F7A] hover:text-[#E94F83] transition-colors"
                >
                  Set as Primary
                </button>
              ) : (
                <span className="text-xs font-semibold text-[#388568]">Primary Guardian</span>
              )}

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSendTestBeacon(contact)}
                  className="p-2 rounded-xl bg-[#FFE7ED]/60 hover:bg-[#FFE7ED] text-[#E94F83] text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Test GPS beacon"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Test</span>
                </button>

                <a
                  href={`tel:${contact.phone}`}
                  className="p-2 rounded-xl bg-[#388568] hover:bg-[#2e6d55] text-white text-xs font-semibold transition-colors"
                  title="Direct Call"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Telemetry Status Banner */}
      <div className="card-blush-glass p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-[#388568] shadow-2xs">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-[#34232D]">
              Continuous Telemetry Beacon Active
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#866F7A] mt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E94F83]" />
                {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-[#388568]" />
                {location.batteryLevel || 94}%
              </span>
              <span>·</span>
              <span>Updated {location.lastBroadcastTime || 'just now'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenGuardianPreview}
          className="px-5 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          View Guardian Telemetry Screen
        </button>
      </div>
    </div>
  );
};
