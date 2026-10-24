/**
 * Client API service for AuraSafe Cyber Suite
 */

import {
  ThreatAnalysisRecord,
  ImpersonationCase,
  ImageMisuseCase,
  PrivacyAssessment,
  RecoverySession,
  IncidentRecord,
  AssistantTriageResult,
  CyberStats,
} from '../types/cyber';

export const cyberApi = {
  // Stats
  async getStats(): Promise<CyberStats> {
    const res = await fetch('/api/cyber/stats');
    if (!res.ok) throw new Error('Failed to load cyber stats');
    const data = await res.json();
    return data.stats;
  },

  // AuraShield
  async scanThreat(content: string, inputType: string, context?: string): Promise<ThreatAnalysisRecord> {
    const res = await fetch('/api/cyber/shield/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, inputType, context }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Threat scan failed');
    }
    return data.analysis;
  },

  async getThreatHistory(): Promise<ThreatAnalysisRecord[]> {
    const res = await fetch('/api/cyber/shield/history');
    if (!res.ok) throw new Error('Failed to load threat history');
    const data = await res.json();
    return data.history;
  },

  async clearThreatHistory(): Promise<void> {
    await fetch('/api/cyber/shield/history', { method: 'DELETE' });
  },

  // AuraIdentity
  async getImpersonationCases(): Promise<ImpersonationCase[]> {
    const res = await fetch('/api/cyber/identity/cases');
    if (!res.ok) throw new Error('Failed to load impersonation cases');
    const data = await res.json();
    return data.cases;
  },

  async createImpersonationCase(payload: Partial<ImpersonationCase>): Promise<ImpersonationCase> {
    const res = await fetch('/api/cyber/identity/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create case');
    return data.case;
  },

  async updateImpersonationCase(id: string, updates: Partial<ImpersonationCase>): Promise<ImpersonationCase> {
    const res = await fetch(`/api/cyber/identity/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update case');
    return data.case;
  },

  async deleteImpersonationCase(id: string): Promise<void> {
    await fetch(`/api/cyber/identity/cases/${id}`, { method: 'DELETE' });
  },

  // AuraImage
  async getImageCases(): Promise<ImageMisuseCase[]> {
    const res = await fetch('/api/cyber/image/cases');
    if (!res.ok) throw new Error('Failed to load image misuse cases');
    const data = await res.json();
    return data.cases;
  },

  async createImageCase(payload: Partial<ImageMisuseCase>): Promise<ImageMisuseCase> {
    const res = await fetch('/api/cyber/image/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to document image case');
    return data.case;
  },

  async updateImageCase(id: string, updates: Partial<ImageMisuseCase>): Promise<ImageMisuseCase> {
    const res = await fetch(`/api/cyber/image/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update case');
    return data.case;
  },

  // AuraPrivacy
  async getPrivacyAudit(): Promise<PrivacyAssessment> {
    const res = await fetch('/api/cyber/privacy/audit');
    if (!res.ok) throw new Error('Failed to load privacy audit');
    const data = await res.json();
    return data.assessment;
  },

  async togglePrivacyTask(taskId: string, isCompleted: boolean): Promise<PrivacyAssessment> {
    const res = await fetch('/api/cyber/privacy/audit/toggle-task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, isCompleted }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to toggle task');
    return data.assessment;
  },

  // AuraRecover
  async getRecoverySessions(): Promise<RecoverySession[]> {
    const res = await fetch('/api/cyber/recover/sessions');
    if (!res.ok) throw new Error('Failed to load recovery sessions');
    const data = await res.json();
    return data.sessions;
  },

  async createRecoverySession(payload: Partial<RecoverySession>): Promise<RecoverySession> {
    const res = await fetch('/api/cyber/recover/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to launch recovery playbook');
    return data.session;
  },

  async updateRecoverySession(id: string, updates: Partial<RecoverySession>): Promise<RecoverySession> {
    const res = await fetch(`/api/cyber/recover/sessions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update recovery session');
    return data.session;
  },

  // AuraEvidence
  async getIncidents(): Promise<IncidentRecord[]> {
    const res = await fetch('/api/cyber/evidence/incidents');
    if (!res.ok) throw new Error('Failed to load evidence incidents');
    const data = await res.json();
    return data.incidents;
  },

  async getIncident(id: string): Promise<IncidentRecord> {
    const res = await fetch(`/api/cyber/evidence/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to load incident');
    const data = await res.json();
    return data.incident;
  },

  async createIncident(payload: Partial<IncidentRecord>): Promise<IncidentRecord> {
    const res = await fetch('/api/cyber/evidence/incidents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create incident');
    return data.incident;
  },

  async updateIncident(id: string, updates: Partial<IncidentRecord>): Promise<IncidentRecord> {
    const res = await fetch(`/api/cyber/evidence/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update incident');
    return data.incident;
  },

  async deleteIncident(id: string): Promise<void> {
    await fetch(`/api/cyber/evidence/incidents/${id}`, { method: 'DELETE' });
  },

  async addTimelineEvent(incidentId: string, title: string, description: string, source: string): Promise<IncidentRecord> {
    const res = await fetch(`/api/cyber/evidence/incidents/${incidentId}/timeline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, source }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to append event');
    return data.incident;
  },

  async addAttachment(incidentId: string, filename: string, fileType: string, description: string, sourceUrl?: string): Promise<IncidentRecord> {
    const res = await fetch(`/api/cyber/evidence/incidents/${incidentId}/attachments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, fileType, description, sourceUrl }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to record attachment');
    return data.incident;
  },

  // AuraAssist
  async runTriage(userDescription: string, situationType?: string): Promise<AssistantTriageResult> {
    const res = await fetch('/api/cyber/assist/triage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userDescription, situationType }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Triage analysis failed');
    return data.triage;
  },
};
