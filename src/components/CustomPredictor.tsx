import React, { useState } from 'react';
import { Sparkles, Sliders, Shield, Sun, Users, Bus, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { PriorityPreferences, CustomPredictResult } from '../types';

interface CustomPredictorProps {
  priorities: PriorityPreferences;
}

export const CustomPredictor: React.FC<CustomPredictorProps> = ({ priorities }) => {
  const [routeName, setRouteName] = useState('Daily Transit Corridor');
  const [origin, setOrigin] = useState('Campus Library Gate');
  const [destination, setDestination] = useState('Greenwood Metro');
  const [timeOfDay, setTimeOfDay] = useState<'afternoon' | 'evening_rush' | 'after_dark' | 'late_night'>('after_dark');
  const [travelMode, setTravelMode] = useState<'walk' | 'bus_walk' | 'rickshaw_auto' | 'cab'>('walk');

  // Interactive Parameter Sliders
  const [lightingLevel, setLightingLevel] = useState<number>(6); // 1-10
  const [crowdDensity, setCrowdDensity] = useState<number>(5); // 1-10
  const [transitProximityMeters, setTransitProximityMeters] = useState<number>(200);
  const [recentCrimeReports, setRecentCrimeReports] = useState<number>(1); // 0-10
  const [cctvAndOpenVisibility, setCctvAndOpenVisibility] = useState<number>(6); // 1-10
  const [isolatedAlleywayMeters, setIsolatedAlleywayMeters] = useState<number>(60); // 0-500m

  const [isLoading, setIsLoading] = useState(false);
  const [prediction, setPrediction] = useState<CustomPredictResult | null>(null);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/routes/predict-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeName,
          origin,
          destination,
          timeOfDay,
          travelMode,
          lightingLevel,
          crowdDensity,
          transitProximityMeters,
          recentCrimeReports,
          cctvAndOpenVisibility,
          isolatedAlleywayMeters,
          priorities,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPrediction(data);
      }
    } catch (err) {
      console.error('Error fetching custom prediction:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTierColor = (tier: 'SAFE' | 'MODERATE' | 'CAUTION') => {
    switch (tier) {
      case 'SAFE':
        return {
          text: 'text-[#388568]',
          bg: 'bg-[#388568]/10',
          border: 'border-[#388568]/30',
        };
      case 'MODERATE':
        return {
          text: 'text-[#C88724]',
          bg: 'bg-[#C88724]/10',
          border: 'border-[#C88724]/30',
        };
      case 'CAUTION':
      default:
        return {
          text: 'text-[#D83B52]',
          bg: 'bg-[#D83B52]/10',
          border: 'border-[#D83B52]/30',
        };
    }
  };

  const tierStyle = prediction ? getTierColor(prediction.safetyTier) : null;

  return (
    <div className="card-blush-glass p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE7ED] flex items-center justify-center text-[#E94F83]">
              <Sliders className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#34232D]">
              Predict Route Safety Score From Custom Inputs
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1 max-w-xl leading-relaxed">
            Specify fine-grained street conditions (lighting lumens, pedestrian flow, transit proximity, and crime records) to test how our machine learning engine rates your daily commute.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handlePredict()}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all disabled:opacity-50 shrink-0 self-start sm:self-center cursor-pointer"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          <span>{isLoading ? 'Computing ML Score...' : 'Predict Route Score'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input Sliders */}
        <div className="lg:col-span-7 space-y-5">
          {/* Origin, Destination & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#866F7A] mb-1">
                Origin Point
              </label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFAF7] border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:bg-white focus:outline-none focus:border-[#E94F83]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#866F7A] mb-1">
                Destination
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-[#FFFAF7] border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:bg-white focus:outline-none focus:border-[#E94F83]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#866F7A] mb-1">
                Time of Day
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FFFAF7] border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:bg-white focus:outline-none focus:border-[#E94F83]"
              >
                <option value="afternoon">Afternoon (Daylight)</option>
                <option value="evening_rush">Evening Rush (6:30 PM)</option>
                <option value="after_dark">After Dark (9:30 PM)</option>
                <option value="late_night">Late Night (1:00 AM)</option>
              </select>
            </div>
          </div>

          {/* Interactive ML Parameter Sliders */}
          <div className="space-y-3.5 pt-1">
            {/* 1. Street Lighting */}
            <div className="p-3.5 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#C88724]" />
                  Street Lighting Quality:
                  <span className="text-[#866F7A] font-normal">
                    {lightingLevel <= 3 ? 'Dim or broken lamps' : lightingLevel <= 7 ? 'Moderate sodium lamps' : 'Bright LED corridor'}
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#C88724] px-2 py-0.5 rounded-full bg-[#C88724]/10 text-xs">
                  {lightingLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={lightingLevel}
                onChange={(e) => setLightingLevel(Number(e.target.value))}
                className="w-full accent-[#E94F83] cursor-pointer"
              />
            </div>

            {/* 2. Crowd Density */}
            <div className="p-3.5 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#E94F83]" />
                  Crowd Density & Open Stores:
                  <span className="text-[#866F7A] font-normal">
                    {crowdDensity <= 2 ? 'Deserted street' : crowdDensity <= 6 ? 'Casual pedestrians' : 'Bustling market/crowds'}
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#E94F83] px-2 py-0.5 rounded-full bg-[#E94F83]/10 text-xs">
                  {crowdDensity} / 10
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={crowdDensity}
                onChange={(e) => setCrowdDensity(Number(e.target.value))}
                className="w-full accent-[#E94F83] cursor-pointer"
              />
            </div>

            {/* 3. Distance to Nearest Public Transit */}
            <div className="p-3.5 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                  <Bus className="w-3.5 h-3.5 text-[#388568]" />
                  Distance to Nearest Transit:
                  <span className="text-[#866F7A] font-normal">
                    {transitProximityMeters <= 100 ? 'Directly at station' : transitProximityMeters <= 400 ? 'Short 3-5 min walk' : 'Far from transit (>8 mins)'}
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#388568] px-2 py-0.5 rounded-full bg-[#388568]/10 text-xs">
                  {transitProximityMeters}m
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="50"
                value={transitProximityMeters}
                onChange={(e) => setTransitProximityMeters(Number(e.target.value))}
                className="w-full accent-[#E94F83] cursor-pointer"
              />
            </div>

            {/* 4. Recent Crime History Reports */}
            <div className="p-3.5 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#D83B52]" />
                  Past Crime Reports (past 6 mo):
                  <span className="text-[#866F7A] font-normal">
                    {recentCrimeReports === 0 ? 'Zero records' : recentCrimeReports <= 2 ? 'Isolated incident' : 'Multiple reports'}
                  </span>
                </span>
                <span className="font-bold tabular-nums text-[#D83B52] px-2 py-0.5 rounded-full bg-[#D83B52]/10 text-xs">
                  {recentCrimeReports}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={recentCrimeReports}
                onChange={(e) => setRecentCrimeReports(Number(e.target.value))}
                className="w-full accent-[#E94F83] cursor-pointer"
              />
            </div>

            {/* 5. Isolated Alleyways Length */}
            <div className="p-3.5 bg-[#FFFAF7] rounded-2xl border border-[#F5A5BC]/30 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#34232D] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#C88724]" />
                  Isolated Stretch:
                </span>
                <span className="font-bold tabular-nums text-[#866F7A] px-2 py-0.5 rounded-full bg-[#FFE7ED] text-xs">
                  {isolatedAlleywayMeters}m
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="500"
                step="25"
                value={isolatedAlleywayMeters}
                onChange={(e) => setIsolatedAlleywayMeters(Number(e.target.value))}
                className="w-full accent-[#E94F83] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right: ML Output Card */}
        <div className="lg:col-span-5 flex flex-col">
          {prediction && tierStyle ? (
            <div className="bg-[#FFFAF7] rounded-3xl p-6 border border-[#F5A5BC]/40 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                {/* Result Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#866F7A]">
                      Predicted Safety Score
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#34232D] leading-tight">
                      {prediction.recommendationDecision}
                    </h4>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl border font-bold ${tierStyle.bg} ${tierStyle.border}`}
                  >
                    <Shield className={`w-4 h-4 ${tierStyle.text}`} />
                    <span className={`text-2xl leading-none tabular-nums ${tierStyle.text}`}>{prediction.predictedScore}</span>
                    <span className="text-xs text-[#866F7A]">/100</span>
                  </div>
                </div>

                {/* AI Verdict */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#F5A5BC]/30 text-xs text-[#34232D] leading-relaxed space-y-1">
                  <div className="flex items-center gap-1 text-[#E94F83] font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Safety Analysis</span>
                  </div>
                  <p>{prediction.aiVerdict}</p>
                </div>

                {/* Breakdown Progress Bars */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#F5A5BC]/30 space-y-2 text-xs">
                  <span className="font-semibold text-[#866F7A] block text-[11px] uppercase tracking-wider">Parameter Breakdown</span>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#866F7A]">Lighting</span>
                      <span className="font-bold tabular-nums text-[#34232D]">{prediction.breakdown.lightingScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
                      <div className="h-full bg-[#C88724] rounded-full" style={{ width: `${prediction.breakdown.lightingScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#866F7A]">Crowd & Presence</span>
                      <span className="font-bold tabular-nums text-[#34232D]">{prediction.breakdown.crowdScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
                      <div className="h-full bg-[#E94F83] rounded-full" style={{ width: `${prediction.breakdown.crowdScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#866F7A]">Transit Access</span>
                      <span className="font-bold tabular-nums text-[#34232D]">{prediction.breakdown.transportScore}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
                      <div className="h-full bg-[#388568] rounded-full" style={{ width: `${prediction.breakdown.transportScore}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-[#866F7A]">Crime History Safety</span>
                      <span className="font-bold tabular-nums text-[#34232D]">{prediction.breakdown.crimeHistorySafety}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#FFE7ED] rounded-full overflow-hidden">
                      <div className="h-full bg-[#D83B52] rounded-full" style={{ width: `${prediction.breakdown.crimeHistorySafety}%` }} />
                    </div>
                  </div>
                </div>

                {/* Key Vulnerabilities */}
                {prediction.keyVulnerabilities.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="font-semibold text-[#34232D] text-[11px] flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#C88724]" />
                      Identified Vulnerabilities
                    </span>
                    <ul className="list-disc pl-4 text-[#866F7A] space-y-0.5 text-[11px]">
                      {prediction.keyVulnerabilities.map((v, i) => (
                        <li key={i}>{v}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handlePredict()}
                  className="w-full py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Recalculate with New Sliders
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#FFFAF7] rounded-3xl p-8 border border-dashed border-[#F5A5BC]/50 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FFE7ED] text-[#E94F83] flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-serif text-base font-bold text-[#34232D]">Awaiting Prediction</h4>
                <p className="text-xs text-[#866F7A] leading-relaxed">
                  Adjust the environmental sliders on the left and click "Predict Route Score" to run the Machine Learning safety model.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePredict()}
                className="px-5 py-2.5 rounded-full bg-[#E94F83] text-white text-xs font-semibold shadow-xs hover:bg-[#d83c70] transition-colors cursor-pointer"
              >
                Run ML Prediction Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
