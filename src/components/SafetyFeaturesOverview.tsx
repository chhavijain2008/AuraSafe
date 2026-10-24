import React from 'react';
import { Navigation, Users, ShieldAlert, Lock, ArrowUpRight } from 'lucide-react';

interface SafetyFeaturesOverviewProps {
  onSelectCategory: (category: 'physical' | 'safe_circle' | 'digital' | 'privacy') => void;
}

export const SafetyFeaturesOverview: React.FC<SafetyFeaturesOverviewProps> = ({
  onSelectCategory,
}) => {
  const features = [
    {
      id: 'physical' as const,
      category: 'Physical Safety',
      title: 'Adaptive Route Scoring',
      description: 'Navigate on real OpenStreetMap road geometry with live safety scoring weighted by your lighting and crowd priorities.',
      icon: Navigation,
      iconBg: 'bg-[#FFE7ED]',
      iconColor: 'text-[#E94F83]',
      actionText: 'Open Navigation Map',
      tag: 'Live OSRM Routing',
      emoji: '🌸',
    },
    {
      id: 'safe_circle' as const,
      category: 'Safe Circle',
      title: 'Trusted Contact Beacon',
      description: 'Share continuous live GPS coordinates with verified guardians and trigger an audible siren synthesizer during distress.',
      icon: Users,
      iconBg: 'bg-[#EAF5F0]',
      iconColor: 'text-[#388568]',
      actionText: 'Manage Safe Circle',
      tag: 'Real-time GPS Broadcast',
      emoji: '♡',
    },
    {
      id: 'digital' as const,
      category: 'Digital Safety',
      title: 'Threat & Harassment Scanner',
      description: 'Scan suspicious messages, links, and dating app interactions for stalking, coercion, or social engineering signals.',
      icon: ShieldAlert,
      iconBg: 'bg-[#FFF3E6]',
      iconColor: 'text-[#C88724]',
      actionText: 'Launch Threat Scanner',
      tag: 'AI Content Analysis',
      emoji: '✧',
    },
    {
      id: 'privacy' as const,
      category: 'Privacy & Control',
      title: 'Zero-Leakage Privacy Center',
      description: 'Granular controls for location telemetry, session broadcast revocation, and local data persistence.',
      icon: Lock,
      iconBg: 'bg-[#F2EDFD]',
      iconColor: 'text-[#7C3AED]',
      actionText: 'Review Privacy Settings',
      tag: 'User-Owned Data',
      emoji: '🪷',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8A6E7D] block mb-1">
            Holistic Protection
          </span>
          <h2 className="font-serif-title text-2xl sm:text-3xl text-[#422837] font-medium tracking-tight">
            Your safety,{' '}
            <span className="font-script text-3xl sm:text-4xl text-[#D84D7D] font-bold">
              thoughtfully connected ♡
            </span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#8A6E7D] max-w-md">
          Every tool is grounded in real data, instant emergency protocols, and user-first privacy standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.id}
              onClick={() => onSelectCategory(feat.id)}
              className="card-blush-glass p-6 group cursor-pointer flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(244,166,183,0.35)]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl ${feat.iconBg} ${feat.iconColor} flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs border border-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-script text-[#D84D7D] text-lg">
                    {feat.emoji}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#D84D7D] uppercase tracking-wider block">
                    {feat.category}
                  </span>
                  <h3 className="font-serif-title text-lg font-bold text-[#422837] leading-snug group-hover:text-[#E94F83] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#8A6E7D] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/80 flex items-center justify-between text-xs font-semibold text-[#422837] group-hover:text-[#E94F83] transition-colors">
                <span>{feat.actionText}</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
