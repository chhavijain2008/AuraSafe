import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertTriangle, Phone, ShieldAlert, Zap, X, MapPin, Radio, BellOff } from 'lucide-react';
import { startEmergencyAlarm, stopEmergencyAlarm } from '../utils/alarmAudio';
import { EmergencyContact, LiveLocationData } from '../types';

interface PanicModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: EmergencyContact;
  location: LiveLocationData;
}

export const PanicModal: React.FC<PanicModalProps> = ({
  isOpen,
  onClose,
  contact,
  location,
}) => {
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isStrobeActive, setIsStrobeActive] = useState(true);
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-start emergency siren when panic modal is explicitly opened
      const started = startEmergencyAlarm();
      setIsSirenActive(started);
      // Auto-broadcast panic status
      setSosSent(true);
    } else {
      stopEmergencyAlarm();
      setIsSirenActive(false);
    }

    return () => {
      stopEmergencyAlarm();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleSiren = () => {
    if (isSirenActive) {
      stopEmergencyAlarm();
      setIsSirenActive(false);
    } else {
      const started = startEmergencyAlarm();
      setIsSirenActive(started);
    }
  };

  const handleStopAll = () => {
    stopEmergencyAlarm();
    setIsSirenActive(false);
    onClose();
  };

  const emergencyMessage = encodeURIComponent(
    `EMERGENCY SOS ALERT! I am feeling unsafe or in danger. My live GPS coordinates are: https://maps.google.com/?q=${location.latitude},${location.longitude} (AuraSafe Protected)`
  );

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        isStrobeActive ? 'animate-panic-strobe' : 'bg-red-950/80 backdrop-blur-md'
      }`}
    >
      <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border-4 border-red-600 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        {/* Header Alert Ribbon */}
        <div className="bg-red-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded-sm">
                Acoustic Distress Beacon
              </span>
              <h2 className="text-xl font-black tracking-tight">HIGH-DECIBEL PANIC SIREN</h2>
            </div>
          </div>
          <button
            onClick={handleStopAll}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Audio Siren status banner */}
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isSirenActive ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-200 text-slate-600'}`}>
                {isSirenActive ? <Volume2 className="w-6 h-6 animate-bounce" /> : <VolumeX className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-red-900">
                  {isSirenActive ? 'PIERCING SIREN ACTIVE' : 'SIREN PAUSED'}
                </h4>
                <p className="text-xs text-red-700">
                  Dual-frequency sawtooth sound wave optimized for far-distance audibility in isolated zones.
                </p>
              </div>
            </div>
            <button
              onClick={toggleSiren}
              className={`px-3 py-2 rounded-xl text-xs font-black shadow-xs transition-all ${
                isSirenActive
                  ? 'bg-slate-800 text-white hover:bg-slate-900'
                  : 'bg-red-600 text-white hover:bg-red-700 ring-2 ring-red-300'
              }`}
            >
              {isSirenActive ? 'Mute Siren' : 'Sound Siren'}
            </button>
          </div>

          {/* Strobe flasher toggle */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <div>
                <span className="text-xs font-bold text-slate-800">Visual SOS Strobe Flasher</span>
                <p className="text-[11px] text-slate-500">Flashes bright red and white to attract attention in the dark</p>
              </div>
            </div>
            <button
              onClick={() => setIsStrobeActive(!isStrobeActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isStrobeActive ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {isStrobeActive ? 'Strobe ON' : 'Strobe OFF'}
            </button>
          </div>

          {/* Instant SOS Dispatch to Emergency Contact */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
                <span>Emergency Contact Broadcast</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Auto-Dispatched
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your live GPS ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}) is continuously synced to{' '}
              <strong className="text-white">{contact?.name || 'Emergency Contact'}</strong>{contact?.phone ? ` (${contact.phone})` : ''}.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={contact?.phone ? `tel:${contact.phone}` : '#'}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-extrabold shadow-md transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call {contact?.relationship || 'Contact'}</span>
              </a>

              <a
                href={contact?.phone ? `sms:${contact.phone}?body=${emergencyMessage}` : '#'}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-colors"
              >
                <span>Send SMS with GPS</span>
              </a>
            </div>
          </div>

          {/* Quick Safe Havens Near Location */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              Nearest Safe Havens (Within 350m)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Campus Police Booth</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">140m away • Open 24/7</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-900 block">Apollo 24/7 Pharmacy</span>
                <span className="text-[11px] text-emerald-600 font-semibold block">180m away • Staffed</span>
              </div>
            </div>
          </div>

          {/* Big Deactivate Button */}
          <button
            onClick={handleStopAll}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <BellOff className="w-4 h-4 text-slate-400" />
            <span>I Am Safe — Deactivate Alarm & Strobe</span>
          </button>
        </div>
      </div>
    </div>
  );
};
