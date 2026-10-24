import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Sparkles,
  MapPin,
  Sun,
  Users,
  Clock,
  Compass,
  CheckCircle2,
  Check,
  Play,
  Pause,
  AlertTriangle,
  Smile,
  Flame,
  Radio,
  Battery,
  Send,
  ArrowRight,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { UserProfile, LiveLocationData, NavigationRoute } from '../types';

interface SakuraHeroDashboardProps {
  user: UserProfile;
  location: LiveLocationData;
  selectedRoute?: NavigationRoute;
  onExploreTools: () => void;
  onOpenSafeCircle: () => void;
  onTriggerSOS: () => void;
  onOpenPriorities: () => void;
  onOpenContactView: () => void;
}

export const SakuraHeroDashboard: React.FC<SakuraHeroDashboardProps> = ({
  user,
  location,
  selectedRoute,
  onExploreTools,
  onOpenSafeCircle,
  onTriggerSOS,
  onOpenPriorities,
  onOpenContactView,
}) => {
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyTimer, setJourneyTimer] = useState(selectedRoute?.estimatedMinutes || 18);
  const [checklist, setChecklist] = useState([
    { id: 'guardian', label: 'Primary guardian linked', done: true },
    { id: 'beacon', label: 'Live GPS beacon active', done: true },
    { id: 'lighting', label: 'Well-lit road selected (94% illumination)', done: true },
    { id: 'havens', label: 'Safe haven pharmacy located', done: true },
    { id: 'siren', label: 'Panic alarm pre-tested', done: false },
    { id: 'battery', label: 'Battery charged above 80%', done: true },
  ]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const primaryContact =
    user.emergencyContacts?.find((c) => c.isPrimary) ||
    user.emergencyContacts?.[0] ||
    user.emergencyContact;

  const contactName = primaryContact?.name || 'Emergency Contact';

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP ROW: MAIN WISH CARD (LEFT) + WEATHER & MOOD (RIGHT)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: "Walk with peace of mind ♡" Main Hero Card */}
        <div className="lg:col-span-7 card-blush-glass p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
          {/* Decorative Cherry Blossom Corner Accents */}
          <div className="absolute top-2 left-3 text-2xl select-none pointer-events-none opacity-80">
            🌸
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#FFDDE6]/60 blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D84D7D] bg-white/70 px-3 py-1 rounded-full border border-white/90 shadow-2xs">
                AuraSafe Sanctuary
              </span>
              <span className="text-xs text-[#8A6E7D]">·</span>
              <span className="text-xs text-[#8A6E7D] font-medium">Your Personal Safe Space</span>
            </div>

            <div>
              <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-[#422837] tracking-tight font-medium leading-[1.15]">
                Walk with
                <br />
                <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#D84D7D] font-normal inline-block mt-1">
                  peace of mind ♡
                </span>
              </h1>
            </div>

            {/* Delicate divider with blossom / heart */}
            <div className="flex items-center justify-center sm:justify-start gap-3 py-1">
              <div className="h-[1px] w-16 bg-[#F5A5BC]/50" />
              <Heart className="w-4 h-4 text-[#E94F83] fill-[#E94F83]/70" />
              <div className="h-[1px] w-16 bg-[#F5A5BC]/50" />
            </div>

            <p className="text-sm sm:text-base text-[#8A6E7D] font-normal leading-relaxed max-w-lg">
              You are protected, empowered & cherished.
              <br />
              <span className="text-xs text-[#D84D7D] font-medium">Every journey. Always.</span>
            </p>
          </div>

          {/* Frosted Action Pills (Like Breathe / Relax / Reset) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-6 relative z-10">
            <button
              onClick={onExploreTools}
              className="btn-sakura-pill px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>🪷</span>
              <span>Safe Road Navigation</span>
            </button>

            <button
              onClick={onOpenSafeCircle}
              className="btn-sakura-pill px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span>♡</span>
              <span>Safe Circle ({contactName.split(' ')[0]})</span>
            </button>

            <button
              onClick={onTriggerSOS}
              className="px-5 py-2.5 rounded-full bg-[#D83B52] hover:bg-[#c02f44] text-white text-xs font-bold shadow-md shadow-[#D83B52]/20 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>✧</span>
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Right Stack: Location Context + Today's Safety Mood */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          {/* Card 1: Location & Environmental Safety Context (like Weather in ref) */}
          <div className="card-blush-glass p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#8A6E7D] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#E94F83]" />
                <span>{user.city || 'Tech & University Zone'}</span>
              </div>
              <span className="text-[11px] text-[#D84D7D] font-script text-base">Protected</span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFE7ED] to-white flex items-center justify-center text-3xl shadow-sm border border-white">
                  🌸
                </div>
                <div>
                  <div className="text-3xl font-bold font-serif-title text-[#422837] tracking-tight">
                    94%
                  </div>
                  <div className="text-xs text-[#8A6E7D]">Road Safety Score</div>
                </div>
              </div>

              <div className="text-right text-xs text-[#8A6E7D]">
                <div className="font-semibold text-[#388568]">High Illumination</div>
                <div className="text-[11px]">Transit: 60m away</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/80 flex items-center justify-between text-[11px] text-[#8A6E7D]">
              <span>Active GPS: ±{location.accuracy}m</span>
              <span>Updated just now ♡</span>
            </div>
          </div>

          {/* Card 2: Today's Safety Status & Mindset (like Today's Mood Happy in ref) */}
          <div className="card-blush-glass p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A6E7D] block mb-0.5">
                  Guardian Connection Status
                </span>
                <h3 className="font-script text-3xl text-[#D84D7D] font-bold">
                  Safe & Connected
                </h3>
                <p className="text-xs text-[#8A6E7D] mt-0.5">
                  Synced with {contactName} · Peaceful commute.
                </p>
              </div>

              <div className="w-12 h-12 rounded-full bg-[#FFE7ED] border border-white flex items-center justify-center text-2xl shadow-sm">
                😊
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                onClick={onOpenContactView}
                className="text-xs font-semibold text-[#D84D7D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Preview Guardian Live View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] text-[#388568] font-bold bg-[#388568]/10 px-2 py-0.5 rounded-full border border-[#388568]/20">
                Beacon Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECOND ROW: 3 MINI TRACKERS + SAFE JOURNEY TIMER RING
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 3 Trackers (like Water, Sleep, Steps in ref) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tracker 1: Streetlight Illumination */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6E7D]">
              <span className="text-base">💡</span>
              <span>Lighting Quality</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-bold font-serif-title text-[#422837] tabular-nums">
                {selectedRoute?.breakdown.lightingScore || 94}%
              </div>
              <span className="text-[11px] text-[#8A6E7D]">Continuous LED</span>
            </div>
            {/* Soft pink progress indicators */}
            <div className="flex gap-1.5 pt-1">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full ${
                    i < 5 ? 'bg-gradient-to-r from-[#E94F83] to-[#F5A5BC]' : 'bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Tracker 2: Guardian Beacon Live Sync */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6E7D]">
              <span className="text-base">📡</span>
              <span>Guardian Sync</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-bold font-serif-title text-[#422837] tabular-nums">
                {location.batteryLevel || 94}%
              </div>
              <span className="text-[11px] text-[#8A6E7D]">Battery & Telemetry</span>
            </div>
            {/* Soft purple/pink bar */}
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9333EA] to-[#E94F83] rounded-full"
                style={{ width: `${location.batteryLevel || 94}%` }}
              />
            </div>
          </div>

          {/* Tracker 3: Transit Hub Proximity */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8A6E7D]">
              <span className="text-base">🚇</span>
              <span>Transit Dist</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-bold font-serif-title text-[#422837] tabular-nums">
                {selectedRoute?.metrics.nearestTransitMeters || 60}m
              </div>
              <span className="text-[11px] text-[#8A6E7D]">Metro Entrance</span>
            </div>
            {/* Soft pink bar */}
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#E94F83] to-[#F5A5BC] rounded-full w-[85%]" />
            </div>
          </div>
        </div>

        {/* Right: Journey Guard Countdown Card (like Meditation 10:00 in ref) */}
        <div className="lg:col-span-5 card-blush-glass p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="space-y-0.5">
            <h3 className="font-script text-2xl text-[#D84D7D] font-bold">
              Safe Journey Guard
            </h3>
            <p className="text-[11px] text-[#8A6E7D]">Active commute companion</p>
          </div>

          {/* Circular Ring Timer */}
          <div className="my-4 relative flex items-center justify-center">
            {/* Outer pink circle glow */}
            <div className="w-36 h-36 rounded-full border-4 border-[#FFE7ED] flex items-center justify-center relative shadow-inner">
              <svg className="w-36 h-36 absolute inset-0 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  stroke="#F5A5BC"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="402"
                  strokeDashoffset={journeyActive ? '100' : '0'}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-xl">🪷</span>
                <span className="text-2xl font-bold font-serif-title text-[#422837] tabular-nums mt-0.5">
                  {journeyTimer}:00
                </span>
                <span className="text-[10px] text-[#8A6E7D] uppercase tracking-wider font-semibold">
                  Minutes
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setJourneyActive(!journeyActive)}
            className={`w-full max-w-xs py-2.5 rounded-full font-semibold text-xs transition-all shadow-xs cursor-pointer ${
              journeyActive
                ? 'bg-[#388568] text-white hover:bg-[#2e6d55]'
                : 'bg-white hover:bg-[#FFE7ED] text-[#D84D7D] border border-white/90'
            }`}
          >
            {journeyActive ? '● Tracking Active — Tap to Pause' : 'Start Safe Journey Mode'}
          </button>
        </div>
      </div>

      {/* ========================================================
          MIDDLE ROW: CALMING PANORAMIC SUNSET QUOTE BANNER
      ======================================================== */}
      <div className="card-blush-glass p-6 sm:p-8 relative overflow-hidden text-center bg-gradient-to-r from-[#FFD6E2] via-[#FFF0F4] to-[#FFD6E2] border border-white">
        <div className="absolute top-2 left-6 text-xl opacity-60">🦋</div>
        <div className="absolute bottom-2 right-8 text-xl opacity-60">🌸</div>

        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <p className="font-serif-title text-xl sm:text-2xl text-[#422837] font-medium leading-snug">
            "Your peace, safety, and freedom
            <br />
            are more important than anything."
          </p>
          <div className="text-sm text-[#D84D7D] font-script text-xl">♡ Always walk with dignity ♡</div>
        </div>
      </div>

      {/* ========================================================
          THIRD ROW: AFFIRMATION + CHECKLIST + SAFE HAVENS
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Daily Safety Affirmation (like in ref) */}
        <div className="card-blush-glass p-6 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A6E7D] block mb-2">
              Daily Affirmation
            </span>
            <span className="font-serif-title text-4xl text-[#F5A5BC] leading-none block">“</span>
            <p className="font-serif-title text-lg text-[#422837] italic leading-relaxed pt-1">
              I choose safety.
              <br />
              I walk boldly and guarded at my own pace.
            </p>
          </div>
          <div className="pt-4 flex items-center justify-between text-xs text-[#8A6E7D]">
            <span className="font-script text-lg text-[#D84D7D]">♡ Empowered</span>
            <span>🌸</span>
          </div>
        </div>

        {/* Card 2: Self-Care & Safety Checklist (interactive checkmarks) */}
        <div className="card-blush-glass p-6 space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A6E7D] block">
            Safe Routine Today
          </span>

          <div className="space-y-2 text-xs">
            {checklist.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleCheck(item.id)}
                className="w-full flex items-center justify-between text-left py-1 hover:opacity-80 transition-opacity cursor-pointer border-b border-white/60 pb-1.5 last:border-b-0"
              >
                <span
                  className={`flex items-center gap-2 ${
                    item.done ? 'text-[#422837] font-medium' : 'text-[#8A6E7D]'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      item.done
                        ? 'bg-[#E94F83] text-white shadow-xs'
                        : 'border border-[#F5A5BC] text-transparent'
                    }`}
                  >
                    ✓
                  </span>
                  <span>{item.label}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Safe Havens & Guardians (like Gratitude Journal in ref) */}
        <div className="card-blush-glass p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A6E7D]">
                My Safe Circle & Havens
              </span>
              <span>📝</span>
            </div>

            <div className="p-3 bg-white/70 rounded-2xl border border-white/90 space-y-2 text-xs text-[#422837]">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Mom (Sunita)</span>
                <span className="text-[10px] text-[#388568] font-bold">Primary Guardian</span>
              </div>
              <div className="flex items-center justify-between text-[#8A6E7D]">
                <span>Campus Police Booth</span>
                <span>140m • Staffed</span>
              </div>
              <div className="flex items-center justify-between text-[#8A6E7D]">
                <span>Apollo 24/7 Pharmacy</span>
                <span>180m • Open 24h</span>
              </div>
              <div className="flex items-center justify-between text-[#8A6E7D]">
                <span>Metro Security Hub</span>
                <span>Gate 2 • Verified</span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <span className="text-xs text-[#D84D7D] font-script text-base">Always protected ♡</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          FOURTH ROW: PROGRESS BAR WITH SPARKLE (like in ref)
      ======================================================== */}
      <div className="card-blush-glass p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-[#8A6E7D]">
          <span>🌸</span>
          <span className="font-semibold text-[#422837]">Progress, not perfection.</span>
          <span>Every verified step counts.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden p-0.5 relative">
            <div className="h-full bg-gradient-to-r from-[#F5A5BC] via-[#E94F83] to-[#F5A5BC] rounded-full w-[82%]" />
          </div>
          <span className="text-xs font-bold font-serif-title text-[#422837] shrink-0 tabular-nums">
            82%
          </span>
          <span className="text-sm">✧</span>
        </div>
      </div>

      {/* ========================================================
          BOTTOM REASSURANCE STRIP (like in ref)
      ======================================================== */}
      <div className="card-blush-subtle p-3.5 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-[#8A6E7D]">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#E94F83]" />
          <span>Be Kind to Yourself</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C88724]" />
          <span>You're Doing Great</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <span>🌸</span>
          <span>One Step at a Time</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#E94F83]" />
          <span>Keep Going</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[#C88724]" />
          <span>Walk in Peace</span>
        </div>
      </div>
    </div>
  );
};
