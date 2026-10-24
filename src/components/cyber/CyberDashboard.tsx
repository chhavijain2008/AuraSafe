import React, { useEffect, useState } from 'react';
import {
  Shield,
  ShieldAlert,
  UserX,
  EyeOff,
  Sliders,
  LifeBuoy,
  Archive,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  RefreshCw,
  FolderLock,
  Search,
  Heart,
  Sun,
  Smile,
  Compass,
  MapPin,
  Check,
  Edit3,
  Droplets,
  Clock,
  Moon,
} from 'lucide-react';
import { CyberStats, CyberTab, ThreatAnalysisRecord } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

interface CyberDashboardProps {
  onNavigateTab: (tab: CyberTab) => void;
  onSwitchToPhysical: () => void;
}

export const CyberDashboard: React.FC<CyberDashboardProps> = ({
  onNavigateTab,
  onSwitchToPhysical,
}) => {
  const [stats, setStats] = useState<CyberStats | null>(null);
  const [recentThreats, setRecentThreats] = useState<ThreatAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive widgets matching image_0d44e722.png
  // 1. Water / Safety checks tracker (6 of 8 default)
  const [checkedDroplets, setCheckedDroplets] = useState<number>(6);

  // 2. Meditation / Digital Peace Circular Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(600); // 10:00
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // 3. Today's Mood selector
  const [currentMood, setCurrentMood] = useState<'Happy' | 'Peaceful' | 'Calm' | 'Vigilant'>('Happy');

  // 4. Self-Care / Cyber Hygiene checklist
  const [checklist, setChecklist] = useState([
    { id: 'water', label: 'Drink Water & Hydrate', done: true },
    { id: '2fa', label: 'Verify Two-Factor Auth', done: true },
    { id: 'social', label: 'Review Social Visibility', done: true },
    { id: 'perms', label: 'Check App Permissions', done: false },
    { id: 'journal', label: 'Safe Journal Reflection', done: true },
    { id: 'detox', label: 'Evening Digital Detox', done: false },
  ]);

  // 5. Gratitude Journal notes
  const [gratitudeNotes, setGratitudeNotes] = useState<string>(
    'The little things · My supportive family · Safe digital spaces · Another beautiful day ♡'
  );
  const [isEditingGratitude, setIsEditingGratitude] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, threatsData] = await Promise.all([
        cyberApi.getStats(),
        cyberApi.getThreatHistory(),
      ]);
      setStats(statsData);
      setRecentThreats(threatsData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const completedChecklistCount = checklist.filter((item) => item.done).length;
  const progressPercent = Math.round((completedChecklistCount / checklist.length) * 100);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const tools = [
    {
      tab: 'cyber_shield' as CyberTab,
      name: 'AuraShield',
      badge: 'AI Threat Scanner',
      desc: 'Inspect suspicious DMs, phishing links, manipulation cues, and predatory messages with trauma-informed AI.',
      icon: ShieldAlert,
      color: 'from-[#E94F83] to-[#F5A5BC]',
      action: 'Scan Threat / Link',
    },
    {
      tab: 'cyber_identity' as CyberTab,
      name: 'AuraIdentity',
      badge: 'Impersonation Tracker',
      desc: 'Track fake profiles, compile forensic evidence, and access verified platform takedown routes.',
      icon: UserX,
      color: 'from-[#C88724] to-[#F4B266]',
      action: 'Track Impersonator',
    },
    {
      tab: 'cyber_image' as CyberTab,
      name: 'AuraImage',
      badge: 'Deepfake & NCII Response',
      desc: 'Zero-upload private incident documentation, StopNCII cryptographic hash generation, and takedowns.',
      icon: EyeOff,
      color: 'from-[#8E44AD] to-[#D84D7D]',
      action: 'Access Toolkit',
    },
    {
      tab: 'cyber_privacy' as CyberTab,
      name: 'AuraPrivacy',
      badge: '8-Category Audit',
      desc: 'Comprehensive personal security audit across email, social visibility, location sharing, and broker databases.',
      icon: Sliders,
      color: 'from-[#388568] to-[#58B690]',
      action: 'Start Privacy Audit',
    },
    {
      tab: 'cyber_recover' as CyberTab,
      name: 'AuraRecover',
      badge: 'Compromise Playbooks',
      desc: 'Step-by-step verified checklists to evict hackers, recover primary email accounts, and secure logins.',
      icon: LifeBuoy,
      color: 'from-[#2980B9] to-[#6DD5FA]',
      action: 'Launch Playbook',
    },
    {
      tab: 'cyber_evidence' as CyberTab,
      name: 'AuraEvidence',
      badge: 'Private Forensic Vault',
      desc: 'Timestamped digital evidence logs, cryptographic hashes, and exportable legal & police incident summaries.',
      icon: Archive,
      color: 'from-[#422837] to-[#7D4C6A]',
      action: 'Open Evidence Vault',
    },
    {
      tab: 'cyber_assist' as CyberTab,
      name: 'AuraAssist',
      badge: 'AI Triage Companion',
      desc: 'Calm, non-judgmental incident response companion for harassment, threats, doxxing, and cyberstalking.',
      icon: Sparkles,
      color: 'from-[#E94F83] via-[#F5A5BC] to-[#FFE7ED]',
      action: 'Talk to Companion',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* ========================================================
          TOP ROW: MAIN HERO CARD (LEFT) + WEATHER & MOOD (RIGHT)
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: "Take care of yourself ♡" Main Hero Card */}
        <div className="lg:col-span-7 card-blush-glass p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group">
          {/* Decorative Cherry Blossom Corner Accents */}
          <div className="absolute top-3 left-4 text-2xl select-none pointer-events-none opacity-80">
            🌸
          </div>
          <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full bg-gradient-to-br from-[#FFDDE6]/70 via-[#FFF0F3]/50 to-transparent blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10 text-center sm:text-left">
            <div>
              <h1 className="font-serif-title text-3xl sm:text-4xl lg:text-5xl text-[#34232D] tracking-tight font-medium leading-[1.15]">
                Take care of
                <br />
                <span className="font-script text-4xl sm:text-5xl lg:text-6xl text-[#E94F83] font-normal inline-block mt-1">
                  yourself ♡
                </span>
              </h1>
            </div>

            {/* Delicate divider with blossom / heart */}
            <div className="flex items-center justify-center sm:justify-start gap-3 py-1">
              <div className="h-[1px] w-16 bg-[#F5A5BC]/50" />
              <Heart className="w-4 h-4 text-[#E94F83] fill-[#E94F83]" />
              <div className="h-[1px] w-16 bg-[#F5A5BC]/50" />
            </div>

            <p className="text-sm sm:text-base text-[#866F7A] font-normal leading-relaxed max-w-lg">
              You are worth it.
              <br />
              <span className="text-xs text-[#E94F83] font-medium">Always.</span>
            </p>
          </div>

          {/* Frosted Action Pills: Breathe, Relax, Reset */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-6 relative z-10">
            <button
              onClick={() => {
                setTimerSeconds(600);
                setIsTimerRunning(true);
              }}
              className="btn-sakura-pill px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <span className="text-sm">🪷</span>
              <span>Breathe</span>
            </button>

            <button
              onClick={() => onNavigateTab('cyber_assist')}
              className="btn-sakura-pill px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-[#E94F83] fill-[#E94F83]/30" />
              <span>Relax</span>
            </button>

            <button
              onClick={loadData}
              className="btn-sakura-pill px-5 py-2.5 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C88724]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Right Stack: Weather & Location Widget + Today's Mood Widget */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          {/* Card 1: Location & Weather Widget (27° Partly Cloudy) */}
          <div className="card-blush-glass p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#866F7A] font-semibold">
                <MapPin className="w-3.5 h-3.5 text-[#E94F83]" />
                <span>Los Angeles, CA</span>
              </div>
              <span className="text-xs text-[#E94F83] font-script text-base">Protected ♡</span>
            </div>

            <div className="flex items-center justify-between my-2">
              <div className="flex items-center gap-3">
                {/* 3D Soft Cloud with Sun */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FFE7ED] via-white to-[#FFF0F4] flex items-center justify-center text-3xl shadow-sm border border-white">
                  ⛅
                </div>
                <div>
                  <div className="text-3xl font-light font-sans text-[#34232D] tracking-tight tabular-nums">
                    27°
                  </div>
                  <div className="text-xs text-[#866F7A]">Partly Cloudy</div>
                </div>
              </div>

              <div className="text-right text-xs text-[#866F7A] font-medium">
                <div>H: 28° &nbsp; L: 18°</div>
                <div className="text-[11px] text-[#388568] font-semibold mt-0.5">TLS 1.3 · Safe DNS</div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/80 flex items-center justify-between text-[11px] text-[#866F7A]">
              <span>Perimeter: Shielded</span>
              <Heart className="w-3.5 h-3.5 text-[#E94F83] fill-[#E94F83]" />
            </div>
          </div>

          {/* Card 2: Today's Mood Widget (Happy - Grateful heart, happy mind) */}
          <div className="card-blush-glass p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#866F7A] block mb-0.5">
                  Today's Mood
                </span>
                <h3 className="font-serif-title italic text-3xl text-[#E94F83] font-medium">
                  {currentMood}
                </h3>
                <p className="text-xs text-[#866F7A] mt-0.5">
                  Grateful heart, happy mind.
                </p>
              </div>

              {/* Pink smiling emoji avatar */}
              <button
                onClick={() => {
                  const moods: Array<'Happy' | 'Peaceful' | 'Calm' | 'Vigilant'> = [
                    'Happy',
                    'Peaceful',
                    'Calm',
                    'Vigilant',
                  ];
                  const next = moods[(moods.indexOf(currentMood) + 1) % moods.length];
                  setCurrentMood(next);
                }}
                className="w-12 h-12 rounded-full bg-[#FFE7ED] border border-white flex items-center justify-center text-2xl shadow-sm hover:scale-105 transition-transform cursor-pointer"
                title="Tap to change mood"
              >
                😊
              </button>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs text-[#866F7A]">
                Digital State: <strong className="text-[#388568]">Serene & Secure</strong>
              </span>
              <span className="text-[10px] text-[#388568] font-bold bg-[#388568]/10 px-2 py-0.5 rounded-full border border-[#388568]/20">
                All Systems Normal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SECOND ROW: 3 MINI TRACKERS + CIRCULAR MEDITATION TIMER
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: 3 Mini Trackers (Water Tracker, Sleep Tracker, Steps) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Tracker 1: Water Tracker (6/8 Glasses) */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#866F7A]">
              <span className="text-base">💧</span>
              <span>Water Tracker</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-normal font-sans text-[#34232D] tabular-nums">
                {checkedDroplets} / 8
              </div>
              <span className="text-[11px] text-[#866F7A]">Glasses</span>
            </div>
            {/* 8 clickable droplet icons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[...Array(8)].map((_, i) => {
                const filled = i < checkedDroplets;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCheckedDroplets(i + 1)}
                    className="cursor-pointer focus:outline-none hover:scale-110 transition-transform"
                    title={`Glass ${i + 1}`}
                  >
                    <div
                      className={`w-3.5 h-4.5 rounded-b-full rounded-t-[50%] transition-colors ${
                        filled
                          ? 'bg-[#E94F83] shadow-xs'
                          : 'border border-[#F5A5BC] bg-white/60'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tracker 2: Sleep Tracker (7h 30m Time Slept) */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#866F7A]">
              <span className="text-base">🌙</span>
              <span>Sleep Tracker</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-normal font-sans text-[#34232D] tabular-nums">
                7<span className="text-base text-[#866F7A]">h</span> 30<span className="text-base text-[#866F7A]">m</span>
              </div>
              <span className="text-[11px] text-[#866F7A]">Time Slept</span>
            </div>
            {/* Soft purple/pink rounded bar */}
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#A855F7] to-[#E94F83] rounded-full"
                style={{ width: '80%' }}
              />
            </div>
          </div>

          {/* Tracker 3: Steps (8,645 Steps Today) */}
          <div className="card-blush-glass p-5 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#866F7A]">
              <span className="text-base">👟</span>
              <span>Steps</span>
            </div>
            <div className="my-3">
              <div className="text-2xl font-normal font-sans text-[#34232D] tabular-nums">
                8,645
              </div>
              <span className="text-[11px] text-[#866F7A]">Steps Today</span>
            </div>
            {/* Soft rose bar */}
            <div className="w-full h-2 bg-white/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F5A5BC] to-[#E94F83] rounded-full"
                style={{ width: '72%' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Circular Meditation Timer (10:00 Minutes with Start button) */}
        <div className="lg:col-span-5 card-blush-glass p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="space-y-0.5">
            <h3 className="font-serif-title italic text-2xl text-[#34232D] font-medium">
              Meditation
            </h3>
            <p className="text-[11px] text-[#866F7A]">Time for you</p>
          </div>

          {/* Circular Ring Timer */}
          <div className="my-3 relative flex items-center justify-center">
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
                  strokeDashoffset={isTimerRunning ? '80' : '0'}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="flex flex-col items-center z-10">
                <span className="text-xl">🪷</span>
                <span className="text-2xl font-normal font-sans text-[#34232D] tabular-nums mt-0.5">
                  {formatTimer(timerSeconds)}
                </span>
                <span className="text-[10px] text-[#866F7A] uppercase tracking-wider font-semibold">
                  Minutes
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="w-full max-w-xs py-2.5 rounded-full font-medium text-xs transition-all shadow-xs cursor-pointer bg-[#FFE7ED] hover:bg-[#F5A5BC]/40 text-[#E94F83] border border-white"
          >
            {isTimerRunning ? 'Pause' : 'Start'}
          </button>
        </div>
      </div>

      {/* ========================================================
          THIRD ROW: SCENIC SUNSET REASSURANCE QUOTE BANNER
          "Your peace is more important than anything. ♡"
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="card-blush-glass p-8 sm:p-10 relative overflow-hidden text-center bg-gradient-to-r from-[#FFD6E2] via-[#FFF0F4] to-[#FFD6E2] border border-white shadow-sm">
        <div className="absolute top-3 left-6 text-2xl opacity-75">🦋</div>
        <div className="absolute bottom-3 right-8 text-2xl opacity-75">🌸</div>

        <div className="max-w-xl mx-auto space-y-2 relative z-10">
          <p className="font-serif-title text-2xl sm:text-3xl text-[#34232D] font-normal leading-snug">
            Your peace
            <br />
            is more important
            <br />
            than anything.
          </p>
          <div className="text-sm text-[#E94F83] font-script text-xl pt-1">♡</div>
        </div>
      </div>

      {/* ========================================================
          FOURTH ROW: 7 AURA-SAFE CYBER DEFENSE MODULES
          AuraShield, AuraIdentity, AuraImage, AuraPrivacy,
          AuraRecover, AuraEvidence, AuraAssist
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#E94F83]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AuraSafe Cyber Tools</span>
            </div>
            <h2 className="font-serif-title text-2xl sm:text-3xl font-medium text-[#34232D]">
              7 Digital Defense Workspaces
            </h2>
          </div>
          <button
            onClick={onSwitchToPhysical}
            className="text-xs font-semibold text-[#E94F83] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Switch to Physical Safe Route</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.tab}
                className="card-blush-glass p-6 flex flex-col justify-between group hover:border-[#F5A5BC] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full bg-[#FFF0F3] text-[#E94F83] border border-[#F5A5BC]/40 uppercase">
                      {tool.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-[#34232D] group-hover:text-[#E94F83] transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-[#866F7A] mt-1 line-clamp-2 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F5A5BC]/20">
                  <button
                    onClick={() => onNavigateTab(tool.tab)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white group-hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-xs font-bold text-[#34232D] group-hover:text-[#E94F83] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <span>{tool.action}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#E94F83] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          FIFTH ROW: 3-COLUMN SECTION
          1. Daily Affirmation
          2. Self-Care Today (interactive checklist)
          3. Gratitude Journal
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Daily Affirmation ("I choose myself. I bloom at my own pace. ♡") */}
        <div className="card-blush-glass p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#866F7A] block mb-2">
              Daily Affirmation
            </span>
            <span className="font-serif-title text-4xl text-[#F5A5BC] leading-none block">“</span>
            <p className="font-serif-title text-xl sm:text-2xl text-[#34232D] italic font-normal leading-relaxed pt-2">
              I choose myself.
              <br />
              I bloom at my
              <br />
              own pace.
            </p>
          </div>
          <div className="pt-6 flex items-center justify-between text-xs text-[#866F7A]">
            <span className="font-script text-xl text-[#E94F83]">♡</span>
            <span className="text-xl">🌸</span>
          </div>
        </div>

        {/* Card 2: Self-Care Today (Interactive Checkbox List) */}
        <div className="card-blush-glass p-6 sm:p-7 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#866F7A] block mb-3">
              Self-Care Today
            </span>

            <div className="space-y-2.5 text-xs">
              {checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleCheck(item.id)}
                  className="w-full flex items-center justify-between text-left py-1 hover:opacity-85 transition-opacity cursor-pointer border-b border-white/60 pb-1.5 last:border-b-0"
                >
                  <span
                    className={`flex items-center gap-2.5 ${
                      item.done ? 'text-[#34232D] font-medium' : 'text-[#866F7A]'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-all ${
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

          <div className="pt-2 flex items-center justify-between text-[11px] text-[#866F7A]">
            <span>{completedChecklistCount} of {checklist.length} completed</span>
            <span className="text-base">🌸</span>
          </div>
        </div>

        {/* Card 3: Gratitude Journal */}
        <div className="card-blush-glass p-6 sm:p-7 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#866F7A]">
                Gratitude Journal
              </span>
              <button
                onClick={() => setIsEditingGratitude(!isEditingGratitude)}
                className="text-[#E94F83] hover:opacity-80 p-1 cursor-pointer"
                title="Edit journal"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-[#866F7A]">Today I'm grateful for...</p>

            {isEditingGratitude ? (
              <textarea
                value={gratitudeNotes}
                onChange={(e) => setGratitudeNotes(e.target.value)}
                onBlur={() => setIsEditingGratitude(false)}
                rows={4}
                className="w-full p-3 bg-white/90 border border-white rounded-2xl text-xs text-[#34232D] focus:outline-none focus:border-[#E94F83]"
                autoFocus
              />
            ) : (
              <div
                onClick={() => setIsEditingGratitude(true)}
                className="p-3.5 bg-white/70 rounded-2xl border border-white/90 space-y-1.5 text-xs text-[#34232D] cursor-pointer hover:bg-white/90 transition-colors"
              >
                <p className="leading-relaxed">The little things</p>
                <p className="leading-relaxed">My family</p>
                <p className="leading-relaxed">Good health</p>
                <p className="leading-relaxed">Another beautiful day</p>
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-end">
            <Heart className="w-3.5 h-3.5 text-[#E94F83] fill-[#E94F83]" />
          </div>
        </div>
      </div>

      {/* ========================================================
          SIXTH ROW: PROGRESS BAR WITH SPARKLE STAR (75%)
          "Progress, not perfection. Small steps every day."
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="card-blush-glass p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-xs text-[#866F7A]">
          <span>🌸</span>
          <span className="font-medium text-[#34232D]">Progress, not perfection.</span>
          <span>Small steps every day.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-1/2">
          <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden p-0.5 relative">
            <div
              className="h-full bg-gradient-to-r from-[#F5A5BC] via-[#E94F83] to-[#F5A5BC] rounded-full transition-all duration-500"
              style={{ width: `${progressPercent || 75}%` }}
            />
          </div>
          <span className="text-sm text-[#E94F83]">✧</span>
          <span className="text-xs font-bold font-sans text-[#34232D] shrink-0 tabular-nums">
            {progressPercent || 75}%
          </span>
        </div>
      </div>

      {/* ========================================================
          SEVENTH ROW: BOTTOM REASSURANCE STRIP
          "Be Kind to Yourself · You're Doing Great · One Day at a Time · Keep Going · Better Days Are Coming"
          Directly matching image_0d44e722.png
      ======================================================== */}
      <div className="card-blush-subtle p-3.5 flex flex-wrap items-center justify-around gap-4 text-xs font-medium text-[#866F7A]">
        <div className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-[#E94F83] fill-[#E94F83]" />
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
          <span>One Day at a Time</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#E94F83]" />
          <span>Keep Going</span>
        </div>
        <span>·</span>
        <div className="flex items-center gap-1.5">
          <Sun className="w-3.5 h-3.5 text-[#C88724]" />
          <span>Better Days Are Coming</span>
        </div>
      </div>
    </div>
  );
};
