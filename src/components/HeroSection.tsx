import React from 'react';
import { Shield, Users, Lock, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { UserProfile, LiveLocationData } from '../types';

interface HeroSectionProps {
  user: UserProfile;
  location: LiveLocationData;
  onExploreTools: () => void;
  onOpenSafeCircle: () => void;
  onTriggerSOS: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  user,
  location,
  onExploreTools,
  onOpenSafeCircle,
  onTriggerSOS,
}) => {
  const primaryContact =
    user.emergencyContacts?.find((c) => c.isPrimary) ||
    user.emergencyContacts?.[0] ||
    user.emergencyContact;

  const contactName = primaryContact?.name || 'Emergency Contact';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFF4F5] via-[#FFFAF7] to-[#FFF4F5] border border-[#F5A5BC]/40 p-6 sm:p-10 lg:p-12 shadow-sm">
      {/* Subtle background ambient circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FFE7ED]/60 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#F5A5BC]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Proposition & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE7ED] border border-[#F5A5BC]/50 text-[#866F7A] text-xs font-semibold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5 text-[#E94F83]" />
            <span>Your Safety, Your Control</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#34232D] font-bold tracking-tight leading-[1.18] text-balance">
            Feel safer. Stay connected.{' '}
            <span className="text-[#E94F83] italic">Take control.</span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#866F7A] leading-relaxed max-w-xl font-normal">
            AuraSafe brings together situational road navigation, instant emergency assistance, digital threat awareness, and privacy protection into one calm, empowering sanctuary designed for women.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onExploreTools}
              className="px-6 py-3.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white font-semibold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore Your Safety Tools</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <button
              onClick={onOpenSafeCircle}
              className="px-6 py-3.5 rounded-full bg-white hover:bg-[#FFE7ED]/60 text-[#34232D] font-semibold text-sm border border-[#F5A5BC]/50 shadow-2xs hover:border-[#E94F83]/50 transition-all cursor-pointer"
            >
              Set Up My Safe Circle
            </button>
          </div>

          {/* Privacy Reassurance Note */}
          <div className="flex items-center gap-2.5 pt-2 text-xs text-[#866F7A]">
            <Lock className="w-4 h-4 text-[#388568] shrink-0" />
            <span>
              End-to-end user-controlled: your coordinates are shared only with the emergency contacts you choose.
            </span>
          </div>
        </div>

        {/* Right Column: High-Fidelity Character Illustration & Floating Badges */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-md">
            {/* Arched Illustration Frame */}
            <div className="relative overflow-hidden rounded-3xl border border-[#F5A5BC]/40 shadow-md bg-white">
              <img
                src="/src/assets/images/aurasafe_hero_woman_1792823827935.jpg"
                alt="AuraSafe safety companion illustration"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover transform hover:scale-[1.01] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#34232D]/30 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Card 1: Shield & Status (Top-Right) */}
            <div className="absolute -top-3 -right-3 sm:-right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#F5A5BC]/60 shadow-md animate-soft-float">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#FFE7ED] flex items-center justify-center text-[#E94F83]">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#34232D]">You're in control</div>
                  <div className="text-[11px] text-[#866F7A]">Adaptive route guardian</div>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Trusted Circle (Bottom-Left) */}
            <div className="absolute -bottom-4 -left-3 sm:-left-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-[#F5A5BC]/60 shadow-md animate-soft-float-delayed">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#388568]/15 flex items-center justify-center text-[#388568]">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#34232D]">Safe Circle Active</div>
                  <div className="text-[11px] text-[#866F7A]">
                    Syncing with {contactName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
