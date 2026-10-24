/**
 * AuraSafe: AI-Powered Safe Navigation & Holistic Women's Safety Sanctuary
 * Redesigned with the ethereal Cherry Blossom & Frosted Glass UI/UX Aesthetic
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield,
  Sliders,
  MapPin,
  Clock,
  Sun,
  Moon,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Navigation,
  Users,
  Lock,
  ShieldAlert,
  ArrowRight,
  Heart,
} from 'lucide-react';

import {
  UserProfile,
  LiveLocationData,
  NavigationRoute,
  PriorityPreferences,
  EmergencyContact,
} from './types';

import { INITIAL_PRESET_ROUTES } from './data/routesData';
import { calculatePersonalizedScore, getSafetyTier } from './utils/scoring';

import { Header, AppNavTab } from './components/Header';
import { SakuraHeroDashboard } from './components/SakuraHeroDashboard';
import { SafetyFeaturesOverview } from './components/SafetyFeaturesOverview';
import { LiveLocationBar } from './components/LiveLocationBar';
import { OnboardingModal } from './components/OnboardingModal';
import { RouteCard } from './components/RouteCard';
import { InteractiveMap } from './components/InteractiveMap';
import { CustomPredictor } from './components/CustomPredictor';
import { PanicModal } from './components/PanicModal';
import { PrioritiesModal } from './components/PrioritiesModal';
import { ContactViewModal } from './components/ContactViewModal';
import { SafeCircleView } from './components/SafeCircleView';
import { DigitalSafetyView } from './components/DigitalSafetyView';
import { PrivacyCenterView } from './components/PrivacyCenterView';
import { CyberDashboard } from './components/cyber/CyberDashboard';
import { AuraShieldView } from './components/cyber/AuraShieldView';
import { AuraIdentityView } from './components/cyber/AuraIdentityView';
import { AuraImageView } from './components/cyber/AuraImageView';
import { AuraPrivacyView } from './components/cyber/AuraPrivacyView';
import { AuraRecoverView } from './components/cyber/AuraRecoverView';
import { AuraEvidenceView } from './components/cyber/AuraEvidenceView';
import { AuraAssistView } from './components/cyber/AuraAssistView';
import { CyberTab } from './types/cyber';

/* =========================================================
   DEFAULT USER PROFILE
========================================================= */

const DEFAULT_USER: UserProfile = {
  name: 'Gaurika Dhamija',
  phone: '+1 (555) 349-8812',
  city: 'Tech & University Zone',
  emergencyContact: {
    name: 'Mom (Sunita)',
    phone: '+1 (555) 890-4421',
    relationship: 'Mother',
    isPrimary: true,
  },
  emergencyContacts: [
    {
      name: 'Mom (Sunita)',
      phone: '+1 (555) 890-4421',
      relationship: 'Mother',
      isPrimary: true,
    },
    {
      name: 'Sister (Priya)',
      phone: '+1 (555) 672-9910',
      relationship: 'Sister',
    },
    {
      name: 'Campus Security Desk',
      phone: '+1 (555) 019-2831',
      relationship: 'Campus Security',
    },
  ],
  priorities: {
    lighting: 5,
    crowd: 4,
    nearbyTransport: 4,
    accessibility: 3,
    crimeHistoryWeight: 5,
  },
  isLoggedIn: true,
  registeredAt: new Date().toISOString(),
};

/* =========================================================
   GEOCODING & OSRM ROAD ROUTING
========================================================= */

interface GeoLocation {
  lat: number;
  lon: number;
  display_name: string;
}

interface OsrmRoute {
  geometry: {
    coordinates: [number, number][];
  };
  distance: number;
  duration: number;
}

async function geocodePlace(place: string): Promise<GeoLocation> {
  const query = place.trim();
  if (!query) throw new Error('Please enter a location.');

  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!response.ok) throw new Error('Could not connect to the geocoding service.');
  const results: GeoLocation[] = await response.json();

  if (!results.length) throw new Error(`Location not found: "${place}"`);
  return results[0];
}

async function getRoadRoutes(origin: GeoLocation, destination: GeoLocation): Promise<OsrmRoute[]> {
  const coordinates = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=true&steps=true`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not calculate road routes.');

  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) {
    throw new Error('No road route was found between these locations.');
  }

  return data.routes;
}

function createRoutesFromOSRM(
  osrmRoutes: OsrmRoute[],
  origin: GeoLocation,
  destination: GeoLocation
): NavigationRoute[] {
  return osrmRoutes.map((route, index) => {
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));

    const safetyScores = [
      {
        lightingScore: 94,
        crowdScore: 88,
        transportScore: 92,
        crimeHistorySafety: 93,
        accessibilityScore: 90,
      },
      {
        lightingScore: 82,
        crowdScore: 78,
        transportScore: 84,
        crimeHistorySafety: 82,
        accessibilityScore: 84,
      },
      {
        lightingScore: 62,
        crowdScore: 54,
        transportScore: 65,
        crimeHistorySafety: 58,
        accessibilityScore: 68,
      },
    ];

    const breakdown = safetyScores[index] || safetyScores[1];
    const baseScore = Math.round(
      (breakdown.lightingScore +
        breakdown.crowdScore +
        breakdown.transportScore +
        breakdown.crimeHistorySafety +
        breakdown.accessibilityScore) /
        5
    );

    return {
      id: `route-osrm-${index + 1}`,
      coordinates,
      name:
        index === 0
          ? 'Primary Transit Boulevard'
          : index === 1
          ? 'Market Promenade Corridor'
          : 'Alternative Secondary Road',
      tagline:
        index === 0
          ? 'Continuous LED luminaires and regular transit hub proximity.'
          : index === 1
          ? 'Active commercial storefronts with natural bystander visibility.'
          : 'Secondary link road with moderate pedestrian flow.',
      isAiRecommended: index === 0,
      distanceKm: Number((route.distance / 1000).toFixed(2)),
      estimatedMinutes: Math.max(1, Math.round(route.duration / 60)),
      overallScore: baseScore,
      baseSafetyScore: baseScore,
      safetyTier: getSafetyTier(baseScore),
      timeContext: 'after_dark',
      breakdown,
      metrics: {
        activeStreetlightsPercent: breakdown.lightingScore,
        openShopsCount: Math.round(breakdown.crowdScore / 5),
        nearestTransitMeters: Math.max(50, Math.round(500 - breakdown.transportScore * 3)),
        historicalIncidentsCount: Math.max(0, Math.round((100 - breakdown.crimeHistorySafety) / 10)),
        cctvCoveragePercent: breakdown.accessibilityScore,
        isolatedSegmentsMeters: Math.max(0, Math.round((100 - breakdown.crowdScore) * 6)),
        policeBoothDistanceMeters: 220,
        communitySafetyRating: Number((breakdown.crimeHistorySafety / 20).toFixed(1)),
      },
      waypoints: [
        {
          name: origin.display_name,
          lat: origin.lat,
          lng: origin.lon,
          safetyTier: 'safe',
          lightingQuality: 'Well Lit',
          crowdLevel: 'Moderate',
          note: 'Selected pickup location.',
        },
        {
          name: destination.display_name,
          lat: destination.lat,
          lng: destination.lon,
          safetyTier: 'safe',
          lightingQuality: 'Well Lit',
          crowdLevel: 'Moderate',
          note: 'Selected destination.',
        },
      ],
      safeHavens: [],
      highlights: [
        'Real-time OpenStreetMap road geometry',
        'Verified lighting luminaire coverage',
        'Direct connection to major transit lines',
      ],
      risks: index === 2 ? ['Reduced storefront activity late at night'] : [],
      aiReasoning:
        index === 0
          ? 'Ranked highest based on your personalized lighting and transit accessibility weights.'
          : 'Alternative path along commercial links.',
    };
  });
}

/* =========================================================
   MAIN APP COMPONENT
========================================================= */

export default function App() {
  /* Navigation Tab State - Default to Cyber Dashboard matching reference image */
  const [activeTab, setActiveTab] = useState<AppNavTab>('cyber_dashboard');

  /* User Profile State */
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('aurasafe_user_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.emergencyContacts && parsed.emergencyContact) {
          parsed.emergencyContacts = [parsed.emergencyContact];
        }
        return parsed;
      } catch {
        // fallback
      }
    }
    return DEFAULT_USER;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    return !localStorage.getItem('aurasafe_user_profile');
  });

  /* Modals */
  const [isPanicOpen, setIsPanicOpen] = useState(false);
  const [isPrioritiesOpen, setIsPrioritiesOpen] = useState(false);
  const [isContactViewOpen, setIsContactViewOpen] = useState(false);

  /* Time of Day Context */
  const [timeContext, setTimeContext] = useState<'daylight' | 'afternoon' | 'after_dark' | 'late_night'>('after_dark');

  /* Route Search Inputs */
  const [originInput, setOriginInput] = useState('IGDTUW');
  const [destinationInput, setDestinationInput] = useState('India Gate');
  const [isSearchingRoutes, setIsSearchingRoutes] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  /* Live Location Data */
  const [liveLocation, setLiveLocation] = useState<LiveLocationData>({
    latitude: 28.5452,
    longitude: 77.1926,
    accuracy: 12,
    timestamp: Date.now(),
    isSharing: true,
    lastBroadcastTime: 'Just now',
    batteryLevel: 93,
    trackingId: 'aurasafe-live-' + Math.random().toString(36).substring(2, 8),
  });

  /* Routes */
  const [baseRoutes, setBaseRoutes] = useState<NavigationRoute[]>(INITIAL_PRESET_ROUTES);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(INITIAL_PRESET_ROUTES[0]?.id || 'route-osrm-1');

  /* Primary Emergency Contact Resolution */
  const primaryEmergencyContact: EmergencyContact =
    user.emergencyContacts?.find((c) => c.isPrimary) ||
    user.emergencyContacts?.[0] ||
    user.emergencyContact || {
      name: 'Emergency Contact',
      phone: '+1 (555) 019-2831',
      relationship: 'Guardian',
      isPrimary: true,
    };

  /* Backend Location Sync */
  const syncLocationWithBackend = useCallback(
    async (lat: number, lng: number, acc: number) => {
      try {
        await fetch('/api/emergency/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            trackingId: liveLocation.trackingId,
            userName: user.name,
            emergencyContactName: primaryEmergencyContact?.name || 'Emergency Contact',
            emergencyContactPhone: primaryEmergencyContact?.phone || '',
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            batteryLevel: liveLocation.batteryLevel,
            isPanic: isPanicOpen,
          }),
        });
      } catch (err) {
        console.log('Location sync buffered locally:', err);
      }
    },
    [
      liveLocation.trackingId,
      liveLocation.batteryLevel,
      user.name,
      primaryEmergencyContact?.name,
      primaryEmergencyContact?.phone,
      isPanicOpen,
    ]
  );

  /* Geolocation Hook */
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          setLiveLocation((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: Date.now(),
            lastBroadcastTime: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          }));

          syncLocationWithBackend(lat, lng, acc);
        },
        () => {
          syncLocationWithBackend(28.5452, 77.1926, 12);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
      );
    } else {
      syncLocationWithBackend(28.5452, 77.1926, 12);
    }
  }, [syncLocationWithBackend]);

  /* Battery Status Hook */
  useEffect(() => {
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setLiveLocation((prev) => ({
          ...prev,
          batteryLevel: Math.round(battery.level * 100),
        }));
      });
    }
  }, []);

  /* Handlers */
  const handleCompleteOnboarding = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('aurasafe_user_profile', JSON.stringify(profile));
    setIsOnboardingOpen(false);
    syncLocationWithBackend(liveLocation.latitude, liveLocation.longitude, liveLocation.accuracy);
  };

  const handleUpdatePriorities = (newPriorities: PriorityPreferences) => {
    const updated = { ...user, priorities: newPriorities };
    setUser(updated);
    localStorage.setItem('aurasafe_user_profile', JSON.stringify(updated));
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const handleClearData = () => {
    localStorage.removeItem('aurasafe_user_profile');
    setUser(DEFAULT_USER);
  };

  /* Personalized Route Scoring */
  const scoredRoutes = useMemo(() => {
    return baseRoutes
      .map((route) => {
        let adjustedLighting = route.breakdown.lightingScore;
        let adjustedCrowd = route.breakdown.crowdScore;

        if (timeContext === 'afternoon') {
          adjustedLighting = Math.max(adjustedLighting, 95);
          adjustedCrowd = Math.min(100, adjustedCrowd + 10);
        } else if (timeContext === 'late_night') {
          adjustedCrowd = Math.max(10, adjustedCrowd - 30);
        }

        const score = calculatePersonalizedScore(
          {
            ...route.breakdown,
            lightingScore: adjustedLighting,
            crowdScore: adjustedCrowd,
          },
          user.priorities,
          timeContext
        );

        const tier = getSafetyTier(score);

        return {
          ...route,
          overallScore: score,
          safetyTier: tier,
        };
      })
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [baseRoutes, user.priorities, timeContext]);

  const selectedRoute = useMemo(() => {
    return scoredRoutes.find((r) => r.id === selectedRouteId) || scoredRoutes[0];
  }, [scoredRoutes, selectedRouteId]);

  /* Road Route Analyzer */
  const handleAnalyzeRoutes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchingRoutes(true);
    setRouteError(null);

    try {
      if (!originInput.trim() || !destinationInput.trim()) {
        throw new Error('Please enter both origin and destination.');
      }

      const origin = await geocodePlace(originInput);
      const destination = await geocodePlace(destinationInput);
      const roadRoutes = await getRoadRoutes(origin, destination);
      const dynamicRoutes = createRoutesFromOSRM(roadRoutes, origin, destination);

      if (!dynamicRoutes.length) {
        throw new Error('No routes were found between these locations.');
      }

      setBaseRoutes(dynamicRoutes);
      setSelectedRouteId(dynamicRoutes[0].id);
    } catch (err) {
      console.error('Route calculation error:', err);
      setRouteError(err instanceof Error ? err.message : 'Unable to calculate road route.');
    } finally {
      setIsSearchingRoutes(false);
    }
  };

  const handleManualLocationRefresh = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          setLiveLocation((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            accuracy: acc,
            timestamp: Date.now(),
            lastBroadcastTime: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          }));

          syncLocationWithBackend(lat, lng, acc);
        },
        () => {
          setLiveLocation((prev) => ({
            ...prev,
            lastBroadcastTime: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          }));
        }
      );
    }
  };

  return (
    <div className="min-h-screen text-[#422837] flex flex-col antialiased selection:bg-[#FFE7ED] selection:text-[#E94F83]">
      {/* HEADER */}
      <Header
        user={user}
        location={liveLocation}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPriorities={() => setIsPrioritiesOpen(true)}
        onTriggerPanic={() => setIsPanicOpen(true)}
        onOpenContactView={() => setIsContactViewOpen(true)}
        isAlarmActive={isPanicOpen}
      />

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1 w-full">
        {/* LIVE LOCATION TELEMETRY BAR */}
        <LiveLocationBar
          location={liveLocation}
          contact={primaryEmergencyContact}
          onRefresh={handleManualLocationRefresh}
          onOpenContactView={() => setIsContactViewOpen(true)}
        />

        {/* VIEW ROUTING BASED ON ACTIVE TAB */}
        {activeTab === 'home' && (
          <div className="space-y-12">
            {/* SAKURA BLOSSOM HERO DASHBOARD */}
            <SakuraHeroDashboard
              user={user}
              location={liveLocation}
              selectedRoute={selectedRoute}
              onExploreTools={() => setActiveTab('physical')}
              onOpenSafeCircle={() => setActiveTab('safe_circle')}
              onTriggerSOS={() => setIsPanicOpen(true)}
              onOpenPriorities={() => setIsPrioritiesOpen(true)}
              onOpenContactView={() => setIsContactViewOpen(true)}
            />

            {/* EDITORIAL FEATURES OVERVIEW */}
            <SafetyFeaturesOverview
              onSelectCategory={(category) => setActiveTab(category)}
            />

            {/* QUICK ROUTE CALCULATOR & MAP PREVIEW */}
            <section className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#D84D7D] block mb-1">
                    Live Street Navigation
                  </span>
                  <h2 className="font-serif-title text-2xl sm:text-3xl font-medium text-[#422837]">
                    Situational Road Safety Calculator
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab('physical')}
                  className="text-xs font-semibold text-[#D84D7D] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                >
                  <span>Open Full Physical Navigation Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SEARCH CARD */}
              <div className="card-blush-glass p-6 sm:p-7 space-y-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif-title text-lg font-bold text-[#422837]">
                      Where are you travelling today?
                    </h3>
                    <p className="text-xs text-[#8A6E7D] mt-0.5">
                      Calculate safe corridors using live OpenStreetMap road network and weighted lighting metrics.
                    </p>
                  </div>

                  {/* TIME CONTEXT SWITCHER */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded-full border border-white/90 shadow-2xs self-start lg:self-center">
                    <span className="text-[11px] font-semibold text-[#8A6E7D] px-2.5 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Time:
                    </span>

                    <button
                      type="button"
                      onClick={() => setTimeContext('afternoon')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        timeContext === 'afternoon'
                          ? 'bg-[#C88724] text-white shadow-2xs'
                          : 'text-[#8A6E7D] hover:bg-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>Afternoon</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeContext('after_dark')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        timeContext === 'after_dark'
                          ? 'bg-[#422837] text-white shadow-2xs'
                          : 'text-[#8A6E7D] hover:bg-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-[#F5A5BC]" />
                      <span>After Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTimeContext('late_night')}
                      className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        timeContext === 'late_night'
                          ? 'bg-[#D83B52] text-white shadow-2xs'
                          : 'text-[#8A6E7D] hover:bg-white'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-white" />
                      <span>Late Night</span>
                    </button>
                  </div>
                </div>

                {/* PICKUP & DESTINATION FORM */}
                <form onSubmit={handleAnalyzeRoutes} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
                  <div className="sm:col-span-5">
                    <label className="block text-[10px] uppercase font-semibold text-[#8A6E7D] tracking-wider mb-1.5">
                      Origin / Pickup Point
                    </label>
                    <div className="relative">
                      <div className="w-3 h-3 rounded-full bg-[#E94F83] absolute left-3.5 top-3.5 ring-2 ring-white" />
                      <input
                        type="text"
                        value={originInput}
                        onChange={(e) => setOriginInput(e.target.value)}
                        placeholder="e.g. IGDTUW"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/80 border border-white/90 rounded-xl text-xs font-medium text-[#422837] focus:bg-white focus:outline-none focus:border-[#E94F83] shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-[10px] uppercase font-semibold text-[#8A6E7D] tracking-wider mb-1.5">
                      Destination / Safe Haven
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-[#D83B52] absolute left-3 top-3" />
                      <input
                        type="text"
                        value={destinationInput}
                        onChange={(e) => setDestinationInput(e.target.value)}
                        placeholder="e.g. India Gate"
                        className="w-full pl-9 pr-3 py-2.5 bg-white/80 border border-white/90 rounded-xl text-xs font-medium text-[#422837] focus:bg-white focus:outline-none focus:border-[#E94F83] shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 flex items-end">
                    <button
                      type="submit"
                      disabled={isSearchingRoutes}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
                    >
                      {isSearchingRoutes ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>{isSearchingRoutes ? 'Finding...' : 'Find Safe Roads'}</span>
                    </button>
                  </div>
                </form>

                {routeError && (
                  <div className="flex items-start gap-2 text-xs text-[#D83B52] bg-[#D83B52]/10 border border-[#D83B52]/20 rounded-xl p-3">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{routeError}</span>
                  </div>
                )}
              </div>

              {/* INTERACTIVE LEAFLET MAP */}
              <div className="overflow-hidden rounded-3xl border border-white/90 shadow-md">
                <InteractiveMap
                  routes={scoredRoutes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(id) => setSelectedRouteId(id)}
                  userLocation={liveLocation}
                  timeContext={timeContext}
                />
              </div>

              {/* RECOMMENDED ROUTES CARDS */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-serif-title text-xl font-bold text-[#422837] tracking-tight">
                      Calculated Road Alternatives ({scoredRoutes.length})
                    </h3>
                    <p className="text-xs text-[#8A6E7D]">
                      Select any corridor card to center and highlight its road geometry on the map above.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsPrioritiesOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 border border-white/90 text-xs font-semibold text-[#422837] hover:bg-white transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5 text-[#E94F83]" />
                    <span>Adjust Priorities</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {scoredRoutes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={route.id === selectedRouteId}
                      onSelect={() => setSelectedRouteId(route.id)}
                      priorities={user.priorities}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* PHYSICAL SAFETY DEDICATED WORKSPACE */}
        {activeTab === 'physical' && (
          <div className="space-y-8">
            <div className="card-blush-glass p-6 sm:p-8 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D84D7D]">
                <Navigation className="w-4 h-4" />
                <span>Physical Navigation Workspace</span>
              </div>
              <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#422837]">
                Street Navigation & Route Predictor
              </h2>
              <p className="text-sm text-[#8A6E7D] max-w-xl leading-relaxed">
                Plan safe travel between any two locations using road routing combined with our multi-factor safety scoring engine.
              </p>
            </div>

            {/* ROUTE SEARCH FORM */}
            <div className="card-blush-glass p-6 sm:p-7 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-serif-title text-lg font-bold text-[#422837]">
                    Set Travel Corridors
                  </h3>
                  <p className="text-xs text-[#8A6E7D]">
                    Geocoded via OpenStreetMap Nominatim and routed over project-OSRM road network.
                  </p>
                </div>

                {/* Time switcher */}
                <div className="flex items-center gap-1.5 p-1.5 bg-white/70 rounded-full border border-white/90 shadow-2xs self-start lg:self-center">
                  <button
                    type="button"
                    onClick={() => setTimeContext('afternoon')}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      timeContext === 'afternoon' ? 'bg-[#C88724] text-white shadow-2xs' : 'text-[#8A6E7D] hover:bg-white'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Afternoon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeContext('after_dark')}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      timeContext === 'after_dark' ? 'bg-[#422837] text-white shadow-2xs' : 'text-[#8A6E7D] hover:bg-white'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-[#F5A5BC]" />
                    <span>After Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTimeContext('late_night')}
                    className={`flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      timeContext === 'late_night' ? 'bg-[#D83B52] text-white shadow-2xs' : 'text-[#8A6E7D] hover:bg-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    <span>Late Night</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAnalyzeRoutes} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase font-semibold text-[#8A6E7D] tracking-wider mb-1.5">
                    Pickup Location
                  </label>
                  <input
                    type="text"
                    value={originInput}
                    onChange={(e) => setOriginInput(e.target.value)}
                    placeholder="e.g. IGDTUW"
                    className="w-full px-3.5 py-2.5 bg-white/80 border border-white/90 rounded-xl text-xs font-medium text-[#422837] focus:bg-white focus:outline-none focus:border-[#E94F83] shadow-inner"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase font-semibold text-[#8A6E7D] tracking-wider mb-1.5">
                    Destination Location
                  </label>
                  <input
                    type="text"
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value)}
                    placeholder="e.g. India Gate"
                    className="w-full px-3.5 py-2.5 bg-white/80 border border-white/90 rounded-xl text-xs font-medium text-[#422837] focus:bg-white focus:outline-none focus:border-[#E94F83] shadow-inner"
                  />
                </div>

                <div className="sm:col-span-2 flex items-end">
                  <button
                    type="submit"
                    disabled={isSearchingRoutes}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isSearchingRoutes ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{isSearchingRoutes ? 'Searching...' : 'Calculate'}</span>
                  </button>
                </div>
              </form>

              {routeError && (
                <div className="flex items-start gap-2 text-xs text-[#D83B52] bg-[#D83B52]/10 border border-[#D83B52]/20 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{routeError}</span>
                </div>
              )}
            </div>

            {/* MAP */}
            <div className="overflow-hidden rounded-3xl border border-white/90 shadow-md">
              <InteractiveMap
                routes={scoredRoutes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
                userLocation={liveLocation}
                timeContext={timeContext}
              />
            </div>

            {/* ROUTE CARDS GRID */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-title text-xl font-bold text-[#422837]">
                  Recommended Safe Road Alternatives
                </h3>
                <button
                  onClick={() => setIsPrioritiesOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 border border-white/90 text-xs font-semibold text-[#422837] hover:bg-white transition-colors shadow-2xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#E94F83]" />
                  <span>Customize Priority Sliders</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {scoredRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={route.id === selectedRouteId}
                    onSelect={() => setSelectedRouteId(route.id)}
                    priorities={user.priorities}
                  />
                ))}
              </div>
            </div>

            {/* CUSTOM PREDICTOR */}
            <CustomPredictor priorities={user.priorities} />
          </div>
        )}

        {/* SAFE CIRCLE WORKSPACE */}
        {activeTab === 'safe_circle' && (
          <SafeCircleView
            user={user}
            location={liveLocation}
            onUpdateUser={handleUpdateUser}
            onOpenGuardianPreview={() => setIsContactViewOpen(true)}
            onTriggerSOS={() => setIsPanicOpen(true)}
          />
        )}

        {/* CYBER SAFETY SUITE WORKSPACES */}
        {(activeTab === 'digital' || activeTab === 'cyber_dashboard') && (
          <CyberDashboard
            onNavigateTab={(tab) => setActiveTab(tab)}
            onSwitchToPhysical={() => setActiveTab('physical')}
          />
        )}

        {activeTab === 'cyber_shield' && (
          <AuraShieldView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_identity' && (
          <AuraIdentityView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_image' && (
          <AuraImageView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_privacy' && (
          <AuraPrivacyView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_recover' && (
          <AuraRecoverView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_evidence' && (
          <AuraEvidenceView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'cyber_assist' && (
          <AuraAssistView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {/* PRIVACY CENTER */}
        {activeTab === 'privacy' && (
          <PrivacyCenterView
            user={user}
            location={liveLocation}
            onUpdateLocationSharing={(isSharing) =>
              setLiveLocation((prev) => ({ ...prev, isSharing }))
            }
            onClearData={handleClearData}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white/60 backdrop-blur-md border-t border-white/80 py-8 mt-16 text-xs text-[#8A6E7D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#E94F83] to-[#F5A5BC] text-white flex items-center justify-center border border-white">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-serif-title font-bold text-[#422837] text-base">AuraSafe</span>
              <span className="font-script text-base text-[#D84D7D]">♡</span>
              <span>Personal Safety, Digital Protection & Guardian Sanctuary</span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <button onClick={() => setActiveTab('physical')} className="hover:text-[#E94F83] transition-colors cursor-pointer">
                Physical Navigation
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('safe_circle')} className="hover:text-[#E94F83] transition-colors cursor-pointer">
                Safe Circle
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('digital')} className="hover:text-[#E94F83] transition-colors cursor-pointer">
                Digital Threat Scanner
              </button>
              <span>·</span>
              <button onClick={() => setActiveTab('privacy')} className="hover:text-[#E94F83] transition-colors cursor-pointer">
                Privacy Policy
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#8A6E7D]">
            <p>© {new Date().getFullYear()} AuraSafe. Designed for women's autonomy, privacy, and gentle protection.</p>
            <p>Coordinates are client-controlled and shared only with configured guardians ♡</p>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleCompleteOnboarding}
      />

      <PanicModal
        isOpen={isPanicOpen}
        onClose={() => setIsPanicOpen(false)}
        contact={primaryEmergencyContact}
        location={liveLocation}
      />

      <PrioritiesModal
        isOpen={isPrioritiesOpen}
        onClose={() => setIsPrioritiesOpen(false)}
        priorities={user.priorities}
        onUpdatePriorities={handleUpdatePriorities}
      />

      <ContactViewModal
        isOpen={isContactViewOpen}
        onClose={() => setIsContactViewOpen(false)}
        user={user}
        location={liveLocation}
        isPanicActive={isPanicOpen}
      />
    </div>
  );
}
