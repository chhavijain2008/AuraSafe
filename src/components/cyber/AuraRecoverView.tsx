import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ExternalLink,
  Shield,
  Smartphone,
  Mail,
  CreditCard,
  Key,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { RecoverySession, PlaybookType, RecoveryStep, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

const PLAYBOOK_CONFIGS: Record<
  PlaybookType,
  { title: string; desc: string; icon: any; color: string }
> = {
  SOCIAL_TAKEOVER: {
    title: 'Instagram / Social Media Takeover',
    desc: 'Regain control of hijacked accounts, undo attacker email changes, and revoke sessions.',
    icon: Smartphone,
    color: 'from-[#E94F83] to-[#F5A5BC]',
  },
  EMAIL_COMPROMISE: {
    title: 'Primary Email Account Hijack',
    desc: 'Audit auto-forwarding rules, kick out foreign sessions, and lock down recovery emails.',
    icon: Mail,
    color: 'from-[#C88724] to-[#F4B266]',
  },
  FINANCIAL_BREACH: {
    title: 'Banking & Payment App Compromise',
    desc: 'Freeze payment cards, file fraud alerts with credit bureaus, and secure accounts.',
    icon: CreditCard,
    color: 'from-[#D83B52] to-[#E94F83]',
  },
  DEVICE_STOLEN: {
    title: 'Stolen or Confiscated Phone Lockout',
    desc: 'Remotely wipe device, unlink Apple ID/Google Account, and freeze SIM cards.',
    icon: Lock,
    color: 'from-[#8E44AD] to-[#D84D7D]',
  },
  CREDENTIAL_LEAK: {
    title: 'Password Leak & Dark Web Exposure',
    desc: 'Rotate compromised master passphrases and enroll passkeys and hardware keys.',
    icon: Key,
    color: 'from-[#388568] to-[#58B690]',
  },
};

interface AuraRecoverViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraRecoverView: React.FC<AuraRecoverViewProps> = ({ onNavigateTab }) => {
  const [sessions, setSessions] = useState<RecoverySession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);

  // New Playbook Form
  const [playbookType, setPlaybookType] = useState<PlaybookType>('SOCIAL_TAKEOVER');
  const [targetAccount, setTargetAccount] = useState('Personal Instagram (@gaurika)');
  const [playbookNotes, setPlaybookNotes] = useState('');
  const [isLaunching, setIsLaunching] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await cyberApi.getRecoverySessions();
      setSessions(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id);
      }
    } catch (err) {
      console.error('Failed to load recovery sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const activeSession = sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  const handleToggleStep = async (stepId: string) => {
    if (!activeSession) return;
    const updatedSteps = activeSession.steps.map((st) =>
      st.id === stepId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    const allDone = updatedSteps.every((s) => s.isCompleted);
    const newStatus = allDone ? 'RECOVERED' : 'IN_PROGRESS';

    try {
      const updated = await cyberApi.updateRecoverySession(activeSession.id, {
        steps: updatedSteps,
        status: newStatus as any,
      });
      setSessions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err: any) {
      console.error('Step update failed:', err);
    }
  };

  const handleLaunchPlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLaunching(true);
      const session = await cyberApi.createRecoverySession({
        playbookType,
        title: PLAYBOOK_CONFIGS[playbookType].title,
        targetAccount,
        notes: playbookNotes,
      });
      setIsLaunchOpen(false);
      setTargetAccount('');
      setPlaybookNotes('');
      await loadSessions();
      setSelectedSessionId(session.id);
    } catch (err: any) {
      alert('Error launching playbook: ' + err.message);
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSendToVault = async () => {
    if (!activeSession) return;
    try {
      const inc = await cyberApi.createIncident({
        title: `Account Recovery Log: ${activeSession.targetAccount}`,
        category: 'UNAUTHORIZED_ACCESS',
        severity: 'HIGH',
        summary: `Recovery playbook executed for ${activeSession.title}. Status: ${activeSession.status}. ${activeSession.notes}`,
        confidentialNotes: `Playbook: ${activeSession.playbookType}\nCompleted steps: ${
          activeSession.steps.filter((s) => s.isCompleted).length
        } of ${activeSession.steps.length}`,
      });
      alert(`Recovery record logged into AuraEvidence Vault (Ref: ${inc.caseNumber})`);
    } catch (err: any) {
      alert('Failed to log to vault: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <LifeBuoy className="w-3.5 h-3.5" />
            <span>AuraRecover Incident Containment</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Account Compromise Assistant
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Trauma-informed, step-by-step playbooks to sever attacker access, reclaim credentials, and secure your identity.
          </p>
        </div>

        <button
          onClick={() => setIsLaunchOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Emergency Playbook</span>
        </button>
      </div>

      {/* Main Grid: Sessions List vs Active Playbook Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Sessions */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title text-base font-bold text-[#34232D]">
              Active Sessions ({sessions.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-[#866F7A] bg-white rounded-3xl border border-white">
              Loading recovery playbooks...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#866F7A] bg-white/70 rounded-3xl border border-white/90">
              No recovery sessions active.
            </div>
          ) : (
            sessions.map((sess) => {
              const cfg = PLAYBOOK_CONFIGS[sess.playbookType] || PLAYBOOK_CONFIGS['SOCIAL_TAKEOVER'];
              const Icon = cfg.icon;
              const isSelected = sess.id === activeSession?.id;
              const done = sess.steps.filter((s) => s.isCompleted).length;
              const total = sess.steps.length;

              return (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSessionId(sess.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#E94F83] shadow-sm'
                      : 'bg-white/80 hover:bg-white border-white/90 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#FFF4F5] text-[#E94F83] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-[#34232D] truncate max-w-[140px]">
                        {sess.targetAccount}
                      </span>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        sess.status === 'RECOVERED'
                          ? 'bg-[#388568]/10 text-[#388568]'
                          : 'bg-[#C88724]/10 text-[#C88724]'
                      }`}
                    >
                      {sess.status === 'RECOVERED' ? 'RECOVERED' : 'IN PROGRESS'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#866F7A]">
                    <span>{sess.title}</span>
                    <span className="font-semibold text-[#34232D]">
                      {done}/{total} Done
                    </span>
                  </div>

                  {/* Tiny progress bar */}
                  <div className="w-full h-1.5 bg-[#FFF4F5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E94F83] transition-all"
                      style={{ width: `${(done / total) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Step-by-Step Interactive Playbook */}
        <div className="lg:col-span-8 space-y-4">
          {activeSession ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-sm space-y-6">
              {/* Playbook Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5A5BC]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E94F83]/10 text-[#E94F83]">
                      {activeSession.playbookType.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-[#866F7A]">
                      Started {new Date(activeSession.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="font-serif-title text-2xl font-bold text-[#34232D]">
                    {activeSession.title}
                  </h2>
                  <p className="text-xs text-[#866F7A]">
                    Target Account: <strong className="text-[#34232D]">{activeSession.targetAccount}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSendToVault}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-xs font-semibold text-[#34232D] cursor-pointer shadow-2xs"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#E94F83]" />
                    <span>Log to Vault</span>
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                  Ordered Recovery Protocol
                </div>

                {activeSession.steps.map((st, idx) => (
                  <div
                    key={st.id}
                    onClick={() => handleToggleStep(st.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                      st.isCompleted
                        ? 'bg-[#FFFBF8] border-[#F5A5BC]/30 opacity-70'
                        : 'bg-white hover:bg-[#FFF4F5] border-[#F5A5BC]/40 shadow-2xs'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={st.isCompleted}
                      onChange={() => {}} // handled by click
                      className="w-5 h-5 mt-0.5 text-[#E94F83] rounded border-[#F5A5BC] focus:ring-[#E94F83] cursor-pointer shrink-0"
                    />

                    <div className="space-y-1 flex-1 text-xs">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#34232D]">{idx + 1}. {st.title}</span>
                        {st.isUrgent && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D83B52]/10 text-[#D83B52]">
                            Immediate Priority
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#866F7A] leading-relaxed">
                        {st.description}
                      </p>

                      {st.linkUrl && (
                        <div className="pt-1">
                          <a
                            href={st.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E94F83] hover:underline"
                          >
                            <span>{st.linkText || 'Open Portal Link'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              {activeSession.notes && (
                <div className="p-4 rounded-2xl bg-[#FFF4F5]/60 border border-[#F5A5BC]/30 space-y-1">
                  <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Incident Notes
                  </div>
                  <p className="text-xs text-[#34232D] leading-relaxed italic">
                    "{activeSession.notes}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex items-center justify-center p-8 text-center rounded-3xl bg-white/70 border border-white/90 text-xs text-[#866F7A]">
              Select or launch a playbook to begin containment.
            </div>
          )}
        </div>
      </div>

      {/* Launch Playbook Modal */}
      {isLaunchOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                Launch Recovery Playbook
              </h3>
              <button
                onClick={() => setIsLaunchOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleLaunchPlaybook} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Compromise Playbook Type
                </label>
                <select
                  value={playbookType}
                  onChange={(e) => setPlaybookType(e.target.value as PlaybookType)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                >
                  {Object.entries(PLAYBOOK_CONFIGS).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Target Account or Handle
                </label>
                <input
                  type="text"
                  value={targetAccount}
                  onChange={(e) => setTargetAccount(e.target.value)}
                  placeholder="e.g. Gmail (myname@gmail.com) or Instagram (@handle)"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Initial Notes / What Happened
                </label>
                <textarea
                  value={playbookNotes}
                  onChange={(e) => setPlaybookNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Received 2FA codes I didn't request, password was changed 10 minutes ago..."
                  className="w-full p-3 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLaunchOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLaunching}
                  className="px-5 py-2 rounded-xl bg-[#E94F83] hover:bg-[#d83c70] text-white font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isLaunching ? 'Initiating...' : 'Launch Playbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
