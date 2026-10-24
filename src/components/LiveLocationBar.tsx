import React, { useState } from 'react';
import { Radio, Eye, Battery, RefreshCw, Check, Copy, MapPin } from 'lucide-react';
import { LiveLocationData, EmergencyContact } from '../types';

interface LiveLocationBarProps {
  location: LiveLocationData;
  contact: EmergencyContact;
  onRefresh: () => void;
  onOpenContactView: () => void;
}

export const LiveLocationBar: React.FC<LiveLocationBarProps> = ({
  location,
  contact,
  onRefresh,
  onOpenContactView,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/?track=${location.trackingId}&mode=emergency_view`;
    navigator.clipboard?.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="card-blush-glass p-4 sm:p-5 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Status & Guardian Info */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative mt-0.5 sm:mt-0">
            <div className="w-11 h-11 rounded-2xl bg-white/80 border border-white flex items-center justify-center text-[#388568] shadow-2xs shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#388568] border-2 border-white animate-ping"></span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#388568] bg-[#388568]/10 px-3 py-0.5 rounded-full border border-[#388568]/20">
                ● Live Sharing Active
              </span>
              <span className="text-xs text-[#8A6E7D]">
                Synced with guardian: <strong className="text-[#422837] font-bold">{contact?.name || 'Emergency Contact'}</strong>{contact?.relationship ? ` (${contact.relationship})` : ''}
              </span>
            </div>

            <p className="text-xs text-[#8A6E7D] mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="flex items-center gap-1 font-mono text-[#422837] text-[11px] tabular-nums">
                <MapPin className="w-3.5 h-3.5 text-[#E94F83]" />
                {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                <span className="text-[#8A6E7D]">(±{location.accuracy}m)</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[11px] text-[#422837] tabular-nums">
                <Battery className="w-3.5 h-3.5 text-[#388568]" />
                {location.batteryLevel || 94}% Battery
              </span>
              <span>·</span>
              <span className="text-[11px] text-[#8A6E7D]">
                Updated {location.lastBroadcastTime || 'just now'} ♡
              </span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/60">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/70 hover:bg-white text-xs font-semibold text-[#422837] border border-white/90 transition-colors shadow-2xs cursor-pointer"
            title="Refresh GPS telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E94F83]" />
            <span className="hidden sm:inline">Refresh Beacon</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/70 hover:bg-white text-xs font-semibold text-[#422837] border border-white/90 transition-colors shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#388568]" /> : <Copy className="w-3.5 h-3.5 text-[#E94F83]" />}
            <span>{copied ? 'Link Copied!' : 'Copy Beacon Link'}</span>
          </button>

          <button
            onClick={onOpenContactView}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-white" />
            <span>Guardian View</span>
          </button>
        </div>
      </div>
    </div>
  );
};
