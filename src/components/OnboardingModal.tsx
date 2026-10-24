import React, { useState } from 'react';
import { Shield, User, Phone, Heart, Sliders, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserProfile, PriorityPreferences, EmergencyContact } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Basic details & Emergency Contact
  const [name, setName] = useState('Gaurika Dhamija');
  const [phone, setPhone] = useState('+1 (555) 349-8812');
  const [city, setCity] = useState('Central Campus & Tech Corridor');
  const [contactName, setContactName] = useState('Mom (Sunita)');
  const [contactPhone, setContactPhone] = useState('+1 (555) 890-4421');
  const [contactRelationship, setContactRelationship] = useState('Mother');

  // Step 2: Safety Priorities (1 to 5)
  const [priorities, setPriorities] = useState<PriorityPreferences>({
    lighting: 5,
    crowd: 4,
    nearbyTransport: 4,
    accessibility: 3,
    crimeHistoryWeight: 5,
  });

  if (!isOpen) return null;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (step === 1) {
      setStep(2);
    } else {
      const primaryContact: EmergencyContact = {
        name: contactName,
        phone: contactPhone,
        relationship: contactRelationship,
        isPrimary: true,
      };

      const profile: UserProfile = {
        name,
        phone,
        city,
        emergencyContact: primaryContact,
        emergencyContacts: [primaryContact],
        priorities,
        isLoggedIn: true,
        registeredAt: new Date().toISOString(),
      };
      onComplete(profile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34232D]/40 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#F5A5BC]/40 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-br from-[#FFF4F5] via-[#FFFAF7] to-[#FFE7ED] text-[#34232D] p-6 sm:p-8 relative border-b border-[#F5A5BC]/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-[#E94F83] text-white flex items-center justify-center shadow-xs">
              <Shield className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E94F83]">Welcome to AuraSafe</span>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#34232D]">Personal Safety & Digital Sanctuary</h2>
            </div>
          </div>
          <p className="text-xs text-[#866F7A] leading-relaxed max-w-md">
            Most navigation apps only optimize for distance. AuraSafe dynamically evaluates street lighting, crowd presence, past crime history, and live emergency guardian connectivity.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[#F5A5BC]/30 text-xs">
            <div className={`flex items-center gap-1.5 font-bold ${step === 1 ? 'text-[#E94F83]' : 'text-[#388568]'}`}>
              <span className="w-5 h-5 rounded-full bg-white border border-[#F5A5BC]/40 flex items-center justify-center text-[10px]">1</span>
              <span>Your Details & Guardian</span>
            </div>
            <span className="text-[#866F7A]">•</span>
            <div className={`flex items-center gap-1.5 font-bold ${step === 2 ? 'text-[#E94F83]' : 'text-[#866F7A]'}`}>
              <span className="w-5 h-5 rounded-full bg-white border border-[#F5A5BC]/40 flex items-center justify-center text-[10px]">2</span>
              <span>Route Safety Priorities</span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleNext} className="p-6 sm:p-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#866F7A] uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#866F7A] absolute left-3 top-3.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Gaurika Dhamija"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFAF7] border border-[#F5A5BC]/40 rounded-xl text-sm font-medium text-[#34232D] focus:bg-white focus:outline-none focus:border-[#E94F83]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#866F7A] uppercase tracking-wider mb-1">
                    Your Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#866F7A] absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3 py-2.5 bg-[#FFFAF7] border border-[#F5A5BC]/40 rounded-xl text-sm font-medium text-[#34232D] focus:bg-white focus:outline-none focus:border-[#E94F83]"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="p-5 bg-[#FFFAF7] rounded-3xl border border-[#F5A5BC]/30 space-y-3">
                <div className="flex items-center gap-2 text-[#E94F83]">
                  <Heart className="w-4 h-4 text-[#E94F83] fill-[#E94F83]" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Primary Emergency Guardian (Live Location Recipient)
                  </span>
                </div>
                <p className="text-xs text-[#866F7A]">
                  As soon as you enter the app, your real-time live location beacon can be shared with this contact.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#866F7A] mb-1">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Mom / Sarah"
                      className="w-full px-3 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#866F7A] mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 (555) 890-4421"
                      className="w-full px-3 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#866F7A] mb-1">Relationship</label>
                    <select
                      value={contactRelationship}
                      onChange={(e) => setContactRelationship(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83]"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Partner / Spouse">Partner / Spouse</option>
                      <option value="Friend / Roommate">Friend / Roommate</option>
                      <option value="Campus Security">Campus Security Desk</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#FFE7ED]/50 rounded-2xl border border-[#F5A5BC]/30 text-xs text-[#34232D]">
                <CheckCircle2 className="w-4 h-4 text-[#388568] shrink-0" />
                <span>Next step: Configure your personalized safety priorities (lighting, crowd, transit).</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#34232D]">Customize Your Route Safety Priorities</h3>
                <p className="text-xs text-[#866F7A] mt-0.5">
                  How should our Machine Learning model score and recommend routes for you? Adjust the sliders based on what makes you feel safest.
                </p>
              </div>

              {/* Priority 1: Street Lighting */}
              <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                    💡 Street Lighting Quality
                  </span>
                  <span className="font-bold tabular-nums text-[#C88724] px-2.5 py-0.5 rounded-full bg-[#C88724]/10">
                    Priority {priorities.lighting}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priorities.lighting}
                  onChange={(e) => setPriorities({ ...priorities, lighting: Number(e.target.value) })}
                  className="w-full accent-[#E94F83] cursor-pointer"
                />
              </div>

              {/* Priority 2: Crowd & Storefronts */}
              <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                    👥 Crowd Density & Active Shops
                  </span>
                  <span className="font-bold tabular-nums text-[#E94F83] px-2.5 py-0.5 rounded-full bg-[#E94F83]/10">
                    Priority {priorities.crowd}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priorities.crowd}
                  onChange={(e) => setPriorities({ ...priorities, crowd: Number(e.target.value) })}
                  className="w-full accent-[#E94F83] cursor-pointer"
                />
              </div>

              {/* Priority 3: Nearby Public Transport */}
              <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                    🚇 Proximity to Public Transit
                  </span>
                  <span className="font-bold tabular-nums text-[#388568] px-2.5 py-0.5 rounded-full bg-[#388568]/10">
                    Priority {priorities.nearbyTransport}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priorities.nearbyTransport}
                  onChange={(e) => setPriorities({ ...priorities, nearbyTransport: Number(e.target.value) })}
                  className="w-full accent-[#E94F83] cursor-pointer"
                />
              </div>

              {/* Priority 4: Accessibility & Open Spaces */}
              <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                    🏛️ Accessibility & Open Visibility
                  </span>
                  <span className="font-bold tabular-nums text-[#7C3AED] px-2.5 py-0.5 rounded-full bg-[#7C3AED]/10">
                    Priority {priorities.accessibility}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priorities.accessibility}
                  onChange={(e) => setPriorities({ ...priorities, accessibility: Number(e.target.value) })}
                  className="w-full accent-[#E94F83] cursor-pointer"
                />
              </div>

              {/* Priority 5: Crime History Weight */}
              <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                    🚨 Historical Crime Filter Weight
                  </span>
                  <span className="font-bold tabular-nums text-[#D83B52] px-2.5 py-0.5 rounded-full bg-[#D83B52]/10">
                    Priority {priorities.crimeHistoryWeight}/5
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={priorities.crimeHistoryWeight}
                  onChange={(e) => setPriorities({ ...priorities, crimeHistoryWeight: Number(e.target.value) })}
                  className="w-full accent-[#E94F83] cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F5A5BC]/20">
            {step === 2 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#866F7A] hover:bg-[#FFE7ED]/50 transition-colors"
              >
                Back to Details
              </button>
            ) : (
              <div className="text-[11px] text-[#866F7A]">Step 1 of 2</div>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>{step === 1 ? 'Next: Set Priorities' : 'Enter AuraSafe Sanctuary'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
