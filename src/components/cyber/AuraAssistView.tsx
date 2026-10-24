import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  ArrowRight,
  RefreshCw,
  PhoneCall,
  Lock,
  Heart,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  UserX,
  EyeOff,
  LifeBuoy,
  Archive,
} from 'lucide-react';
import { AssistantTriageResult, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

const QUICK_SCENARIOS = [
  {
    tag: 'fake_profile',
    label: 'Someone made a fake profile of me',
    prompt: 'Someone created an unauthorized fake account using my photos and name on Instagram and is messaging my classmates.',
  },
  {
    tag: 'threatening_dm',
    label: 'I received a threatening / stalking DM',
    prompt: 'An anonymous account sent me direct messages asking where I live and describing what I wore at the gym today. I feel unsafe.',
  },
  {
    tag: 'account_hacked',
    label: 'My account was taken over / hacked',
    prompt: 'I was suddenly logged out of my Instagram and email. The recovery email was changed by an unauthorized intruder.',
  },
  {
    tag: 'phishing_link',
    label: 'I clicked a suspicious link / entered info',
    prompt: 'I received an urgent message about an account suspension and clicked the link, entering my password before realizing it looked fake.',
  },
  {
    tag: 'photo_leak',
    label: 'Private photos are being shared / extortion',
    prompt: 'Someone is threatening to share private photos of me with my contacts unless I pay them or do what they want.',
  },
];

const TAB_ICONS: Record<string, any> = {
  cyber_shield: ShieldAlert,
  cyber_identity: UserX,
  cyber_image: EyeOff,
  cyber_recover: LifeBuoy,
  cyber_evidence: Archive,
};

interface AuraAssistViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraAssistView: React.FC<AuraAssistViewProps> = ({ onNavigateTab }) => {
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('general');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [triage, setTriage] = useState<AssistantTriageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunTriage = async (textToAnalyze?: string, tag?: string) => {
    const text = textToAnalyze || description;
    if (!text.trim()) {
      setErrorMsg('Please describe what happened so AuraAssist can provide tailored triage.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);
      const res = await cyberApi.runTriage(text, tag || selectedTag);
      setTriage(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Triage generation failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleScenarioClick = (scenario: typeof QUICK_SCENARIOS[0]) => {
    setDescription(scenario.prompt);
    setSelectedTag(scenario.tag);
    handleRunTriage(scenario.prompt, scenario.tag);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AuraAssist Incident Companion</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Emergency Incident Guidance & Triage
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Trauma-informed, non-judgmental response triage powered by Gemini AI. Get an immediate containment plan in seconds.
          </p>
        </div>
      </div>

      {/* Quick Scenario Buttons */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-[#866F7A] uppercase tracking-wider">
          Quick-Triage Common Incidents
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_SCENARIOS.map((sc) => (
            <button
              key={sc.tag}
              type="button"
              onClick={() => handleScenarioClick(sc)}
              className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-xs font-semibold text-[#34232D] hover:text-[#E94F83] transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Input Form vs Triage Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#866F7A] uppercase tracking-wider mb-2">
                What is happening right now?
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={7}
                placeholder="Describe what occurred in your own words. For example: 'A former partner created an anonymous Instagram profile and is posting private messages' or 'I think my phone was hacked'..."
                className="w-full p-4 bg-white border border-[#F5A5BC]/40 rounded-2xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83] shadow-inner resize-none leading-relaxed"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-[#D83B52]/10 border border-[#D83B52]/30 text-xs text-[#D83B52] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleRunTriage()}
              disabled={isAnalyzing}
              className="w-full py-3 px-5 rounded-2xl bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Supportive Triage Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Incident Response Plan</span>
                </>
              )}
            </button>

            <div className="pt-2 text-[11px] text-[#866F7A] flex items-start gap-2">
              <Heart className="w-4 h-4 text-[#E94F83] shrink-0 mt-0.5" />
              <span>
                You are not alone, and nothing you did caused this harm. We are here to help you regain safety and control.
              </span>
            </div>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-7 space-y-4">
          {triage ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-md border border-white/90 shadow-sm space-y-6">
              {/* Grounding & Reassurance Message */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF4F5] to-[#FFFAF7] border border-[#F5A5BC]/50 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E94F83]">
                  <Heart className="w-4 h-4 fill-[#E94F83]" />
                  <span>AuraAssist Reassurance</span>
                </div>
                <p className="text-xs sm:text-sm text-[#34232D] leading-relaxed italic">
                  "{triage.comfortMessage}"
                </p>
              </div>

              {/* Primary Recommended Action */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      triage.urgency === 'IMMEDIATE'
                        ? 'bg-[#D83B52]/10 text-[#D83B52] border border-[#D83B52]/30'
                        : 'bg-[#E94F83]/10 text-[#E94F83] border border-[#E94F83]/30'
                    }`}
                  >
                    {triage.urgency} Action Recommended
                  </span>
                </div>
                <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                  {triage.recommendedAction}
                </h3>
              </div>

              {/* Immediate Steps Ordered Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Immediate 3-Step Containment Protocol
                </h4>
                <div className="space-y-2">
                  {triage.immediateSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/30 flex items-start gap-3 text-xs text-[#34232D]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#E94F83] text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                        {idx + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended AuraSafe Tool Shortcuts */}
              {triage.recommendedTools && triage.recommendedTools.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F5A5BC]/20">
                  <h4 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                    Recommended AuraSafe Tools
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {triage.recommendedTools.map((tool, i) => {
                      const Icon = TAB_ICONS[tool.tab] || Shield;
                      return (
                        <div
                          key={i}
                          onClick={() => onNavigateTab(tool.tab)}
                          className="p-4 rounded-2xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 transition-all cursor-pointer space-y-2 shadow-2xs hover:shadow-xs group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-xl bg-[#FFF4F5] text-[#E94F83] flex items-center justify-center">
                                <Icon className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-xs text-[#34232D] group-hover:text-[#E94F83]">
                                {tool.title}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#866F7A] group-hover:text-[#E94F83] group-hover:translate-x-1 transition-transform" />
                          </div>
                          <p className="text-[11px] text-[#866F7A] leading-relaxed">
                            {tool.reason}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Crisis Helplines */}
              {triage.helplineResources && triage.helplineResources.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#F5A5BC]/20">
                  <h4 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                    Official 24/7 Support Contacts
                  </h4>
                  <div className="space-y-2">
                    {triage.helplineResources.map((res, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-2xl bg-[#FFF4F5]/60 border border-[#F5A5BC]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#34232D]">{res.name}</div>
                          <div className="text-[11px] text-[#866F7A]">{res.details}</div>
                        </div>
                        <div className="font-mono text-xs font-bold text-[#E94F83] bg-white px-3 py-1 rounded-full border border-[#F5A5BC]/40 self-start sm:self-auto">
                          {res.contact}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-white/70 border border-white/90 text-xs text-[#866F7A] space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF4F5] border border-[#F5A5BC]/40 flex items-center justify-center text-[#E94F83]">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                AuraAssist Triage Standing By
              </h3>
              <p className="max-w-md leading-relaxed">
                Select one of the incident scenarios above or describe your situation on the left to get a step-by-step containment plan immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
