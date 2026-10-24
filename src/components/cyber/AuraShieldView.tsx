import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Link,
  Mail,
  MessageSquare,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Archive,
  History,
  Trash2,
  ExternalLink,
  Lock,
} from 'lucide-react';
import { ThreatAnalysisRecord, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

interface AuraShieldViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraShieldView: React.FC<AuraShieldViewProps> = ({ onNavigateTab }) => {
  const [inputType, setInputType] = useState<'text' | 'url' | 'email' | 'screenshot_meta'>('text');
  const [inputContent, setInputContent] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ThreatAnalysisRecord | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<ThreatAnalysisRecord[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [vaultSavedMsg, setVaultSavedMsg] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const past = await cyberApi.getThreatHistory();
      setHistory(past);
      if (past.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(past[0]);
      }
    } catch (err) {
      console.warn('Could not load history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) {
      setErrorMsg('Please paste the message, link, or email content to inspect.');
      return;
    }

    try {
      setIsScanning(true);
      setErrorMsg(null);
      setVaultSavedMsg(null);
      const result = await cyberApi.scanThreat(inputContent, inputType, contextNote);
      setCurrentAnalysis(result);
      await loadHistory();
    } catch (err: any) {
      setErrorMsg(err.message || 'Threat scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  const handleToggleChecklist = (index: number) => {
    if (!currentAnalysis) return;
    const updated = { ...currentAnalysis };
    if (updated.defensiveChecklist && updated.defensiveChecklist[index]) {
      updated.defensiveChecklist[index].done = !updated.defensiveChecklist[index].done;
      setCurrentAnalysis(updated);
    }
  };

  const handleSendToEvidenceVault = async () => {
    if (!currentAnalysis) return;
    try {
      const inc = await cyberApi.createIncident({
        title: `Threat Flag: ${currentAnalysis.category}`,
        category:
          currentAnalysis.threatScore > 80
            ? 'EXTORTION'
            : currentAnalysis.category.toLowerCase().includes('phishing')
            ? 'PHISHING'
            : 'HARASSMENT',
        severity: currentAnalysis.threatLevel,
        summary: currentAnalysis.summary,
        confidentialNotes: `Input Source: ${currentAnalysis.inputType}\nContent: ${currentAnalysis.inputSnippet}\nScanned Threat Score: ${currentAnalysis.threatScore}/100`,
      });

      // Also attach the text
      await cyberApi.addAttachment(
        inc.id,
        `threat_scan_${Date.now()}.txt`,
        'text/plain',
        `Original flagged content: ${currentAnalysis.inputSnippet}`
      );

      setVaultSavedMsg(`Saved to Evidence Vault as Case ${inc.caseNumber}`);
    } catch (err: any) {
      setVaultSavedMsg('Failed to save to vault: ' + err.message);
    }
  };

  const handleSample = (sampleType: string) => {
    if (sampleType === 'phish') {
      setInputType('email');
      setInputContent('URGENT: Cloud storage backup suspended due to billing error. Tap https://verify-cloud-auth.link/login to update credit card within 4 hours or all photos will be removed.');
      setContextNote('Received unsolicited in spam folder');
    } else if (sampleType === 'stalk') {
      setInputType('text');
      setInputContent('I saw you leaving the library in that beige trench coat at 8:15 PM. Why did you ignore my DM? Who was that guy walking near you? Reply now.');
      setContextNote('Sent from anonymous Instagram burner handle');
    } else if (sampleType === 'extort') {
      setInputType('text');
      setInputContent('We have access to your private webcam stream and contact list. Send $500 in BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa within 24 hours or this video gets sent to all your followers.');
      setContextNote('Sent via suspicious SMS');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#D83B52] bg-[#D83B52]/10 border-[#D83B52]/30';
    if (score >= 50) return 'text-[#C88724] bg-[#C88724]/10 border-[#C88724]/30';
    return 'text-[#388568] bg-[#388568]/10 border-[#388568]/30';
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>AuraShield AI Threat Intelligence</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Threat & Harassment Scanner
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Detect credential harvesting, fake links, location probing, coercive stalking, and extortion before reacting.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#34232D] border border-white/90 shadow-2xs transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-[#E94F83]" />
            <span>Past Scans ({history.length})</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-md border border-white/90 shadow-2xs space-y-4">
            {/* Input Type Tabs */}
            <div>
              <label className="block text-[11px] font-bold text-[#866F7A] uppercase tracking-wider mb-2">
                Scan Category
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-[#FFF4F5] rounded-2xl border border-[#F5A5BC]/30">
                <button
                  type="button"
                  onClick={() => setInputType('text')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    inputType === 'text' ? 'bg-white text-[#E94F83] shadow-2xs' : 'text-[#866F7A]'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>DM / Text</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('url')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    inputType === 'url' ? 'bg-white text-[#E94F83] shadow-2xs' : 'text-[#866F7A]'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Link / URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('email')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    inputType === 'email' ? 'bg-white text-[#E94F83] shadow-2xs' : 'text-[#866F7A]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('screenshot_meta')}
                  className={`py-2 px-1 text-[11px] font-bold rounded-xl flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    inputType === 'screenshot_meta' ? 'bg-white text-[#E94F83] shadow-2xs' : 'text-[#866F7A]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Meta / Notes</span>
                </button>
              </div>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-[#866F7A] font-semibold">Try sample:</span>
              <button
                type="button"
                onClick={() => handleSample('stalk')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-[#34232D] cursor-pointer"
              >
                Stalking DM
              </button>
              <button
                type="button"
                onClick={() => handleSample('phish')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-[#34232D] cursor-pointer"
              >
                Phishing Link
              </button>
              <button
                type="button"
                onClick={() => handleSample('extort')}
                className="text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-[#34232D] cursor-pointer"
              >
                Extortion Note
              </button>
            </div>

            <form onSubmit={handleScan} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#866F7A] uppercase tracking-wider mb-1.5">
                  Paste Suspicious Content
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  rows={6}
                  placeholder={
                    inputType === 'url'
                      ? 'e.g. https://instagram-security-verify.login-portal.site/reset'
                      : 'Paste the exact text, direct message, or email body here...'
                  }
                  className="w-full p-3.5 bg-white border border-[#F5A5BC]/40 rounded-2xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83] shadow-inner resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#866F7A] uppercase tracking-wider mb-1.5">
                  Context / Circumstances (Optional)
                </label>
                <input
                  type="text"
                  value={contextNote}
                  onChange={(e) => setContextNote(e.target.value)}
                  placeholder="e.g. Sent right after I posted an Instagram story at the gym"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83] shadow-inner"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-[#D83B52]/10 border border-[#D83B52]/30 text-xs text-[#D83B52]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-3 px-5 rounded-2xl bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Indicators with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Deep Threat Scan</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Privacy Note */}
          <div className="p-4 rounded-2xl bg-[#FFFAF7] border border-white/90 text-xs text-[#866F7A] flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#388568] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Forensic Safety Guarantee:</strong> Scanned text is treated as private forensic evidence. It is never used to train public models or shared with third parties.
            </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          {currentAnalysis ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-sm space-y-6">
              {/* Score Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#F5A5BC]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getScoreColor(
                        currentAnalysis.threatScore
                      )}`}
                    >
                      {currentAnalysis.threatLevel} RISK
                    </span>
                    <span className="text-xs text-[#866F7A]">
                      {new Date(currentAnalysis.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <h2 className="font-serif-title text-xl font-bold text-[#34232D]">
                    {currentAnalysis.category}
                  </h2>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-[#866F7A]">
                      Threat Index
                    </div>
                    <div className="font-serif-title text-3xl font-bold text-[#34232D]">
                      {currentAnalysis.threatScore}
                      <span className="text-xs font-normal text-[#866F7A]">/100</span>
                    </div>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center border font-bold text-lg ${getScoreColor(
                      currentAnalysis.threatScore
                    )}`}
                  >
                    {currentAnalysis.threatScore > 75 ? '⚠️' : currentAnalysis.threatScore > 40 ? '⚡' : '🛡️'}
                  </div>
                </div>
              </div>

              {/* Calm Forensic Summary */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Threat Evaluation
                </h3>
                <p className="text-sm text-[#34232D] leading-relaxed bg-[#FFF4F5]/60 p-4 rounded-2xl border border-[#F5A5BC]/30">
                  {currentAnalysis.summary}
                </p>
              </div>

              {/* Risk Indicators */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Specific Flags Detected
                </h3>
                <div className="space-y-2">
                  {currentAnalysis.riskIndicators.map((ind, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#F5A5BC]/20 text-xs text-[#34232D]"
                    >
                      <AlertTriangle className="w-4 h-4 text-[#D83B52] shrink-0 mt-0.5" />
                      <span>{ind}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Immediate Steps */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Immediate Protective Measures
                </h3>
                <div className="space-y-2">
                  {currentAnalysis.recommendedSteps.map((step, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FFFAF7] border border-white text-xs text-[#34232D]"
                    >
                      <div className="w-5 h-5 rounded-full bg-[#E94F83]/10 text-[#E94F83] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <span className="leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Defensive Checklist */}
              {currentAnalysis.defensiveChecklist && currentAnalysis.defensiveChecklist.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                    Interactive Defense Checklist
                  </h3>
                  <div className="space-y-2 bg-[#FFF4F5]/40 p-4 rounded-2xl border border-[#F5A5BC]/30">
                    {currentAnalysis.defensiveChecklist.map((item, idx) => (
                      <label
                        key={idx}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/80 transition-colors cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklist(idx)}
                          className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC] focus:ring-[#E94F83] cursor-pointer"
                        />
                        <span
                          className={
                            item.done ? 'line-through text-[#866F7A]' : 'text-[#34232D] font-medium'
                          }
                        >
                          {item.task}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-[#F5A5BC]/20 flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSendToEvidenceVault}
                  className="px-5 py-2.5 rounded-full bg-[#34232D] hover:bg-[#4a3442] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Archive className="w-3.5 h-3.5 text-[#F5A5BC]" />
                  <span>Save to AuraEvidence Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('cyber_assist')}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/50 text-xs font-bold text-[#E94F83] flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Get Guided Triage with AuraAssist</span>
                </button>

                {vaultSavedMsg && (
                  <div className="w-full flex items-center gap-2 p-2.5 rounded-xl bg-[#388568]/10 border border-[#388568]/30 text-xs text-[#388568] font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{vaultSavedMsg}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center rounded-3xl bg-white/70 border border-white/90 shadow-2xs space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF4F5] border border-[#F5A5BC]/40 flex items-center justify-center text-[#E94F83]">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                AuraShield Scanner Ready
              </h3>
              <p className="text-xs text-[#866F7A] max-w-md">
                Paste any suspicious text message, email snippet, or hyperlink on the left to analyze for social engineering, intimidation, and technical exploit indicators.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* History Drawer Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[80vh] overflow-y-auto p-6 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#E94F83]" />
                <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
                  Threat Scan Archive
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await cyberApi.clearThreatHistory();
                    setHistory([]);
                  }}
                  className="text-xs text-[#D83B52] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {history.length === 0 ? (
                <p className="text-xs text-[#866F7A] text-center py-6">No archived scans yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setCurrentAnalysis(item);
                      setIsHistoryOpen(false);
                    }}
                    className="p-3.5 rounded-2xl bg-[#FFFBF8] hover:bg-[#FFF4F5] border border-[#F5A5BC]/30 transition-all cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#34232D]">{item.category}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getScoreColor(
                          item.threatScore
                        )}`}
                      >
                        {item.threatScore}/100
                      </span>
                    </div>
                    <p className="text-[11px] text-[#866F7A] line-clamp-1 italic">
                      "{item.inputSnippet}"
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
