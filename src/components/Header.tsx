import React, { useState, useRef, useEffect } from 'react';
import {
  Shield,
  Sliders,
  AlertTriangle,
  Volume2,
  Users,
  Navigation,
  Lock,
  ShieldAlert,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  UserX,
  EyeOff,
  LifeBuoy,
  Archive,
  LayoutDashboard,
} from 'lucide-react';
import { UserProfile, LiveLocationData } from '../types';
import { CyberTab } from '../types/cyber';

export type AppNavTab =
  | 'home'
  | 'physical'
  | 'safe_circle'
  | 'digital'
  | 'privacy'
  | CyberTab;

interface HeaderProps {
  user: UserProfile;
  location: LiveLocationData;
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onOpenPriorities: () => void;
  onTriggerPanic: () => void;
  onOpenContactView: () => void;
  isAlarmActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  location,
  activeTab,
  onSelectTab,
  onOpenPriorities,
  onTriggerPanic,
  onOpenContactView,
  isAlarmActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cyberDropdownOpen, setCyberDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const primaryContact =
    user.emergencyContacts?.find((c) => c.isPrimary) ||
    user.emergencyContacts?.[0] ||
    user.emergencyContact;
  const contactName = primaryContact?.name || 'Emergency Contact';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCyberDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCyberActive =
    activeTab === 'digital' ||
    (typeof activeTab === 'string' && activeTab.startsWith('cyber_'));

  const cyberMenuItems = [
    { id: 'cyber_dashboard' as CyberTab, label: 'Cyber Dashboard', desc: 'Central digital security hub', icon: LayoutDashboard },
    { id: 'cyber_shield' as CyberTab, label: 'AuraShield', desc: 'AI scanner for DMs, links & phishing', icon: ShieldAlert },
    { id: 'cyber_identity' as CyberTab, label: 'AuraIdentity', desc: 'Impersonation & fake profile tracker', icon: UserX },
    { id: 'cyber_image' as CyberTab, label: 'AuraImage', desc: 'Deepfake & NCII response toolkit', icon: EyeOff },
    { id: 'cyber_privacy' as CyberTab, label: 'AuraPrivacy', desc: '8-category personal privacy audit', icon: Sliders },
    { id: 'cyber_recover' as CyberTab, label: 'AuraRecover', desc: 'Account takeover & compromise playbooks', icon: LifeBuoy },
    { id: 'cyber_evidence' as CyberTab, label: 'AuraEvidence', desc: 'Private forensic vault & police reports', icon: Archive },
    { id: 'cyber_assist' as CyberTab, label: 'AuraAssist', desc: 'Guided AI incident triage companion', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/90 shadow-[0_4px_24px_rgba(244,166,183,0.18)]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 h-18 flex items-center justify-between gap-2 min-w-0">
        {/* Left: Brand & Wordmark with required CYBER badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('cyber_dashboard')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E94F83] via-[#F5A5BC] to-[#FFE7ED] flex items-center justify-center text-white shadow-sm shadow-[#F5A5BC]/50 group-hover:scale-105 transition-transform border border-white">
              <img
                src="/aurasafe-logo.png"
                alt="AuraSafe logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-title font-bold text-[#34232D] tracking-tight text-xl">
                  AuraSafe
                </span>
                <span className="font-script text-xl text-[#E94F83] font-bold">♡</span>
                <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-[#E94F83]/10 text-[#E94F83] border border-[#E94F83]/25 uppercase font-mono">
                  CYBER
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden 2xl:flex items-center gap-1 bg-white/70 p-1 rounded-full border border-white/90 shadow-inner shrink min-w-0">
          {/* Cyber Dashboard */}
          <button
            onClick={() => onSelectTab('cyber_dashboard')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cyber_dashboard' || activeTab === 'digital'
                ? 'bg-[#E94F83] text-white shadow-2xs font-bold'
                : 'text-[#866F7A] hover:text-[#34232D]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          {/* Cyber Tools Dropdown with all 7 modules */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCyberDropdownOpen(!cyberDropdownOpen)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                isCyberActive && activeTab !== 'cyber_dashboard' && activeTab !== 'digital'
                  ? 'bg-[#E94F83] text-white shadow-2xs font-bold'
                  : 'text-[#866F7A] hover:text-[#34232D]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cyber Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${cyberDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {cyberDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 p-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/95 shadow-xl shadow-[#F5A5BC]/20 z-50 animate-fadeIn space-y-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-[#866F7A] tracking-wider border-b border-[#F5A5BC]/20 mb-1 flex items-center justify-between">
                  <span>7 Cyber Safety Modules</span>
                  <span className="text-[#E94F83] font-script text-sm">Protected ♡</span>
                </div>
                {cyberMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setCyberDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isItemActive
                          ? 'bg-[#FFF0F3] text-[#E94F83] shadow-2xs'
                          : 'hover:bg-[#FFFAF7] text-[#34232D]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-xl shrink-0 ${isItemActive ? 'bg-[#E94F83] text-white shadow-xs' : 'bg-[#FFF0F3] text-[#E94F83]'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {isItemActive && <span className="w-1.5 h-1.5 rounded-full bg-[#E94F83]" />}
                        </div>
                        <div className="text-[10px] text-[#866F7A] line-clamp-1">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Route back to Physical Safety */}
          <button
            onClick={() => onSelectTab('physical')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'physical'
                ? 'bg-white text-[#E94F83] shadow-2xs border border-white/90'
                : 'text-[#866F7A] hover:text-[#34232D]'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-[#E94F83]" />
            <span>Safe Route</span>
          </button>

          {/* Safe Circle */}
          <button
            onClick={() => onSelectTab('safe_circle')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'safe_circle'
                ? 'bg-white text-[#E94F83] shadow-2xs border border-white/90'
                : 'text-[#866F7A] hover:text-[#34232D]'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-[#E94F83]" />
            <span>Safe Circle</span>
          </button>

          {/* Sanctuary Home */}
          <button
            onClick={() => onSelectTab('home')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white text-[#E94F83] shadow-2xs border border-white/90'
                : 'text-[#866F7A] hover:text-[#34232D]'
            }`}
          >
            Sanctuary Home
          </button>

          {/* Privacy Center */}
          <button
            onClick={() => onSelectTab('privacy')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'bg-white text-[#E94F83] shadow-2xs border border-white/90'
                : 'text-[#866F7A] hover:text-[#34232D]'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-[#388568]" />
            <span>Privacy</span>
          </button>
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Guardian Live Telemetry Pill */}
          <button
            onClick={onOpenContactView}
            className="hidden xl:flex items-center gap-2 px-2 py-1.5 rounded-full bg-white/80 hover:bg-white border border-white/90 text-[#388568] text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            title="Preview guardian view"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#388568] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#388568]"></span>
            </span>
            <span className="text-[11px] font-medium text-[#866F7A]">Guardian:</span>
            <span className="font-bold text-[#34232D] truncate max-w-[90px]">{contactName.split(' ')[0]}</span>
          </button>

          {/* User Profile / Avatar */}
          <div
            onClick={onOpenContactView}
            className="hidden 2xl:flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white/70 hover:bg-white border border-white/90 cursor-pointer shadow-2xs transition-colors"
            title="Logged in as Gaurika Dhamija"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E94F83] to-[#F5A5BC] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs">
              GD
            </div>
            <span className="text-xs font-semibold text-[#34232D] truncate max-w-[80px]">
              Gaurika
            </span>
          </div>

          {/* Priorities Adjuster */}
          <button
            onClick={onOpenPriorities}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-2 rounded-full text-[#34232D] hover:bg-white transition-colors text-xs font-semibold border border-white/90 bg-white/70 shadow-2xs cursor-pointer"
            title="Adjust safety scoring weights"
          >
            <Sliders className="w-3.5 h-3.5 text-[#E94F83]" />
            <span className="hidden xl:inline">Priorities</span>
          </button>

          {/* Prominent Emergency Red SOS Trigger */}
          <button
            onClick={onTriggerPanic}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-full font-bold text-xs whitespace-nowrap shrink-0 shadow-md transition-all cursor-pointer ${
              isAlarmActive
                ? 'bg-[#D83B52] text-white ring-4 ring-[#D83B52]/40 animate-panic-strobe'
                : 'bg-[#D83B52] hover:bg-[#c02f44] text-white shadow-[#D83B52]/25 hover:shadow-lg'
            }`}
          >
            {isAlarmActive ? (
              <>
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>SIREN BLARING</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>SOS ALARM</span>
              </>
            )}
          </button>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="2xl:hidden p-2 rounded-full text-[#34232D] hover:bg-white bg-white/70 border border-white/90 shadow-2xs"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="2xl:hidden bg-white/95 backdrop-blur-md border-b border-white/90 px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto animate-fadeIn">
          {/* Cyber Suite Main Links */}
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-[#E94F83] uppercase tracking-wider px-3 mb-1 flex items-center justify-between">
              <span>Cyber Defense Suite</span>
              <span className="font-mono text-[9px] bg-[#E94F83]/15 text-[#E94F83] px-1.5 py-0.5 rounded">CYBER</span>
            </div>
            <button
              onClick={() => {
                onSelectTab('cyber_dashboard');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                activeTab === 'cyber_dashboard' || activeTab === 'digital'
                  ? 'bg-[#E94F83] text-white shadow-2xs'
                  : 'text-[#34232D] hover:bg-[#FFF0F3]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Cyber Dashboard</span>
            </button>
          </div>

          <div className="space-y-1 pt-2 border-t border-[#F5A5BC]/30">
            <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider px-3 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E94F83]" />
              <span>7 Cyber Tools</span>
            </div>
            {cyberMenuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
                    activeTab === item.id
                      ? 'bg-[#FFF0F3] text-[#E94F83] font-bold'
                      : 'text-[#34232D] hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#E94F83]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-[#F5A5BC]/30">
            <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider px-3 mb-1">
              Physical Sanctuary & Settings
            </div>
            <button
              onClick={() => {
                onSelectTab('physical');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'physical' ? 'bg-[#FFF0F3] text-[#E94F83]' : 'text-[#34232D] hover:bg-[#FFF0F3]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-[#E94F83]" />
              <span>Physical Safe Route</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('safe_circle');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'safe_circle' ? 'bg-[#FFF0F3] text-[#E94F83]' : 'text-[#34232D] hover:bg-[#FFF0F3]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-[#E94F83]" />
              <span>Safe Circle (Guardians)</span>
            </button>
            <button
              onClick={() => {
                onSelectTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                activeTab === 'home' ? 'bg-[#FFF0F3] text-[#E94F83]' : 'text-[#34232D] hover:bg-[#FFF0F3]'
              }`}
            >
              Sanctuary Home
            </button>
            <button
              onClick={() => {
                onSelectTab('privacy');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                activeTab === 'privacy' ? 'bg-[#FFF0F3] text-[#E94F83]' : 'text-[#34232D] hover:bg-[#FFF0F3]'
              }`}
            >
              <Lock className="w-3.5 h-3.5 text-[#388568]" />
              <span>Privacy Center</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
