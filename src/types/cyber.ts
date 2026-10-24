/**
 * AuraSafe Cyber - Digital Safety Suite Type Definitions
 */

export type CyberTab =
  | 'cyber_dashboard'
  | 'cyber_shield'
  | 'cyber_identity'
  | 'cyber_image'
  | 'cyber_privacy'
  | 'cyber_recover'
  | 'cyber_evidence'
  | 'cyber_assist';

export type ThreatSeverity = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface ThreatAnalysisRecord {
  id: string;
  timestamp: string;
  inputType: 'text' | 'url' | 'email' | 'screenshot_meta';
  inputSnippet: string;
  threatLevel: ThreatSeverity;
  threatScore: number; // 0-100 (0=safe, 100=extreme danger)
  category: string;
  summary: string;
  riskIndicators: string[];
  recommendedSteps: string[];
  defensiveChecklist: { task: string; done: boolean }[];
  technicalDetails?: {
    domainChecked?: string;
    isSpoofed?: boolean;
    urgencyLanguageDetected?: boolean;
    credentialDemandDetected?: boolean;
  };
  linkedIncidentId?: string;
}

export type ImpersonationStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'TAKEDOWN_IN_PROGRESS'
  | 'RESOLVED'
  | 'ESCALATED';

export type SocialPlatform =
  | 'Instagram'
  | 'Facebook'
  | 'TikTok'
  | 'X (Twitter)'
  | 'LinkedIn'
  | 'Snapchat'
  | 'WhatsApp / Telegram'
  | 'Tinder / Dating App'
  | 'Other Platform';

export interface ImpersonationCase {
  id: string;
  targetPersonName: string;
  platform: SocialPlatform;
  fakeProfileHandle: string;
  fakeProfileUrl: string;
  dateDiscovered: string;
  status: ImpersonationStatus;
  threatContext: 'STALKING' | 'DEFAMATION' | 'FINANCIAL_SCAM' | 'IDENTITY_THEFT' | 'HARASSMENT';
  notes: string;
  checklist: {
    screenshotsCaptured: boolean;
    profileUrlSaved: boolean;
    networkWarned: boolean;
    officialReportSubmitted: boolean;
    supportTicketId?: string;
    policeReportFiled?: boolean;
  };
  lastUpdated: string;
}

export type ImageMisuseStatus =
  | 'DOCUMENTED'
  | 'HASHED_STOPNCII'
  | 'TAKEDOWN_SUBMITTED'
  | 'CONFIRMED_REMOVED'
  | 'LEGAL_ACTION_FILED';

export interface ImageMisuseCase {
  id: string;
  caseRef: string;
  dateDocumented: string;
  misuseType: 'NON_CONSENSUAL_INTIMATE' | 'DEEPFAKE_SYNTHETIC' | 'DOXXING_WITH_PHOTOS' | 'EXTORTION_SEXTORTION' | 'UNAUTHORIZED_DISTRIBUTION';
  platformDetected: string;
  locationUrl?: string;
  perpetratorKnown: boolean;
  perpetratorHandle?: string;
  hasStopNciiHash: boolean;
  stopNciiCaseNumber?: string;
  status: ImageMisuseStatus;
  notes: string;
  evidenceNotes: string[];
  timeline: { time: string; event: string }[];
}

export interface PrivacyCategoryScore {
  categoryId: string;
  title: string;
  description: string;
  score: number; // 0-100
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  completedTasks: number;
  totalTasks: number;
}

export interface PrivacyAuditTask {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  platform?: string;
  isCompleted: boolean;
  guideUrl?: string;
}

export interface PrivacyAssessment {
  id: string;
  completedAt: string;
  overallScore: number;
  categoryScores: PrivacyCategoryScore[];
  tasks: PrivacyAuditTask[];
}

export type PlaybookType =
  | 'EMAIL_COMPROMISE'
  | 'SOCIAL_TAKEOVER'
  | 'FINANCIAL_BREACH'
  | 'DEVICE_STOLEN'
  | 'CREDENTIAL_LEAK';

export interface RecoveryStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isUrgent: boolean;
  linkUrl?: string;
  linkText?: string;
}

export interface RecoverySession {
  id: string;
  playbookType: PlaybookType;
  title: string;
  targetAccount: string;
  startedAt: string;
  lastActive: string;
  status: 'IN_PROGRESS' | 'RECOVERED' | 'LOCKED_SECURE';
  steps: RecoveryStep[];
  notes: string;
}

export type IncidentCategory =
  | 'HARASSMENT'
  | 'STALKING'
  | 'IMPERSONATION'
  | 'IMAGE_MISUSE'
  | 'PHISHING'
  | 'EXTORTION'
  | 'UNAUTHORIZED_ACCESS'
  | 'OTHER';

export interface IncidentAttachmentMeta {
  id: string;
  filename: string;
  fileType: string;
  fileSizeBytes: number;
  hashMd5?: string;
  storageStatus?: string;
  capturedAt: string;
  description: string;
  sourceUrl?: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  source: string;
}

export interface IncidentRecord {
  id: string;
  caseNumber: string;
  title: string;
  category: IncidentCategory;
  severity: ThreatSeverity;
  status: 'OPEN' | 'INVESTIGATING' | 'REPORTED_TO_AUTHORITIES' | 'ARCHIVED' | 'RESOLVED';
  createdAt: string;
  updatedAt: string;
  suspectInfo?: {
    knownName?: string;
    usernameHandles?: string;
    phoneNumbers?: string;
    ipOrLocationNotes?: string;
  };
  summary: string;
  timeline: IncidentTimelineEvent[];
  attachments: IncidentAttachmentMeta[];
  lawEnforcementReportNumber?: string;
  confidentialNotes: string;
}

export interface AssistantTriageResult {
  recommendedAction: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'ROUTINE';
  immediateSteps: string[];
  recommendedTools: {
    tab: CyberTab;
    title: string;
    reason: string;
  }[];
  helplineResources: {
    name: string;
    contact: string;
    details: string;
  }[];
  comfortMessage: string;
}

export interface CyberStats {
  threatsScannedCount: number;
  activeImpersonationCases: number;
  imageMisuseCases: number;
  privacyScore: number;
  recoverySessionsActive: number;
  totalEvidenceIncidents: number;
  vaultAttachmentsCount: number;
}
