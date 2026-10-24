import React from 'react';
import { X, Sliders, Sun, Users, Bus, Eye, ShieldAlert, Check } from 'lucide-react';
import { PriorityPreferences } from '../types';

interface PrioritiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  priorities: PriorityPreferences;
  onUpdatePriorities: (newPriorities: PriorityPreferences) => void;
}

export const PrioritiesModal: React.FC<PrioritiesModalProps> = ({
  isOpen,
  onClose,
  priorities,
  onUpdatePriorities,
}) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof PriorityPreferences, val: number) => {
    onUpdatePriorities({
      ...priorities,
      [key]: val,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34232D]/40 backdrop-blur-sm">
      <div className="card-blush-glass w-full max-w-lg rounded-3xl shadow-2xl border border-white/90 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#F5A5BC]/20 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFE7ED] text-[#E94F83] flex items-center justify-center shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-title text-lg font-bold text-[#422837]">Your Route Safety Priorities</h3>
              <p className="text-xs text-[#8A6E7D]">Route scores adapt instantly to your personalized weights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/80 flex items-center justify-center text-[#8A6E7D] hover:text-[#422837] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Priority Sliders */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* 1. Street Lighting */}
          <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-[#C88724]" />
                Street Lighting Quality
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
              onChange={(e) => handleChange('lighting', Number(e.target.value))}
              className="w-full accent-[#E94F83] cursor-pointer"
            />
            <p className="text-[11px] text-[#866F7A]">
              Higher weight prioritizes roads with continuous LED luminaires and penalizes dark segments.
            </p>
          </div>

          {/* 2. Crowd Density */}
          <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#E94F83]" />
                Crowd Density & Active Shops
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
              onChange={(e) => handleChange('crowd', Number(e.target.value))}
              className="w-full accent-[#E94F83] cursor-pointer"
            />
            <p className="text-[11px] text-[#866F7A]">
              Prefers populated market walks, late-night open cafes, and natural bystander vigilance.
            </p>
          </div>

          {/* 3. Nearby Public Transport */}
          <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-[#388568]" />
                Proximity to Public Transit
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
              onChange={(e) => handleChange('nearbyTransport', Number(e.target.value))}
              className="w-full accent-[#E94F83] cursor-pointer"
            />
            <p className="text-[11px] text-[#866F7A]">
              Ensures routes hug metro station gates, lighted bus stops, and official transit corridors.
            </p>
          </div>

          {/* 4. Accessibility & Open Spaces */}
          <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#7C3AED]" />
                Accessibility & Open Visibility
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
              onChange={(e) => handleChange('accessibility', Number(e.target.value))}
              className="w-full accent-[#E94F83] cursor-pointer"
            />
            <p className="text-[11px] text-[#866F7A]">
              Favors wide unobstructed sidewalks, good CCTV surveillance, and no blind corners.
            </p>
          </div>

          {/* 5. Crime History Caution */}
          <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#D83B52]" />
                Historical Crime Filter Weight
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
              onChange={(e) => handleChange('crimeHistoryWeight', Number(e.target.value))}
              className="w-full accent-[#E94F83] cursor-pointer"
            />
            <p className="text-[11px] text-[#866F7A]">
              Heavily discounts routes that have recent harassment or theft reports filed by the community.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-white/40 border-t border-[#F5A5BC]/20 flex items-center justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Weights & Recalculate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
