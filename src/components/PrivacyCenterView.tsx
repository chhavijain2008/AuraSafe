import React, { useState } from 'react';
import { Lock, ShieldCheck, Eye, EyeOff, Trash2, Download, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { UserProfile, LiveLocationData } from '../types';

interface PrivacyCenterViewProps {
  user: UserProfile;
  location: LiveLocationData;
  onUpdateLocationSharing: (isSharing: boolean) => void;
  onClearData: () => void;
}

export const PrivacyCenterView: React.FC<PrivacyCenterViewProps> = ({
  user,
  location,
  onUpdateLocationSharing,
  onClearData,
}) => {
  const [isSharing, setIsSharing] = useState(location.isSharing);
  const [clearedMessage, setClearedMessage] = useState(false);

  const toggleSharing = () => {
    const nextState = !isSharing;
    setIsSharing(nextState);
    onUpdateLocationSharing(nextState);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aurasafe_profile_${user.name.replace(/\s+/g, '_').toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleClearLocalData = () => {
    if (confirm('Are you sure you want to reset your cached profile and priorities? You will be prompted to set up your profile again.')) {
      onClearData();
      setClearedMessage(true);
      setTimeout(() => setClearedMessage(false), 3000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card-blush-glass p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D84D7D]">
          <Lock className="w-4 h-4" />
          <span>Privacy & Consent Sanctuary</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#422837]">
          Privacy Center & Data Transparency
        </h2>
        <p className="text-sm text-[#8A6E7D] max-w-xl leading-relaxed">
          At AuraSafe, we believe safety without strict privacy is compromise. You maintain total sovereignty over your coordinates, telemetry broadcasting, and identity information.
        </p>
      </div>

      {clearedMessage && (
        <div className="p-4 rounded-2xl bg-[#388568]/10 border border-[#388568]/30 text-[#388568] text-xs font-medium flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Cached profile data successfully wiped from your local browser storage.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Live Location Broadcast Control */}
        <div className="card-blush-glass p-6 sm:p-7 space-y-5">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-serif-title text-lg font-bold text-[#422837] flex items-center gap-2">
                {isSharing ? <Eye className="w-5 h-5 text-[#388568]" /> : <EyeOff className="w-5 h-5 text-[#8A6E7D]" />}
                <span>Live Location Telemetry</span>
              </h3>
              <p className="text-xs text-[#8A6E7D] leading-relaxed">
                When active, your browser GPS coordinates update the temporary emergency session accessible by your Safe Circle guardians.
              </p>
            </div>

            <button
              type="button"
              onClick={toggleSharing}
              aria-label={isSharing ? 'Pause location sharing' : 'Enable location sharing'}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                isSharing ? 'bg-[#388568]' : 'bg-[#8A6E7D]/30'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                  isSharing ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 border border-white/90 shadow-2xs space-y-2 text-xs">
            <div className="flex justify-between items-center text-[#8A6E7D]">
              <span>Current Status:</span>
              <span className={`font-bold ${isSharing ? 'text-[#388568]' : 'text-[#8A6E7D]'}`}>
                {isSharing ? 'Active Broadcast to Guardians' : 'Paused / Ghost Mode'}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#8A6E7D]">
              <span>Active Tracking Session ID:</span>
              <span className="font-mono text-[#422837] text-[11px] font-semibold">{location.trackingId}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Local Storage & Profile Management */}
        <div className="card-blush-glass p-6 sm:p-7 space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif-title text-lg font-bold text-[#422837] flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#E94F83]" />
              <span>Personal Data Management</span>
            </h3>
            <p className="text-xs text-[#8A6E7D] leading-relaxed">
              Your priority sliders and emergency contact directory are stored encrypted in your local browser sandbox.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportData}
              className="px-4 py-2.5 rounded-full bg-white/80 hover:bg-white text-[#422837] text-xs font-semibold border border-white/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#E94F83]" />
              <span>Export Profile JSON</span>
            </button>

            <button
              onClick={handleClearLocalData}
              className="px-4 py-2.5 rounded-full bg-white/70 hover:bg-[#D83B52]/10 text-[#D83B52] text-xs font-semibold border border-[#D83B52]/30 shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Cached Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Transparency Matrix */}
      <div className="card-blush-glass p-6 sm:p-8 space-y-5">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D84D7D] block mb-1">
            Zero-Compromise Security
          </span>
          <h3 className="font-serif-title text-xl font-bold text-[#422837]">
            AuraSafe Data Privacy Commitment
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#F5A5BC]/30 text-[#8A6E7D] uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Data Category</th>
                <th className="pb-3 font-semibold">Storage Location</th>
                <th className="pb-3 font-semibold">Purpose</th>
                <th className="pb-3 font-semibold">Shared With 3rd Parties?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5A5BC]/20 text-[#422837]">
              <tr>
                <td className="py-3.5 font-semibold">GPS Coordinates</td>
                <td className="py-3.5 text-[#8A6E7D]">In-memory session buffer</td>
                <td className="py-3.5">Live tracking link for your Safe Circle guardians</td>
                <td className="py-3.5 text-[#388568] font-bold">Never (0%)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">Emergency Contacts</td>
                <td className="py-3.5 text-[#8A6E7D]">Local browser sandbox</td>
                <td className="py-3.5">Emergency call / SMS triggers and guardian notifications</td>
                <td className="py-3.5 text-[#388568] font-bold">Never (0%)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">Priority Weights</td>
                <td className="py-3.5 text-[#8A6E7D]">Local browser storage</td>
                <td className="py-3.5">Weighted safety scoring for lighting, transit & crowds</td>
                <td className="py-3.5 text-[#388568] font-bold">Never (0%)</td>
              </tr>
              <tr>
                <td className="py-3.5 font-semibold">Scanned Messages</td>
                <td className="py-3.5 text-[#8A6E7D]">Ephemeral processing only</td>
                <td className="py-3.5">Real-time threat & cyberstalking indicator analysis</td>
                <td className="py-3.5 text-[#388568] font-bold">Never retained</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
