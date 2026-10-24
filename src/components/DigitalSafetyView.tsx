import React, { useState } from 'react';
import { ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, ArrowRight, Copy, Check, FileText, Lock, RefreshCw } from 'lucide-react';

interface AnalysisResult {
  threatLevel: 'LOW' | 'MODERATE' | 'HIGH';
  category: string;
  summary: string;
  riskIndicators: string[];
  recommendedSteps: string[];
  uncertaintyDisclaimer: string;
}

export const DigitalSafetyView: React.FC = () => {
  const [content, setContent] = useState('');
  const [context, setContext] = useState('general_message');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick test sample snippets
  const sampleSnippets = [
    {
      label: 'Location Intrusion Inquiry',
      context: 'harassment_tracking',
      text: 'Hey Gaurika, saw you walking by the metro station this evening. What time do you usually head home after dark? Are you walking alone?',
    },
    {
      label: 'Urgent Phishing Link',
      context: 'phishing_link',
      text: 'URGENT: Your account access has been restricted due to suspicious login. Verify immediately at http://bit.ly/secure-verify-9921 within 24 hours.',
    },
    {
      label: 'Everyday Group Chat Message',
      context: 'general_message',
      text: 'Hey everyone, tomorrow we are meeting at the campus library at 2 PM to finish the group presentation. Let me know if that works!',
    },
  ];

  const handleAnalyze = async (textToAnalyze?: string, contextCategory?: string) => {
    const text = textToAnalyze || content;
    const cat = contextCategory || context;

    if (!text.trim()) {
      setError('Please provide message text, email content, or a URL to analyze.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/digital-safety/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, context: cat }),
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setResult(data.analysis);
      } else {
        throw new Error(data.error || 'Analysis service temporarily unavailable.');
      }
    } catch (err) {
      console.error('Digital safety analysis error:', err);
      setError(err instanceof Error ? err.message : 'Unable to complete analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!result) return;
    const reportText = `[AuraSafe Digital Safety Report]
Threat Level: ${result.threatLevel}
Category: ${result.category}
Summary: ${result.summary}
Indicators: ${result.riskIndicators.join('; ')}
Recommended Next Steps: ${result.recommendedSteps.join('; ')}`;

    navigator.clipboard?.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getThreatBadge = (level: 'LOW' | 'MODERATE' | 'HIGH') => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-[#D83B52]/10',
          border: 'border-[#D83B52]/30',
          text: 'text-[#D83B52]',
          icon: AlertOctagon,
          label: 'Elevated Threat Detected',
        };
      case 'MODERATE':
        return {
          bg: 'bg-[#C88724]/10',
          border: 'border-[#C88724]/30',
          text: 'text-[#C88724]',
          icon: AlertTriangle,
          label: 'Caution & Verification Advised',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-[#388568]/10',
          border: 'border-[#388568]/30',
          text: 'text-[#388568]',
          icon: CheckCircle2,
          label: 'Low Digital Risk Indicators',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="card-blush-glass p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#D84D7D]">
          <ShieldAlert className="w-4 h-4" />
          <span>Digital Workspace</span>
        </div>
        <h2 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#422837]">
          Digital Safety & Threat Workspace
        </h2>
        <p className="text-sm text-[#8A6E7D] max-w-2xl leading-relaxed">
          Evaluate suspicious direct messages, unfamiliar sender requests, or links before responding. Our system checks for indicators of cyberstalking, location pressure, social engineering, and online harassment.
        </p>

        {/* Quick Sample Selector */}
        <div className="pt-3">
          <span className="text-xs font-medium text-[#8A6E7D] block mb-2">Try a realistic sample scenario:</span>
          <div className="flex flex-wrap gap-2">
            {sampleSnippets.map((snippet, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setContent(snippet.text);
                  setContext(snippet.context);
                  handleAnalyze(snippet.text, snippet.context);
                }}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white/70 hover:bg-white text-[#422837] border border-white/90 shadow-2xs transition-colors cursor-pointer"
              >
                {snippet.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Content Input */}
        <div className="lg:col-span-7 space-y-5">
          <div className="card-blush-glass p-6 space-y-4">
            <div>
              <label htmlFor="digital-safety-input" className="block text-xs font-semibold uppercase tracking-wider text-[#866F7A] mb-1.5">
                Paste message, email excerpt, or URL link
              </label>
              <textarea
                id="digital-safety-input"
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the received text, suspicious message, or DM here..."
                className="w-full p-4 rounded-2xl bg-[#FFFAF7] border border-[#F5A5BC]/40 text-sm text-[#34232D] placeholder-[#866F7A]/60 focus:bg-white focus:outline-none focus:border-[#E94F83] transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label htmlFor="context-category-select" className="block text-xs font-semibold uppercase tracking-wider text-[#866F7A] mb-1.5">
                  Context Category
                </label>
                <select
                  id="context-category-select"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFAF7] border border-[#F5A5BC]/40 text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83]"
                >
                  <option value="general_message">General Direct Message / Text</option>
                  <option value="dating_app">Dating App Interaction</option>
                  <option value="harassment_tracking">Unsolicited Location / Routine Question</option>
                  <option value="phishing_link">Suspicious Link or Verification Demand</option>
                  <option value="coercion">Boundary Pushing or Coercive Language</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => handleAnalyze()}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Indicators...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Content Threat</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-[#D83B52]/10 border border-[#D83B52]/20 text-xs text-[#D83B52] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Practical Next Steps Guide */}
          <div className="card-blush-glass p-6 space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-[#422837] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#E94F83]" />
              <span>Digital Safety Action Guide</span>
            </h3>
            <div className="space-y-3 text-xs text-[#8A6E7D]">
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-[#422837] block mb-0.5 font-semibold">1. Preserve Digital Evidence</strong>
                Capture full screenshots including timestamps, phone numbers, profile handles, and URLs before blocking or deleting threads.
              </div>
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-[#422837] block mb-0.5 font-semibold">2. Never Confirm Routine or Location</strong>
                Avoid replying to casual inquiries about commute paths, daily gym stops, or solo residence status from unverified contacts.
              </div>
              <div className="p-3.5 rounded-2xl bg-white/70 border border-white/90 shadow-2xs">
                <strong className="text-[#422837] block mb-0.5 font-semibold">3. Inform Your Safe Circle</strong>
                If online harassment escalates or includes real-world threats, immediately share logs with your emergency contacts.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Analysis Results or Empty State */}
        <div className="lg:col-span-5 flex flex-col">
          {result ? (
            <div className="card-blush-glass p-6 space-y-5 flex-1 flex flex-col justify-between">
              <div className="space-y-5">
                {/* Threat Level Header */}
                {(() => {
                  const badge = getThreatBadge(result.threatLevel);
                  const Icon = badge.icon;
                  return (
                    <div className="flex items-center justify-between pb-4 border-b border-[#F5A5BC]/20">
                      <div>
                        <span className="text-[11px] font-medium text-[#866F7A] uppercase tracking-wider block">
                          Category: {result.category}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badge.bg} ${badge.border} ${badge.text}`}>
                            <Icon className="w-3.5 h-3.5" />
                            {badge.label}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopySummary}
                        className="flex items-center gap-1 text-xs text-[#866F7A] hover:text-[#34232D] px-2.5 py-1 rounded-lg border border-[#F5A5BC]/30 hover:bg-[#FFE7ED]/40 transition-colors"
                        title="Copy analysis summary to clipboard"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-[#388568]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  );
                })()}

                {/* Summary */}
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#866F7A] uppercase tracking-wider block">
                    Assessment Summary
                  </span>
                  <p className="text-sm text-[#34232D] leading-relaxed font-normal bg-[#FFFAF7] p-3.5 rounded-2xl border border-[#F5A5BC]/30">
                    {result.summary}
                  </p>
                </div>

                {/* Risk Indicators */}
                {result.riskIndicators.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#866F7A] uppercase tracking-wider block">
                      Identified Indicators
                    </span>
                    <ul className="space-y-1.5">
                      {result.riskIndicators.map((ind, i) => (
                        <li key={i} className="text-xs text-[#34232D] flex items-start gap-2 bg-[#FFE7ED]/30 p-2.5 rounded-xl border border-[#F5A5BC]/20">
                          <span className="text-[#E94F83] font-bold">•</span>
                          <span>{ind}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommended Practical Steps */}
                {result.recommendedSteps.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-[#866F7A] uppercase tracking-wider block">
                      Recommended Practical Actions
                    </span>
                    <div className="space-y-1.5">
                      {result.recommendedSteps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-[#34232D]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#388568] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Disclaimer */}
              <div className="pt-4 border-t border-[#F5A5BC]/20 text-[11px] text-[#866F7A] leading-relaxed flex items-start gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 text-[#866F7A] mt-0.5" />
                <span>{result.uncertaintyDisclaimer}</span>
              </div>
            </div>
          ) : (
            <div className="card-blush-glass p-8 flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#FFE7ED] text-[#E94F83] flex items-center justify-center shadow-inner">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div className="max-w-xs space-y-1">
                <h4 className="font-serif-title text-base font-bold text-[#422837]">
                  Awaiting Threat Input
                </h4>
                <p className="text-xs text-[#8A6E7D] leading-relaxed">
                  Enter message content or pick one of the sample scenarios on the left to review threat indicators and safety advice.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
