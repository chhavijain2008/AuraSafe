import React from 'react';
import {
  X,
  Shield,
  Battery,
  Phone,
  MapPin,
  AlertTriangle,
  ExternalLink,
  User,
  Radio,
} from 'lucide-react';
import { UserProfile, LiveLocationData } from '../types';

interface ContactViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  location: LiveLocationData;
  isPanicActive: boolean;
}

export const ContactViewModal: React.FC<ContactViewModalProps> = ({
  isOpen,
  onClose,
  user,
  location,
  isPanicActive,
}) => {
  if (!isOpen) return null;

  const primaryContact =
    user.emergencyContacts?.find((c) => c.isPrimary) ||
    user.emergencyContacts?.[0] ||
    user.emergencyContact;

  const contactName = primaryContact?.name || 'Emergency Contact';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#34232D]/50 backdrop-blur-xs">
      <div className="bg-[#1E151A] text-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#F5A5BC]/30 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#2A1D25] p-6 border-b border-[#F5A5BC]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E94F83]/20 border border-[#E94F83]/40 flex items-center justify-center text-[#E94F83]">
              <Shield className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5A5BC]">
                  Guardian Telemetry Radar
                </span>
                <span className="text-[10px] bg-white/10 text-white/80 px-2 py-0.5 rounded-full border border-white/10">
                  Recipient: {contactName}
                </span>
              </div>

              <h3 className="font-serif text-lg font-bold text-white tracking-tight mt-0.5">
                Live Broadcast for {user.name}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Panic Alert Banner */}
          {isPanicActive ? (
            <div className="p-4 rounded-2xl bg-[#D83B52] border border-[#D83B52]/40 text-white space-y-2 animate-pulse">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>PANIC SIREN ALERT TRIGGERED BY {user.name.toUpperCase()}!</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                Emergency strobe and siren are currently firing at these coordinates. Immediate contact or emergency assistance recommended.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#388568]/20 border border-[#388568]/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-[#388568] animate-ping absolute inset-0" />
                  <div className="w-3 h-3 rounded-full bg-[#388568] relative" />
                </div>

                <div>
                  <span className="text-xs font-bold text-[#388568] block">
                    Continuous GPS Broadcast Live
                  </span>
                  <span className="text-[11px] text-white/70">
                    Location sharing active for {contactName}
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-[#388568] bg-[#388568]/30 px-2.5 py-1 rounded-full border border-[#388568]/40 font-bold">
                ACTIVE
              </span>
            </div>
          )}

          {/* Telemetry Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-white/60 block">Battery</span>
              <span className="font-bold text-[#388568] text-sm tabular-nums flex items-center justify-center gap-1 mt-0.5">
                <Battery className="w-3.5 h-3.5" />
                {location.batteryLevel || 94}%
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-white/60 block">GPS Precision</span>
              <span className="font-bold text-white text-sm tabular-nums mt-0.5 block">
                ±{location.accuracy}m
              </span>
            </div>

            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-semibold text-white/60 block">Last Signal</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {location.lastBroadcastTime || 'Just now'}
              </span>
            </div>
          </div>

          {/* Location Radar Display */}
          <div className="p-4 bg-black/40 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E94F83]" />
                Live Coordinates:
              </span>
              <span className="font-mono font-bold text-[#F5A5BC] tabular-nums">
                {location.latitude.toFixed(5)}° N, {location.longitude.toFixed(5)}° E
              </span>
            </div>

            {/* Radar Simulation */}
            <div className="h-32 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full border border-[#E94F83]/30 animate-ping opacity-25" />
                <div className="w-16 h-16 rounded-full border border-[#388568]/40" />
              </div>

              <div className="z-10 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-[#E94F83] text-white flex items-center justify-center font-bold shadow-lg shadow-[#E94F83]/50 animate-bounce">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#F5A5BC] mt-1.5">
                  {user.name}'s Device Beacon
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`tel:${user.phone}`}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#388568] hover:bg-[#2e6d55] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call {user.name}</span>
            </a>

            <a
              href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-white/70" />
              <span>Open in Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
