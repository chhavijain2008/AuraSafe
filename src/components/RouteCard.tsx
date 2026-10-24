import React from 'react';
import { Shield, Sparkles, Navigation, Clock, AlertTriangle, CheckCircle2, ChevronRight, Bus, Users, Sun, ShieldAlert } from 'lucide-react';
import { NavigationRoute, PriorityPreferences } from '../types';

interface RouteCardProps {
  route: NavigationRoute;
  isSelected: boolean;
  onSelect: () => void;
  priorities: PriorityPreferences;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected,
  onSelect,
  priorities,
}) => {
  const getTierDetails = (tier: 'SAFE' | 'MODERATE' | 'CAUTION') => {
    switch (tier) {
      case 'SAFE':
        return {
          text: 'text-[#388568]',
          bg: 'bg-[#388568]/10',
          border: 'border-[#388568]/30',
          label: 'Safe Corridor',
        };
      case 'MODERATE':
        return {
          text: 'text-[#C88724]',
          bg: 'bg-[#C88724]/10',
          border: 'border-[#C88724]/30',
          label: 'Moderate Safety',
        };
      case 'CAUTION':
      default:
        return {
          text: 'text-[#D83B52]',
          bg: 'bg-[#D83B52]/10',
          border: 'border-[#D83B52]/30',
          label: 'Caution Advised',
        };
    }
  };

  const tier = getTierDetails(route.safetyTier);

  return (
    <div
      onClick={onSelect}
      className={`transition-all duration-300 cursor-pointer overflow-hidden relative flex flex-col justify-between ${
        isSelected
          ? 'card-blush-glass border-[#E94F83] ring-2 ring-[#F5A5BC]/50 shadow-[0_14px_36px_rgba(244,166,183,0.35)]'
          : 'card-blush-glass hover:border-[#E94F83]/50'
      }`}
    >
      {/* Top Banner if AI Recommended */}
      {route.isAiRecommended && (
        <div className="bg-gradient-to-r from-[#E94F83] via-[#F5A5BC] to-[#E94F83] text-white px-5 py-2 flex items-center justify-between text-xs font-semibold tracking-wide">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Optimal Match for Your Safety Priorities</span>
          </div>
          <span className="text-[11px] font-mono text-white/90">AuraSafe Top Choice</span>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Header: Name, Distance, Duration & Score */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <h3 className="font-serif font-bold text-[#34232D] text-lg leading-snug">
              {route.name}
            </h3>
            <p className="text-xs text-[#866F7A] line-clamp-1">{route.tagline}</p>
            
            {/* Zero-pill metadata */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#866F7A] pt-0.5">
              <span className="flex items-center gap-1 text-[#34232D]">
                <Navigation className="w-3.5 h-3.5 text-[#E94F83]" />
                <span className="tabular-nums font-semibold">{route.distanceKm} km</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-[#34232D]">
                <Clock className="w-3.5 h-3.5 text-[#E94F83]" />
                <span className="tabular-nums font-semibold">{route.estimatedMinutes} mins</span>
              </span>
              <span>·</span>
              <span className="capitalize">{route.timeContext.replace('_', ' ')}</span>
            </div>
          </div>

          {/* Safety Score Dial */}
          <div className="flex flex-col items-end shrink-0">
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border ${tier.bg} ${tier.border} font-bold`}
            >
              <Shield className={`w-4 h-4 ${tier.text}`} />
              <div className="text-right">
                <span className={`text-xl leading-none font-bold tabular-nums ${tier.text}`}>
                  {route.overallScore}
                </span>
                <span className="text-[10px] text-[#866F7A] font-medium block">/100</span>
              </div>
            </div>
            <span className={`text-[10px] font-bold tracking-wider mt-1 uppercase ${tier.text}`}>
              {tier.label}
            </span>
          </div>
        </div>

        {/* Priority-Weighted Breakdown Bars */}
        <div className="p-4 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#866F7A] mb-1">
            <span>Safety Criteria Breakdown</span>
            <span>Weighted by your personal settings</span>
          </div>

          {/* 1. Lighting */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-[#34232D] font-medium">
                <Sun className="w-3 h-3 text-[#C88724]" />
                Street Lighting
                {priorities.lighting >= 4 && (
                  <span className="text-[9px] text-[#E94F83] font-semibold">(Top Priority)</span>
                )}
              </span>
              <span className="font-bold tabular-nums text-[#34232D]">{route.breakdown.lightingScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#C88724] rounded-full transition-all duration-300"
                style={{ width: `${route.breakdown.lightingScore}%` }}
              />
            </div>
          </div>

          {/* 2. Crowd & Open Shops */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-[#34232D] font-medium">
                <Users className="w-3 h-3 text-[#E94F83]" />
                Crowd Density & Open Shops
              </span>
              <span className="font-bold tabular-nums text-[#34232D]">{route.breakdown.crowdScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E94F83] rounded-full transition-all duration-300"
                style={{ width: `${route.breakdown.crowdScore}%` }}
              />
            </div>
          </div>

          {/* 3. Nearby Public Transport */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-[#34232D] font-medium">
                <Bus className="w-3 h-3 text-[#388568]" />
                Public Transit Proximity
              </span>
              <span className="font-bold tabular-nums text-[#34232D]">{route.breakdown.transportScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#388568] rounded-full transition-all duration-300"
                style={{ width: `${route.breakdown.transportScore}%` }}
              />
            </div>
          </div>

          {/* 4. Past Crime History */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="flex items-center gap-1.5 text-[#34232D] font-medium">
                <ShieldAlert className="w-3 h-3 text-[#D83B52]" />
                Low-Crime Safety Index
              </span>
              <span className="font-bold tabular-nums text-[#34232D]">{route.breakdown.crimeHistorySafety}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D83B52] rounded-full transition-all duration-300"
                style={{ width: `${route.breakdown.crimeHistorySafety}%` }}
              />
            </div>
          </div>
        </div>

        {/* Route Metrics Strip */}
        <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-[#F5A5BC]/30">
            <span className="text-[10px] text-[#866F7A] block font-semibold uppercase">Streetlamps</span>
            <span className="font-bold tabular-nums text-[#34232D]">{route.metrics.activeStreetlightsPercent}%</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#F5A5BC]/30">
            <span className="text-[10px] text-[#866F7A] block font-semibold uppercase">Open Stores</span>
            <span className="font-bold tabular-nums text-[#34232D]">{route.metrics.openShopsCount}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-[#F5A5BC]/30">
            <span className="text-[10px] text-[#866F7A] block font-semibold uppercase">Transit Dist</span>
            <span className="font-bold tabular-nums text-[#34232D]">{route.metrics.nearestTransitMeters}m</span>
          </div>
        </div>

        {/* AI Reasoning Pill */}
        <div className="p-3.5 bg-[#FFF4F5] rounded-2xl border border-[#F5A5BC]/40 text-xs text-[#34232D] space-y-1">
          <div className="font-semibold flex items-center gap-1.5 text-[#E94F83]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Safety Assessment</span>
          </div>
          <p className="text-[11px] text-[#866F7A] leading-relaxed">{route.aiReasoning}</p>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-[11px] text-[#866F7A]">
            {route.metrics.isolatedSegmentsMeters > 0 ? (
              <span className="text-[#C88724] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {route.metrics.isolatedSegmentsMeters}m low-illumination segment
              </span>
            ) : (
              <span className="text-[#388568] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Continuous illumination & visibility
              </span>
            )}
          </div>

          <button
            type="button"
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-[#E94F83] text-white shadow-xs'
                : 'bg-[#FFFAF7] hover:bg-[#FFE7ED] text-[#34232D] border border-[#F5A5BC]/40'
            }`}
          >
            <span>{isSelected ? 'Viewing on Map' : 'Select Road'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
