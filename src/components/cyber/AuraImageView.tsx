import React, { useState, useEffect } from 'react';
import {
  EyeOff,
  Shield,
  Lock,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Hash,
  Sparkles,
  Archive,
  PhoneCall,
  Info,
} from 'lucide-react';
import { ImageMisuseCase, ImageMisuseStatus, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

interface AuraImageViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraImageView: React.FC<AuraImageViewProps> = ({ onNavigateTab }) => {
  const [cases, setCases] = useState<ImageMisuseCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [misuseType, setMisuseType] = useState<ImageMisuseCase['misuseType']>('NON_CONSENSUAL_INTIMATE');
  const [platformDetected, setPlatformDetected] = useState('Telegram Channel / Group');
  const [locationUrl, setLocationUrl] = useState('');
  const [perpetratorKnown, setPerpetratorKnown] = useState(false);
  const [perpetratorHandle, setPerpetratorHandle] = useState('');
  const [hasStopNciiHash, setHasStopNciiHash] = useState(false);
  const [stopNciiCaseNumber, setStopNciiCaseNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await cyberApi.getImageCases();
      setCases(data);
    } catch (err) {
      console.error('Failed to load image cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await cyberApi.createImageCase({
        misuseType,
        platformDetected,
        locationUrl,
        perpetratorKnown,
        perpetratorHandle,
        hasStopNciiHash,
        stopNciiCaseNumber,
        notes,
      });
      setIsCreateOpen(false);
      setLocationUrl('');
      setPerpetratorHandle('');
      setNotes('');
      await loadCases();
    } catch (err: any) {
      alert('Error documenting incident: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ImageMisuseStatus) => {
    try {
      await cyberApi.updateImageCase(id, { status });
      await loadCases();
    } catch (err: any) {
      console.error('Failed to update status:', err);
    }
  };

  const handleSendToVault = async (c: ImageMisuseCase) => {
    try {
      const inc = await cyberApi.createIncident({
        title: `Image Misuse Case (${c.caseRef}): ${c.misuseType}`,
        category: 'IMAGE_MISUSE',
        severity: 'CRITICAL',
        summary: `Misuse documented on ${c.platformDetected}. External report status: not connected. ${c.notes}`,
        confidentialNotes: `Location URL: ${c.locationUrl}\nPerpetrator: ${c.perpetratorHandle || 'Unknown'}`,
      });
      alert(`Recorded into AuraEvidence Vault with Reference ${inc.caseNumber}`);
    } catch (err: any) {
      alert('Failed to record incident: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Prototype limitation:</strong> AuraSafe records case details locally. It does not create an image hash or submit to StopNCII or a social platform. Only record an external report as submitted after completing it on that service.
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <EyeOff className="w-3.5 h-3.5" />
            <span>AuraImage Privacy & Dignity Shield</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Image Misuse & Deepfake Response
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Empowering, confidential response tools for non-consensual image distribution and synthetic AI deepfakes.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Privately Document Incident</span>
        </button>
      </div>

      {/* Zero-Upload Confidentiality Pledge Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#FFF4F5] via-[#FFF8F9] to-[#FFFAF7] border border-[#F5A5BC]/60 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#E94F83]/15 text-[#E94F83] flex items-center justify-center shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif-title text-base font-bold text-[#34232D]">
            Strict Zero-Upload Privacy Guarantee
          </h3>
          <p className="text-xs text-[#866F7A] leading-relaxed">
            AuraSafe does not ask you to upload private or intimate images in this prototype. No local hashing or StopNCII submission integration is currently connected; use the official service directly and record its reference only after you receive one.
          </p>
        </div>
      </div>

      {/* Main Grid: Cases vs Authorized Takedown Hubs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Documented Cases */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-title text-lg font-bold text-[#34232D]">
              Tracked Incident Records ({cases.length})
            </h2>
            <span className="text-xs text-[#866F7A]">
              Encrypted metadata in local vault
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white rounded-3xl border border-white">
              Loading cases...
            </div>
          ) : cases.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white/70 rounded-3xl border border-white/90 space-y-2">
              <EyeOff className="w-6 h-6 text-[#866F7A] mx-auto" />
              <p>No image misuse incidents recorded.</p>
            </div>
          ) : (
            cases.map((c) => (
              <div
                key={c.id}
                className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F5A5BC]/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#34232D]">
                        {c.caseRef}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#D83B52]/10 text-[#D83B52] border border-[#D83B52]/20 uppercase">
                        {c.misuseType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#866F7A]">
                      Discovered on <span className="font-semibold text-[#34232D]">{c.platformDetected}</span> • {c.dateDocumented}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c.id, e.target.value as ImageMisuseStatus)}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-[#FFFBF8] border border-[#F5A5BC]/50 text-[#34232D] cursor-pointer focus:outline-none"
                    >
                      <option value="DOCUMENTED">Documented</option>
                      <option value="HASHED_STOPNCII">Hashed with StopNCII</option>
                      <option value="TAKEDOWN_SUBMITTED">Takedown Submitted</option>
                      <option value="CONFIRMED_REMOVED">Confirmed Removed</option>
                      <option value="LEGAL_ACTION_FILED">Legal Action Filed</option>
                    </select>
                  </div>
                </div>

                {/* Hashes & Reference Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FFFBF8] border border-[#F5A5BC]/30 space-y-1">
                    <div className="text-[10px] font-bold text-[#866F7A] uppercase">
                      StopNCII Device Hash
                    </div>
                    <div className="flex items-center gap-1.5 text-[#388568] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{c.hasStopNciiHash ? (c.stopNciiCaseNumber || 'Case Active') : 'Not Yet Hashed'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FFFBF8] border border-[#F5A5BC]/30 space-y-1">
                    <div className="text-[10px] font-bold text-[#866F7A] uppercase">
                      Perpetrator Info
                    </div>
                    <div className="text-[#34232D] font-medium truncate">
                      {c.perpetratorKnown ? c.perpetratorHandle || 'Known Contact' : 'Anonymous / Unknown'}
                    </div>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-xs text-[#866F7A] bg-[#FFF4F5]/40 p-3 rounded-xl border border-[#F5A5BC]/20 italic leading-relaxed">
                    "{c.notes}"
                  </p>
                )}

                {/* Action Footer */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F5A5BC]/20">
                  <button
                    onClick={() => handleSendToVault(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-xs font-semibold text-[#34232D] cursor-pointer shadow-2xs"
                  >
                    <Archive className="w-3.5 h-3.5 text-[#E94F83]" />
                    <span>Send to Evidence Vault</span>
                  </button>

                  <a
                    href="https://stopncii.org"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-[#E94F83] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Create Hash on StopNCII</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rapid Response Resources & Step-by-Step Takedown Protocols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
              Direct Global Removal Hubs
            </h3>

            {/* StopNCII */}
            <div className="p-4 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#E94F83]" />
                  <span className="font-bold text-xs text-[#34232D]">StopNCII.org (Adults 18+)</span>
                </div>
                <a
                  href="https://stopncii.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>Launch Tool</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#866F7A] leading-relaxed">
                Operated by the Revenge Porn Helpline. Generates an encrypted digital fingerprint (hash) directly on your device. The image never leaves your phone, but participating tech platforms (Meta, TikTok, OnlyFans, Reddit, Bumble) block matching uploads globally.
              </p>
            </div>

            {/* Take It Down (NCMEC) */}
            <div className="p-4 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#388568]" />
                  <span className="font-bold text-xs text-[#34232D]">Take It Down (Under 18)</span>
                </div>
                <a
                  href="https://takeitdown.ncmec.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#388568] hover:bg-[#2c6c54] text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <span>NCMEC Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-[#866F7A] leading-relaxed">
                Run by the National Center for Missing & Exploited Children (NCMEC). Free confidential tool to remove explicit images of anyone taken when they were under 18.
              </p>
            </div>

            {/* Cyber Civil Rights Initiative */}
            <div className="p-4 rounded-2xl bg-[#FFF4F5] border border-[#F5A5BC]/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#E94F83]" />
                  <span className="font-bold text-xs text-[#34232D]">CCRI Helpline</span>
                </div>
                <a
                  href="tel:8448782274"
                  className="px-3 py-1 rounded-full bg-white text-[#E94F83] border border-[#F5A5BC] text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>844-878-2274</span>
                </a>
              </div>
              <p className="text-xs text-[#866F7A] leading-relaxed">
                24/7 dedicated confidential support helpline offering legal options, emotional guidance, and direct escalations with platform trust & safety executives.
              </p>
            </div>

            {/* DMCA Takedown Template Generator */}
            <div className="pt-2 border-t border-[#F5A5BC]/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#866F7A] uppercase tracking-wider">
                  Copyright / DMCA Notice Template
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`To Whom It May Concern (Trust & Safety / Abuse Team):

I am submitting this DMCA Takedown and Privacy Violation Notice to demand the immediate removal of unauthorized intimate images depicting myself, which are being distributed without consent at the following URL: [INSERT URL].

Under 17 U.S.C. 512(c) and applicable platform safety standards, I demand immediate removal of this media. I have a good-faith belief that this use is not authorized. The information in this notification is accurate under penalty of perjury.`);
                    alert('DMCA Notice template copied to clipboard!');
                  }}
                  className="text-[11px] font-semibold text-[#E94F83] hover:underline cursor-pointer"
                >
                  Copy Notice Template
                </button>
              </div>
              <p className="text-[11px] text-[#866F7A] leading-relaxed">
                Hosting providers and websites are legally obligated to remove copyrighted photos upon receiving a formal takedown request.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Case Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                Privately Document Image Misuse
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF4F5] border border-[#F5A5BC]/40 text-xs text-[#E94F83] font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>Reminder: Do not upload the image itself. Only record forensic metadata.</span>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Incident Type
                </label>
                <select
                  value={misuseType}
                  onChange={(e) => setMisuseType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                >
                  <option value="NON_CONSENSUAL_INTIMATE">Non-Consensual Distribution of Intimate Image (NCII)</option>
                  <option value="DEEPFAKE_SYNTHETIC">AI Deepfake / Synthetic Media Fabrication</option>
                  <option value="EXTORTION_SEXTORTION">Extortion / Sextortion Coercion</option>
                  <option value="DOXXING_WITH_PHOTOS">Doxxing with Personal Photos</option>
                  <option value="UNAUTHORIZED_DISTRIBUTION">Unauthorized Public Distribution</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Platform / Venue Where Detected
                </label>
                <input
                  type="text"
                  value={platformDetected}
                  onChange={(e) => setPlatformDetected(e.target.value)}
                  placeholder="e.g. Telegram Channel, Discord Server, Forum"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Location URL or Web Link
                </label>
                <input
                  type="url"
                  value={locationUrl}
                  onChange={(e) => setLocationUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="stopNciiCheck"
                  checked={hasStopNciiHash}
                  onChange={(e) => setHasStopNciiHash(e.target.checked)}
                  className="w-4 h-4 text-[#E94F83] rounded border-[#F5A5BC]"
                />
                <label htmlFor="stopNciiCheck" className="font-semibold text-[#34232D]">
                  I have already created a StopNCII.org case
                </label>
              </div>

              {hasStopNciiHash && (
                <div>
                  <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                    StopNCII Case Reference Number
                  </label>
                  <input
                    type="text"
                    value={stopNciiCaseNumber}
                    onChange={(e) => setStopNciiCaseNumber(e.target.value)}
                    placeholder="e.g. STP-89412-USA"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Notes & Circumstances
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Record when you learned about it, who alerted you, and any demands made..."
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
                  {isSubmitting ? 'Saving...' : 'Document Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
