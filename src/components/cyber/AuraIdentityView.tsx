import React, { useState, useEffect } from 'react';
import {
  UserX,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Trash2,
  FileText,
  Share2,
  Archive,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ImpersonationCase, SocialPlatform, ImpersonationStatus, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

const PLATFORMS: SocialPlatform[] = [
  'Instagram',
  'Facebook',
  'TikTok',
  'X (Twitter)',
  'LinkedIn',
  'Snapchat',
  'WhatsApp / Telegram',
  'Tinder / Dating App',
  'Other Platform',
];

const PLATFORM_TAKEDOWN_GUIDES: Record<
  string,
  { name: string; url: string; instructions: string[] }
> = {
  Instagram: {
    name: 'Meta / Instagram Impersonation Portal',
    url: 'https://help.instagram.com/contact/636276399721841',
    instructions: [
      'Navigate to the fake profile, tap "..." (top right) > Report > Report Account > Pretending to be someone else > Me.',
      'If you cannot log in or need formal legal identity verification, submit a government ID directly via the official Impersonation Form.',
      'Have 3-5 close mutual contacts report the same account using the exact same option.',
    ],
  },
  Facebook: {
    name: 'Facebook Impersonating Account Reporting',
    url: 'https://www.facebook.com/help/contact/295309487309948',
    instructions: [
      'Go to the impersonating profile > click "..." below cover photo > Find support or report profile > Pretending to be someone > Me.',
      'If you don\'t have a Facebook account or the perpetrator blocked you, use the official non-account holder form.',
    ],
  },
  TikTok: {
    name: 'TikTok Trust & Safety Impersonation Form',
    url: 'https://www.tiktok.com/legal/report/feedback',
    instructions: [
      'Open the TikTok profile, tap Share icon (top right) > Report > Report Account > Pretending to be someone else > Me.',
      'Submit verification of your genuine government-issued ID via the feedback portal if requested.',
    ],
  },
  'X (Twitter)': {
    name: 'X Impersonation Policy & Report Form',
    url: 'https://help.twitter.com/en/forms/safety-and-sensitive-content/impersonation',
    instructions: [
      'Visit the profile > tap "..." > Report @handle > They are pretending to be me or someone else.',
      'Submit your government ID and evidence of account creation date to confirm rightful ownership.',
    ],
  },
  LinkedIn: {
    name: 'LinkedIn Fake Profile Removal Form',
    url: 'https://www.linkedin.com/help/linkedin/ask/TS-NFPI',
    instructions: [
      'On the fake profile, click More > Report / Block > Report this profile > Fake account.',
      'Fill out the Notice of Untruthful Profile form with your official email address and resume.',
    ],
  },
  Snapchat: {
    name: 'Snapchat Support - Impersonation Report',
    url: 'https://support.snapchat.com/en-US/i-need-help',
    instructions: [
      'Press and hold on the username in chat or search > tap Gear icon > Report > They\'re pretending to be me.',
    ],
  },
  'WhatsApp / Telegram': {
    name: 'Messaging App Abuse Desk',
    url: 'https://telegram.org/support',
    instructions: [
      'In Telegram, email abuse@telegram.org with screenshots and numeric user IDs.',
      'In WhatsApp, tap contact info > Report contact > Check "Block contact and delete chat".',
    ],
  },
  'Tinder / Dating App': {
    name: 'Match Group Dating Safety',
    url: 'https://www.tinderpressroom.com/safety',
    instructions: [
      'Tap the shield icon on the offending profile > Report > Pretending to be me.',
      'Email safety@gotinder.com with links and screenshots if the account was created to defame you.',
    ],
  },
};

interface AuraIdentityViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraIdentityView: React.FC<AuraIdentityViewProps> = ({ onNavigateTab }) => {
  const [cases, setCases] = useState<ImpersonationCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedGuidePlatform, setSelectedGuidePlatform] = useState<string>('Instagram');

  // Form State
  const [targetName, setTargetName] = useState('Gaurika Dhamija');
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [fakeHandle, setFakeHandle] = useState('');
  const [fakeUrl, setFakeUrl] = useState('');
  const [threatContext, setThreatContext] = useState<
    'STALKING' | 'DEFAMATION' | 'FINANCIAL_SCAM' | 'IDENTITY_THEFT' | 'HARASSMENT'
  >('HARASSMENT');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await cyberApi.getImpersonationCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load impersonation cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fakeHandle.trim()) return;

    try {
      setIsSubmitting(true);
      await cyberApi.createImpersonationCase({
        targetPersonName: targetName,
        platform,
        fakeProfileHandle: fakeHandle.startsWith('@') ? fakeHandle : `@${fakeHandle}`,
        fakeProfileUrl: fakeUrl,
        threatContext,
        notes,
      });
      setIsCreateOpen(false);
      setFakeHandle('');
      setFakeUrl('');
      setNotes('');
      await loadCases();
    } catch (err: any) {
      alert('Error creating case: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ImpersonationStatus) => {
    try {
      await cyberApi.updateImpersonationCase(id, { status });
      await loadCases();
    } catch (err: any) {
      console.error('Status update failed:', err);
    }
  };

  const handleToggleChecklist = async (
    caseItem: ImpersonationCase,
    key: keyof ImpersonationCase['checklist']
  ) => {
    try {
      const updatedChecklist = {
        ...caseItem.checklist,
        [key]: !caseItem.checklist[key],
      };
      await cyberApi.updateImpersonationCase(caseItem.id, { checklist: updatedChecklist });
      await loadCases();
    } catch (err: any) {
      console.error('Checklist update failed:', err);
    }
  };

  const handleDeleteCase = async (id: string) => {
    if (!confirm('Are you sure you want to remove this impersonation case tracking?')) return;
    try {
      await cyberApi.deleteImpersonationCase(id);
      await loadCases();
    } catch (err: any) {
      alert('Failed to delete case: ' + err.message);
    }
  };

  const handleSendToVault = async (caseItem: ImpersonationCase) => {
    try {
      const inc = await cyberApi.createIncident({
        title: `Impersonation Case: ${caseItem.fakeProfileHandle} on ${caseItem.platform}`,
        category: 'IMPERSONATION',
        severity: 'HIGH',
        summary: `Fake profile created on ${caseItem.platform}. Discovered ${caseItem.dateDiscovered}. ${caseItem.notes}`,
        suspectInfo: {
          usernameHandles: caseItem.fakeProfileHandle,
        },
        confidentialNotes: `Platform URL: ${caseItem.fakeProfileUrl}\nContext: ${caseItem.threatContext}`,
      });
      alert(`Case successfully added to AuraEvidence Vault (Ref: ${inc.caseNumber})`);
    } catch (err: any) {
      alert('Failed to record in vault: ' + err.message);
    }
  };

  const activeGuide =
    PLATFORM_TAKEDOWN_GUIDES[selectedGuidePlatform] || PLATFORM_TAKEDOWN_GUIDES['Instagram'];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <UserX className="w-3.5 h-3.5" />
            <span>AuraIdentity Defense</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Impersonation & Fake Profile Tracker
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Systematically document unauthorized clones, mobilize mutual contact reports, and execute platform takedowns.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Fake Profile</span>
        </button>
      </div>

      {/* Main Grid: Cases vs Takedown Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cases List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-title text-lg font-bold text-[#34232D]">
              Active Impersonation Cases ({cases.length})
            </h2>
            <span className="text-xs text-[#866F7A]">
              Real-time synchronization with secure database
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white rounded-3xl border border-white">
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white/70 rounded-3xl border border-white/90">
              No impersonation cases documented yet. Tap "Track New Fake Profile" to begin.
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5A5BC]/20">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#34232D]">
                        {c.fakeProfileHandle}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFF4F5] text-[#E94F83] border border-[#F5A5BC]/40">
                        {c.platform}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#866F7A]">
                      Target: <span className="font-semibold text-[#34232D]">{c.targetPersonName}</span> • Discovered {c.dateDiscovered}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="flex items-center gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value as ImpersonationStatus)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#FFFBF8] border border-[#F5A5BC]/50 text-[#34232D] cursor-pointer focus:outline-none"
                    >
                      <option value="REPORTED">Reported</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="TAKEDOWN_IN_PROGRESS">Takedown In Progress</option>
                      <option value="RESOLVED">Resolved / Removed</option>
                      <option value="ESCALATED">Escalated to Legal</option>
                    </select>

                    <button
                      onClick={() => handleDeleteCase(c.id)}
                      className="p-1.5 rounded-xl hover:bg-[#D83B52]/10 text-[#866F7A] hover:text-[#D83B52] transition-colors cursor-pointer"
                      title="Delete case"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Notes and link */}
                {c.notes && (
                  <p className="text-xs text-[#866F7A] bg-[#FFF4F5]/50 p-3 rounded-xl border border-[#F5A5BC]/20 italic">
                    "{c.notes}"
                  </p>
                )}

                {c.fakeProfileUrl && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[#866F7A]">Profile URL:</span>
                    <a
                      href={c.fakeProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E94F83] hover:underline flex items-center gap-1 font-mono text-[11px] truncate max-w-sm"
                    >
                      <span>{c.fakeProfileUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                )}

                {/* Interactive Action Checklist */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Evidentiary & Takedown Checklist
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFBF8] hover:bg-[#FFF4F5] transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.checklist.screenshotsCaptured}
                        onChange={() => handleToggleChecklist(c, 'screenshotsCaptured')}
                        className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC]"
                      />
                      <span className={c.checklist.screenshotsCaptured ? 'line-through text-[#866F7A]' : 'text-[#34232D]'}>
                        Full profile screenshot saved
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFBF8] hover:bg-[#FFF4F5] transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.checklist.profileUrlSaved}
                        onChange={() => handleToggleChecklist(c, 'profileUrlSaved')}
                        className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC]"
                      />
                      <span className={c.checklist.profileUrlSaved ? 'line-through text-[#866F7A]' : 'text-[#34232D]'}>
                        URL & Numeric UID recorded
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFBF8] hover:bg-[#FFF4F5] transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.checklist.networkWarned}
                        onChange={() => handleToggleChecklist(c, 'networkWarned')}
                        className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC]"
                      />
                      <span className={c.checklist.networkWarned ? 'line-through text-[#866F7A]' : 'text-[#34232D]'}>
                        Mutual friends warned
                      </span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl bg-[#FFFBF8] hover:bg-[#FFF4F5] transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.checklist.officialReportSubmitted}
                        onChange={() => handleToggleChecklist(c, 'officialReportSubmitted')}
                        className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC]"
                      />
                      <span className={c.checklist.officialReportSubmitted ? 'line-through text-[#866F7A]' : 'text-[#34232D]'}>
                        Platform ticket submitted
                      </span>
                    </label>
                  </div>
                </div>

                {/* Footer action buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F5A5BC]/20">
                  <button
                    onClick={() => handleSendToVault(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-xs font-semibold text-[#34232D] cursor-pointer shadow-2xs"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#E94F83]" />
                    <span>Send to Evidence Vault</span>
                  </button>

                  <button
                    onClick={() => setSelectedGuidePlatform(c.platform)}
                    className="text-xs font-bold text-[#E94F83] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View {c.platform} Takedown Guide</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Platform Takedown Guidance Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
                Platform Takedown Hub
              </h3>
              <select
                value={selectedGuidePlatform}
                onChange={(e) => setSelectedGuidePlatform(e.target.value)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] cursor-pointer focus:outline-none"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#34232D]">{activeGuide.name}</span>
                <a
                  href={activeGuide.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Open Official Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2 pt-2">
                <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                  Recommended Steps:
                </div>
                {activeGuide.instructions.map((inst, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#34232D]">
                    <div className="w-4 h-4 rounded-full bg-[#E94F83]/10 text-[#E94F83] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{inst}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mass Report Template */}
            <div className="space-y-2 pt-2 border-t border-[#F5A5BC]/20">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Message to Send to Close Friends
                </h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `Hey everyone, someone has created a fake profile pretending to be me. Please DO NOT accept requests from them or click any links they send. Please take 30 seconds to report the account for impersonation. Thank you!`
                    );
                    alert('Warning message copied to clipboard!');
                  }}
                  className="text-[11px] font-semibold text-[#E94F83] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Copy Warning Text</span>
                </button>
              </div>
              <p className="text-xs text-[#866F7A] bg-[#FFF4F5]/60 p-3 rounded-xl border border-[#F5A5BC]/30 italic leading-relaxed">
                "Hey everyone, someone has created a fake profile pretending to be me. Please DO NOT accept requests from them or click any links they send. Please take 30 seconds to report the account for impersonation. Thank you!"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Track New Fake Profile Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                Track New Fake Profile
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Target Person Name
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                    Platform
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                    Threat Context
                  </label>
                  <select
                    value={threatContext}
                    onChange={(e) => setThreatContext(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                  >
                    <option value="HARASSMENT">Harassment</option>
                    <option value="STALKING">Stalking</option>
                    <option value="DEFAMATION">Defamation</option>
                    <option value="FINANCIAL_SCAM">Financial Scamming</option>
                    <option value="IDENTITY_THEFT">Identity Theft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Fake Profile Username / Handle
                </label>
                <input
                  type="text"
                  value={fakeHandle}
                  onChange={(e) => setFakeHandle(e.target.value)}
                  placeholder="e.g. @gaurika_clone99"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Profile URL Link (Optional)
                </label>
                <input
                  type="url"
                  value={fakeUrl}
                  onChange={(e) => setFakeUrl(e.target.value)}
                  placeholder="https://instagram.com/gaurika_clone99"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Detailed Notes & Evidence Context
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Describe what the profile is doing (e.g. messaging classmates, soliciting money, posting private details)..."
                  className="w-full p-3 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#E94F83] hover:bg-[#d83c70] text-white font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving Case...' : 'Start Tracking Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
