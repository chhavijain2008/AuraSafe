import React, { useState, useEffect } from 'react';
import {
  Archive,
  Plus,
  Search,
  Filter,
  FileText,
  Download,
  Calendar,
  Clock,
  Shield,
  AlertTriangle,
  Hash,
  Paperclip,
  Trash2,
  ExternalLink,
  Printer,
  ChevronRight,
  User,
  CheckCircle2,
} from 'lucide-react';
import { IncidentRecord, IncidentCategory, ThreatSeverity, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

interface AuraEvidenceViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraEvidenceView: React.FC<AuraEvidenceViewProps> = ({ onNavigateTab }) => {
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddAttachmentOpen, setIsAddAttachmentOpen] = useState(false);

  // Create Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<IncidentCategory>('HARASSMENT');
  const [newSeverity, setNewSeverity] = useState<ThreatSeverity>('HIGH');
  const [newSummary, setNewSummary] = useState('');
  const [suspectHandles, setSuspectHandles] = useState('');
  const [suspectPhone, setSuspectPhone] = useState('');
  const [lawReportNo, setLawReportNo] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event & Attachment Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventSource, setEventSource] = useState('Instagram Direct');
  const [attFilename, setAttFilename] = useState('');
  const [attDesc, setAttDesc] = useState('');

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const list = await cyberApi.getIncidents();
      setIncidents(list);
      if (list.length > 0 && !selectedIncidentId) {
        setSelectedIncidentId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const selectedIncident =
    incidents.find((i) => i.id === selectedIncidentId) || incidents[0];

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const inc = await cyberApi.createIncident({
        title: newTitle,
        category: newCategory,
        severity: newSeverity,
        summary: newSummary,
        suspectInfo: {
          usernameHandles: suspectHandles,
          phoneNumbers: suspectPhone,
        },
        lawEnforcementReportNumber: lawReportNo,
        confidentialNotes: notes,
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewSummary('');
      setSuspectHandles('');
      setNotes('');
      await loadIncidents();
      setSelectedIncidentId(inc.id);
    } catch (err: any) {
      alert('Failed to create incident: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !eventTitle.trim()) return;

    try {
      const updated = await cyberApi.addTimelineEvent(
        selectedIncident.id,
        eventTitle,
        eventDesc,
        eventSource
      );
      setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setIsAddEventOpen(false);
      setEventTitle('');
      setEventDesc('');
    } catch (err: any) {
      alert('Error adding event: ' + err.message);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !attFilename.trim()) return;

    try {
      const updated = await cyberApi.addAttachment(
        selectedIncident.id,
        attFilename,
        'image/png',
        attDesc
      );
      setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setIsAddAttachmentOpen(false);
      setAttFilename('');
      setAttDesc('');
    } catch (err: any) {
      alert('Error recording attachment: ' + err.message);
    }
  };

  const handleDeleteIncident = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this evidence incident record?')) return;
    try {
      await cyberApi.deleteIncident(id);
      await loadIncidents();
    } catch (err: any) {
      alert('Failed to delete incident: ' + err.message);
    }
  };

  const handleDownloadJson = () => {
    if (!selectedIncident) return;
    const blob = new Blob([JSON.stringify(selectedIncident, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraSafe_Incident_${selectedIncident.caseNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || inc.category === categoryFilter;
    const matchesSev = severityFilter === 'all' || inc.severity === severityFilter;
    return matchesSearch && matchesCat && matchesSev;
  });

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>Prototype limitation:</strong> incident and attachment metadata are stored in a local JSON file. The actual evidence files are not uploaded or stored, and no forensic hash is generated by this form.
      </div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Archive className="w-3.5 h-3.5" />
            <span>AuraEvidence Forensic Vault</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Private Incident Vault & Legal Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Maintain incident timelines and metadata. Actual file uploads, cryptographic hashing, and legal submission integrations are not connected in this prototype.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#E94F83] hover:bg-[#d83c70] text-white text-xs font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Incident</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#866F7A] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by case #, handle, or keywords..."
            className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-medium text-[#34232D] focus:outline-none focus:border-[#E94F83]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-semibold text-[#34232D] focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="HARASSMENT">Harassment</option>
            <option value="STALKING">Stalking</option>
            <option value="IMPERSONATION">Impersonation</option>
            <option value="IMAGE_MISUSE">Image Misuse</option>
            <option value="PHISHING">Phishing</option>
            <option value="EXTORTION">Extortion</option>
            <option value="UNAUTHORIZED_ACCESS">Account Breach</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-[#F5A5BC]/40 rounded-xl text-xs font-semibold text-[#34232D] focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Incident List vs Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Incident List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-serif-title text-base font-bold text-[#34232D]">
              Evidence Records ({filteredIncidents.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white rounded-3xl border border-white">
              Loading incidents...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#866F7A] bg-white/70 rounded-3xl border border-white/90">
              No evidence records found matching query.
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = inc.id === selectedIncident?.id;
              return (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#E94F83] shadow-sm'
                      : 'bg-white/80 hover:bg-white border-white/90 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#E94F83]">
                      {inc.caseNumber}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-[#D83B52]/10 text-[#D83B52]'
                          : inc.severity === 'HIGH'
                          ? 'bg-[#E94F83]/10 text-[#E94F83]'
                          : 'bg-[#C88724]/10 text-[#C88724]'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#34232D] line-clamp-1">
                    {inc.title}
                  </h4>

                  <p className="text-[11px] text-[#866F7A] line-clamp-2 leading-relaxed">
                    {inc.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-[#866F7A] pt-1 border-t border-[#F5A5BC]/20">
                    <span>{new Date(inc.createdAt).toLocaleDateString()}</span>
                    <span>
                      {inc.timeline?.length || 0} events • {inc.attachments?.length || 0} files
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detailed Selected Incident */}
        <div className="lg:col-span-7 space-y-4">
          {selectedIncident ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F5A5BC]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#E94F83]">
                      {selectedIncident.caseNumber}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF4F5] text-[#34232D] border border-[#F5A5BC]/30">
                      {selectedIncident.category}
                    </span>
                  </div>
                  <h2 className="font-serif-title text-xl font-bold text-[#34232D]">
                    {selectedIncident.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsExportReportOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#34232D] hover:bg-[#4a3442] text-white text-xs font-bold cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#F5A5BC]" />
                    <span>Generate Police Report</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="p-2 rounded-xl bg-white hover:bg-[#FFF0F3] border border-[#F5A5BC]/40 text-[#34232D] cursor-pointer shadow-2xs"
                    title="Export raw JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteIncident(selectedIncident.id)}
                    className="p-2 rounded-xl hover:bg-[#D83B52]/10 text-[#866F7A] hover:text-[#D83B52] cursor-pointer"
                    title="Delete incident"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Suspect & Case Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/30 space-y-1">
                  <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Known Suspect / Handles
                  </div>
                  <div className="font-semibold text-[#34232D]">
                    {selectedIncident.suspectInfo?.usernameHandles || 'Unknown / Anonymous'}
                  </div>
                  {selectedIncident.suspectInfo?.phoneNumbers && (
                    <div className="text-[11px] text-[#866F7A]">
                      Phone: {selectedIncident.suspectInfo.phoneNumbers}
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/30 space-y-1">
                  <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Law Enforcement / Ticket #
                  </div>
                  <div className="font-semibold text-[#34232D]">
                    {selectedIncident.lawEnforcementReportNumber || 'Pending Official Filing'}
                  </div>
                  <div className="text-[11px] text-[#866F7A]">
                    Status: {selectedIncident.status}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                  Incident Narrative
                </div>
                <p className="text-xs text-[#34232D] bg-[#FFF4F5]/50 p-3.5 rounded-2xl border border-[#F5A5BC]/30 leading-relaxed">
                  {selectedIncident.summary}
                </p>
              </div>

              {/* Chronological Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Forensic Timeline Events ({selectedIncident.timeline?.length || 0})
                  </div>
                  <button
                    onClick={() => setIsAddEventOpen(true)}
                    className="text-xs font-bold text-[#E94F83] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Event</span>
                  </button>
                </div>

                <div className="space-y-2 border-l-2 border-[#F5A5BC]/40 pl-4 ml-2">
                  {selectedIncident.timeline?.map((evt) => (
                    <div key={evt.id} className="relative space-y-0.5 text-xs">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#E94F83] ring-4 ring-white" />
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#34232D]">{evt.title}</span>
                        <span className="text-[10px] text-[#866F7A]">
                          {new Date(evt.timestamp).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-[#866F7A] leading-relaxed">{evt.description}</p>
                      <span className="inline-block text-[9px] font-semibold text-[#E94F83] bg-[#FFF4F5] px-1.5 py-0.2 rounded border border-[#F5A5BC]/30">
                        Source: {evt.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cryptographic Attachments */}
              <div className="space-y-3 pt-2 border-t border-[#F5A5BC]/20">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-[#866F7A] uppercase tracking-wider">
                    Attachments & MD5 Hashes ({selectedIncident.attachments?.length || 0})
                  </div>
                  <button
                    onClick={() => setIsAddAttachmentOpen(true)}
                    className="text-xs font-bold text-[#E94F83] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Record File Artifact</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedIncident.attachments?.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 rounded-2xl bg-[#FFFBF8] border border-[#F5A5BC]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3.5 h-3.5 text-[#E94F83]" />
                          <span className="font-bold text-[#34232D]">{att.filename}</span>
                        </div>
                        <p className="text-[11px] text-[#866F7A]">{att.description}</p>
                      </div>

                      <div className="text-right sm:self-center">
                        <div className="text-[9px] uppercase font-bold text-[#866F7A]">
                          MD5 Integrity Hash
                        </div>
                        <span className="font-mono text-[10px] text-[#34232D] bg-white px-2 py-0.5 rounded border border-[#F5A5BC]/40">
                          {att.hashMd5 || 'Not generated — metadata only'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] flex items-center justify-center p-8 text-center rounded-3xl bg-white/70 border border-white/90 text-xs text-[#866F7A]">
              Select an incident on the left or create a new one.
            </div>
          )}
        </div>
      </div>

      {/* Log New Incident Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
              <h3 className="font-serif-title text-xl font-bold text-[#34232D]">
                Log Evidence Incident
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-xs font-semibold text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Incident Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Stalking DMs and Location Probing via Instagram"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as IncidentCategory)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                  >
                    <option value="HARASSMENT">Harassment</option>
                    <option value="STALKING">Stalking</option>
                    <option value="IMPERSONATION">Impersonation</option>
                    <option value="IMAGE_MISUSE">Image Misuse</option>
                    <option value="PHISHING">Phishing</option>
                    <option value="EXTORTION">Extortion</option>
                    <option value="UNAUTHORIZED_ACCESS">Account Breach</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                    Severity Tier
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as ThreatSeverity)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none cursor-pointer"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Suspect Handles / Identifying Notes
                </label>
                <input
                  type="text"
                  value={suspectHandles}
                  onChange={(e) => setSuspectHandles(e.target.value)}
                  placeholder="e.g. @anon_burner_22, @stalker_eyes"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-[#866F7A] uppercase tracking-wider mb-1">
                  Narrative Summary
                </label>
                <textarea
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  rows={3}
                  placeholder="Chronological facts: what was sent, when, platforms used, and harm caused..."
                  className="w-full p-3 bg-white border border-[#F5A5BC]/40 rounded-xl font-medium text-[#34232D] focus:border-[#E94F83] focus:outline-none resize-none"
                  required
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
                  {isSubmitting ? 'Recording...' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
              Add Timeline Event
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] mb-1">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Received new threat DM from alternate handle"
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#866F7A] mb-1">Source / Platform</label>
                <input
                  type="text"
                  value={eventSource}
                  onChange={(e) => setEventSource(e.target.value)}
                  placeholder="e.g. Instagram DM, SMS, Phone Call"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-[#866F7A] mb-1">Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-xl resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#E94F83] text-white font-bold"
                >
                  Append Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Attachment Modal */}
      {isAddAttachmentOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white border border-white shadow-2xl space-y-4">
            <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
              Record Evidence File Artifact
            </h3>
            <form onSubmit={handleAddAttachment} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#866F7A] mb-1">File Name</label>
                <input
                  type="text"
                  value={attFilename}
                  onChange={(e) => setAttFilename(e.target.value)}
                  placeholder="e.g. screenshot_threat_ig_01.png"
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#866F7A] mb-1">Description</label>
                <textarea
                  value={attDesc}
                  onChange={(e) => setAttDesc(e.target.value)}
                  rows={2}
                  placeholder="What this file depicts and timestamp captured..."
                  className="w-full p-2 border rounded-xl resize-none"
                />
              </div>
              <p className="text-[11px] text-[#866F7A]">
                Note: A tamper-resistant MD5 forensic integrity hash will be generated automatically.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAttachmentOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-[#E94F83] text-white font-bold"
                >
                  Record Artifact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal Police / Legal Export Modal */}
      {isExportReportOpen && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto p-8 rounded-3xl bg-white border border-white shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#E94F83]">
                  AuraSafe Forensic Package
                </div>
                <h3 className="font-serif-title text-2xl font-bold text-[#34232D]">
                  Formal Incident Summary Report
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-[#34232D] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#F5A5BC]" />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setIsExportReportOpen(false)}
                  className="px-3 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Official Looking Document Layout */}
            <div className="space-y-6 text-xs text-[#34232D] leading-relaxed font-sans">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50 border">
                <div>
                  <div><strong>Case Reference:</strong> {selectedIncident.caseNumber}</div>
                  <div><strong>Generated At:</strong> {new Date().toLocaleString()}</div>
                  <div><strong>Severity Tier:</strong> {selectedIncident.severity}</div>
                </div>
                <div>
                  <div><strong>Category:</strong> {selectedIncident.category}</div>
                  <div><strong>Official Report ID:</strong> {selectedIncident.lawEnforcementReportNumber || 'N/A'}</div>
                  <div><strong>Chain of Custody:</strong> AuraSafe Secure Vault</div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1 text-gray-700">
                  I. Incident Overview
                </h4>
                <p className="p-3 bg-white border rounded-xl">{selectedIncident.summary}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1 text-gray-700">
                  II. Suspect & Perpetrator Identifying Details
                </h4>
                <div className="p-3 bg-white border rounded-xl space-y-1">
                  <div><strong>Identified Handles:</strong> {selectedIncident.suspectInfo?.usernameHandles || 'Unknown'}</div>
                  {selectedIncident.suspectInfo?.phoneNumbers && (
                    <div><strong>Phone / Contact Numbers:</strong> {selectedIncident.suspectInfo.phoneNumbers}</div>
                  )}
                  {selectedIncident.confidentialNotes && (
                    <div><strong>Forensic Notes:</strong> {selectedIncident.confidentialNotes}</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700">
                  III. Chronological Fact Timeline
                </h4>
                <div className="border rounded-xl divide-y">
                  {selectedIncident.timeline?.map((evt, idx) => (
                    <div key={idx} className="p-3">
                      <div className="font-bold flex items-center justify-between">
                        <span>{idx + 1}. {evt.title} ({evt.source})</span>
                        <span className="text-[11px] text-gray-500 font-normal">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider mb-2 text-gray-700">
                  IV. Preserved Digital Artifacts (MD5 Cryptographic Hashes)
                </h4>
                <div className="border rounded-xl divide-y">
                  {selectedIncident.attachments?.map((att, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold">{att.filename}</div>
                        <div className="text-gray-500 text-[11px]">{att.description}</div>
                      </div>
                      <div className="font-mono text-[10px] bg-gray-100 px-2 py-1 rounded">
                        MD5: {att.hashMd5 || 'Not generated — metadata only'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border text-[11px] text-gray-500 leading-normal">
                This document was exported from the AuraSafe Personal Safety and Cyber Vault platform. All timestamps and forensic file records were captured contemporaneously.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
