import { PriorityPreferences, RouteBreakdown, NavigationRoute } from '../types';

/**
 * Calculates a personalized route score weighted by the woman's custom priorities.
 * Normalizes user weights (1-5) and applies situational time-of-day dynamics.
 */
export function calculatePersonalizedScore(
  breakdown: RouteBreakdown,
  priorities: PriorityPreferences,
  timeContext: 'daylight' | 'afternoon' | 'after_dark' | 'late_night' = 'after_dark'
): number {
  const { lighting, crowd, nearbyTransport, accessibility, crimeHistoryWeight } = priorities;

  // Effective weights (base user setting with situational night-time adjustment)
  let wLight = lighting;
  let wCrowd = crowd;
  let wTransport = nearbyTransport;
  let wAccess = accessibility;
  let wCrime = crimeHistoryWeight;

  // When traveling after dark or late night, street lighting and crime safety have heightened real-world impact
  if (timeContext === 'after_dark' || timeContext === 'late_night') {
    wLight = Math.max(wLight, 3.5);
    wCrime = Math.max(wCrime, 3.5);
  }

  const totalWeight = wLight + wCrowd + wTransport + wAccess + wCrime;
  if (totalWeight === 0) return 70;

  // Calculate weighted sum
  const weightedSum =
    breakdown.lightingScore * wLight +
    breakdown.crowdScore * wCrowd +
    breakdown.transportScore * wTransport +
    breakdown.accessibilityScore * wAccess +
    breakdown.crimeHistorySafety * wCrime;

  let rawScore = Math.round(weightedSum / totalWeight);

  // Severe isolation penalty: if after dark and lighting is below 40, cap score
  if ((timeContext === 'after_dark' || timeContext === 'late_night') && breakdown.lightingScore < 40) {
    rawScore = Math.min(rawScore, 58);
  }

  // Cap between 5 and 99
  return Math.max(5, Math.min(99, rawScore));
}

export function getSafetyTier(score: number): 'SAFE' | 'MODERATE' | 'CAUTION' {
  if (score >= 82) return 'SAFE';
  if (score >= 65) return 'MODERATE';
  return 'CAUTION';
}

export function getTierColor(tier: 'SAFE' | 'MODERATE' | 'CAUTION') {
  switch (tier) {
    case 'SAFE':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        ring: 'border-emerald-500',
        hex: '#10b981',
        text: 'text-emerald-600',
      };
    case 'MODERATE':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-500 text-white',
        ring: 'border-amber-500',
        hex: '#f59e0b',
        text: 'text-amber-600',
      };
    case 'CAUTION':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-500 text-white',
        ring: 'border-rose-500',
        hex: '#ef4444',
        text: 'text-rose-600',
      };
  }
}
