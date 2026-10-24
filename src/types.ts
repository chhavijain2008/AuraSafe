export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
  isPrimary?: boolean;
  email?: string;
}

export interface PriorityPreferences {
  lighting: number; // 1 to 5 scale
  crowd: number; // 1 to 5 scale
  nearbyTransport: number; // 1 to 5 scale
  accessibility: number; // 1 to 5 scale
  crimeHistoryWeight: number; // 1 to 5 scale
}

export interface UserProfile {
  name: string;
  phone: string;
  city: string;
  emergencyContact?: EmergencyContact;
  emergencyContacts?: EmergencyContact[];
  priorities: PriorityPreferences;
  isLoggedIn: boolean;
  registeredAt: string;
}

export interface RouteBreakdown {
  lightingScore: number; // 0 - 100
  crowdScore: number; // 0 - 100
  transportScore: number; // 0 - 100
  crimeHistorySafety: number; // 0 - 100 (100 is safest/lowest crime)
  accessibilityScore: number; // 0 - 100
}

export interface RouteMetrics {
  activeStreetlightsPercent: number;
  openShopsCount: number;
  nearestTransitMeters: number;
  historicalIncidentsCount: number; // in past 6 months
  cctvCoveragePercent: number;
  isolatedSegmentsMeters: number;
  policeBoothDistanceMeters: number;
  communitySafetyRating: number; // out of 5
}
export interface RouteCoordinate {
  lat: number;
  lng: number;
}

export interface RouteWaypoint {
  name: string;
  lat: number;
  lng: number;
  safetyTier: 'safe' | 'moderate' | 'caution';
  lightingQuality: 'Well Lit' | 'Moderate' | 'Dark';
  crowdLevel: 'High' | 'Moderate' | 'Deserted';
  note: string;
}

export interface SafeHaven {
  name: string;
  type: 'police' | 'pharmacy' | 'transit' | 'cafe' | 'cctv';
  distance: string;
  address: string;
  isOpen24Hours: boolean;
}

export interface NavigationRoute {
  id: string;
  name: string;
  tagline: string;
  isAiRecommended: boolean;
  distanceKm: number;
  estimatedMinutes: number;
  overallScore: number; // 0 - 100 (weighted by user priorities)
  baseSafetyScore: number;
  safetyTier: 'SAFE' | 'MODERATE' | 'CAUTION';
  timeContext: 'daylight' | 'afternoon' | 'after_dark' | 'late_night';
  breakdown: RouteBreakdown;
  metrics: RouteMetrics;
  waypoints: RouteWaypoint[];
  safeHavens: SafeHaven[];
  coordinates?: RouteCoordinate[];
  highlights: string[];
  risks: string[];
  aiReasoning: string;
}

export interface LiveLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  addressName?: string;
  isSharing: boolean;
  lastBroadcastTime: string;
  batteryLevel?: number;
  trackingId: string;
}

export interface CustomRoutePredictInput {
  routeName: string;
  origin: string;
  destination: string;
  timeOfDay: 'afternoon' | 'evening_rush' | 'after_dark' | 'late_night';
  travelMode: 'walk' | 'bus_walk' | 'rickshaw_auto' | 'cab';
  lightingLevel: number; // 1 (pitch black) to 10 (fully illuminated LED)
  crowdDensity: number; // 1 (deserted/isolated) to 10 (bustling crowds)
  transitProximityMeters: number; // 50m to 2000m
  recentCrimeReports: number; // 0 to 10 scale
  cctvAndOpenVisibility: number; // 1 to 10
  isolatedAlleywayMeters: number; // 0 to 800m
}

export interface CustomPredictResult {
  predictedScore: number;
  safetyTier: 'SAFE' | 'MODERATE' | 'CAUTION';
  breakdown: RouteBreakdown;
  priorityWeightedScore: number;
  keyVulnerabilities: string[];
  safetyEnhancements: string[];
  recommendationDecision: 'Recommended Route' | 'Alternative Suggested' | 'Do Not Travel Alone After Dark';
  aiVerdict: string;
}
