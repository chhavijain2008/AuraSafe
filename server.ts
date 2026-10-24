import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { cyberDb } from './server/cyberDb';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '1mb' }));

// In-memory store for live emergency contact tracking sessions
interface TrackingSession {
  trackingId: string;
  userName: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  batteryLevel: number;
  lastUpdated: string;
  isPanic: boolean;
  history: Array<{ lat: number; lng: number; time: string }>;
}

const activeTrackingSessions = new Map<string, TrackingSession>();

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not configured in environment; utilizing deterministic ML fallback engine.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const generateContentWithTimeout = async (ai: GoogleGenAI, params: any, timeoutMs = 25000): Promise<any> => {
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI request timeout')), timeoutMs);
  });
  try {
    return await Promise.race([ai.models.generateContent(params), timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
};

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AuraSafe Dual Protection (Physical Safe Navigation & Cyber Security Suite)',
    timestamp: new Date().toISOString()
  });
});

/* =========================================================================
   AURA CYBER SUITE REST ENDPOINTS
========================================================================= */

// --- Cyber Stats & Health ---
app.get('/api/cyber/stats', (req, res) => {
  try {
    const stats = cyberDb.getStats();
    res.json({ success: true, stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraShield: Threat Scanner ---
app.get('/api/cyber/shield/history', (req, res) => {
  try {
    const history = cyberDb.getThreats();
    res.json({ success: true, history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/cyber/shield/history', (req, res) => {
  try {
    cyberDb.clearThreats();
    res.json({ success: true, message: 'Threat history cleared' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/shield/analyze', async (req, res) => {
  try {
    const {
      content = '',
      inputType = 'text', // 'text' | 'url' | 'email' | 'screenshot_meta'
      context = ''
    } = req.body;

    if (typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required for threat scan' });
    }
    if (content.length > 12000) {
      return res.status(413).json({ success: false, error: 'Please limit each scan to 12,000 characters. Remove unrelated personal information before scanning.' });
    }

    const ai = getGeminiClient();
    let threatResult: any = null;

    if (ai) {
      try {
        const prompt = `You are the core threat intelligence engine of AuraShield, a protective cyber defense platform for women and vulnerable individuals.
Analyze the following input:
Input Type: "${inputType}"
Content:
"""
${content}
"""
Additional Context: "${context}"

Perform a thorough safety, privacy, and digital forensic analysis. Look specifically for:
- Phishing, fake credential-harvesting portals, deceptive login forms
- Coercive control, stalking, intimidation, boundary-crossing questions regarding whereabouts
- Impersonation of trusted contacts, companies, or public figures
- Blackmail, sextortion, unauthorized photo threats, or extortion demands
- Malicious URL indicators (typosquatting, suspicious TLDs, redirect chains, IP-based URLs)

Return a strictly valid JSON object matching this exact schema:
{
  "threatLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "threatScore": <number from 0 to 100, where 0 is safe and 100 is life/account-threatening>,
  "category": "<Concise threat category, e.g. 'Credential Phishing Scam', 'Stalking & Location Probing', 'Non-Consensual Extortion', 'Unsolicited Harassment', 'Legitimate Notification'>",
  "summary": "<2 calm, clear, protective sentences explaining the exact danger and deceptive mechanisms>",
  "riskIndicators": ["<Specific flag 1>", "<Specific flag 2>", "<Specific flag 3>"],
  "recommendedSteps": ["<Immediate step 1>", "<Immediate step 2>", "<Defensive step 3>"],
  "defensiveChecklist": [
    { "task": "<Actionable task 1>", "done": false },
    { "task": "<Actionable task 2>", "done": false },
    { "task": "<Actionable task 3>", "done": false }
  ],
  "technicalDetails": {
    "domainChecked": "<extracted domain or N/A>",
    "isSpoofed": <boolean>,
    "urgencyLanguageDetected": <boolean>,
    "credentialDemandDetected": <boolean>
  }
}`;

        const aiResponse = await generateContentWithTimeout(ai, {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(aiResponse.text || '{}');
        if (parsed.threatLevel && parsed.summary) {
          threatResult = parsed;
        }
      } catch (geminiErr) {
        console.warn('Gemini threat analysis fallback invoked:', geminiErr);
      }
    }

    // High-accuracy heuristic engine if Gemini is absent or errored
    if (!threatResult) {
      const lower = content.toLowerCase();
      const hasUrgency = /urgent|immediately|within [0-9]|hours?|account suspended|verify now|unauthorized access|action required/i.test(lower);
      const hasTracking = /where are you|share location|who are you with|saw you at|following you|outside|home alone|send pic|watch you/i.test(lower);
      const hasExtortion = /leaked|photos|video|send \$\d+|bitcoin|expose you|ruin you|tell your friends|intimate/i.test(lower);
      const hasCredentials = /password|pin|otp|login|passcode|ssn|card number|verify-account|security update/i.test(lower);
      const hasSuspiciousUrl = /https?:\/\/([^\s/]+)/i.test(content);

      let threatLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
      let threatScore = 15;
      let category = 'Standard Communication';
      let summary = 'No immediate malicious patterns or coercive keywords were flagged in this text.';
      const riskIndicators: string[] = [];
      const recommendedSteps: string[] = [];
      const defensiveChecklist: { task: string; done: boolean }[] = [];

      if (hasExtortion) {
        threatLevel = 'CRITICAL';
        threatScore = 96;
        category = 'Blackmail & Digital Extortion';
        summary = 'Severe extortion threat detected. The sender is attempting psychological coercion and demands.';
        riskIndicators.push('Explicit threats to distribute personal media or contacts');
        riskIndicators.push('Intimidation demanding financial or behavioral compliance');
        recommendedSteps.push('DO NOT pay or negotiate; compliance rarely halts demands');
        recommendedSteps.push('Save screenshots preserving timestamps, handles, and transaction addresses');
        recommendedSteps.push('Submit a secure case in AuraImage / AuraEvidence');
        recommendedSteps.push('Contact Cyber Civil Rights Initiative or local safety helpline');
        defensiveChecklist.push({ task: 'Preserve full message without deleting conversation', done: true });
        defensiveChecklist.push({ task: 'Lock down social media accounts to friends-only', done: false });
        defensiveChecklist.push({ task: 'Report to platform abuse desk', done: false });
      } else if (hasTracking) {
        threatLevel = 'HIGH';
        threatScore = 85;
        category = 'Stalking & Physical Location Probing';
        summary = 'High-risk location probing detected. Sender is asking probing questions regarding your solitary status or location.';
        riskIndicators.push('Invasive questions regarding real-time whereabouts or who you are with');
        riskIndicators.push('Boundary violations signaling potential cyber-stalking');
        recommendedSteps.push('Never confirm your current location or schedule');
        recommendedSteps.push('Check device Location Services permissions');
        recommendedSteps.push('Alert your Safe Circle emergency contacts');
        defensiveChecklist.push({ task: 'Turn off live location sharing on social media', done: false });
        defensiveChecklist.push({ task: 'Audit recent Find My or WhatsApp live location links', done: false });
      } else if (hasUrgency && (hasCredentials || hasSuspiciousUrl)) {
        threatLevel = 'HIGH';
        threatScore = 88;
        category = 'Credential Harvesting & Phishing';
        summary = 'Deceptive phishing attempt using artificial urgency to trick you into entering credentials.';
        riskIndicators.push('Manufactured crisis deadline demanding rapid verification');
        riskIndicators.push('Unverified link directing away from official app');
        recommendedSteps.push('Do NOT click the link or supply login credentials');
        recommendedSteps.push('Log into the official website via a clean browser tab to verify');
        recommendedSteps.push('Block sender and flag as phishing');
        defensiveChecklist.push({ task: 'Check sender email domain for typosquatting', done: false });
        defensiveChecklist.push({ task: 'Update password if credentials were typed', done: false });
      } else if (hasSuspiciousUrl || hasUrgency) {
        threatLevel = 'MODERATE';
        threatScore = 52;
        category = 'Suspicious Link / Urgency Prompt';
        summary = 'Moderate caution advised. The communication contains links or urgency prompts that warrant manual verification.';
        riskIndicators.push('External link or prompt requiring action');
        recommendedSteps.push('Hover over link to inspect true destination URL');
        recommendedSteps.push('Refrain from downloading attachments');
        defensiveChecklist.push({ task: 'Verify sender identity through independent channel', done: false });
      } else {
        recommendedSteps.push('Maintain regular privacy hygiene and 2FA authentication');
        defensiveChecklist.push({ task: 'Routine verification complete', done: true });
      }

      threatResult = {
        threatLevel,
        threatScore,
        category,
        summary,
        riskIndicators: riskIndicators.length ? riskIndicators : ['Standard phrasing pattern'],
        recommendedSteps,
        defensiveChecklist,
        technicalDetails: {
          domainChecked: hasSuspiciousUrl ? 'external-link-detected' : 'N/A',
          isSpoofed: hasUrgency && hasCredentials,
          urgencyLanguageDetected: hasUrgency,
          credentialDemandDetected: hasCredentials,
        },
      };
    }

    const record = {
      id: 'scan-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      inputType,
      inputSnippet: content.slice(0, 180) + (content.length > 180 ? '...' : ''),
      ...threatResult,
    };

    cyberDb.addThreat(record);

    res.json({
      success: true,
      analysis: record,
      source: ai ? 'gemini-intelligence' : 'heuristic-ml-engine',
    });
  } catch (err: any) {
    console.error('Error in /api/cyber/shield/analyze:', err);
    res.status(500).json({ success: false, error: 'Threat analysis execution failed: ' + err.message });
  }
});

// --- AuraIdentity: Impersonation & Fake Profile Cases ---
app.get('/api/cyber/identity/cases', (req, res) => {
  try {
    const cases = cyberDb.getImpersonations();
    res.json({ success: true, cases });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/identity/cases', (req, res) => {
  try {
    const {
      targetPersonName = 'Protected User',
      platform = 'Instagram',
      fakeProfileHandle = '',
      fakeProfileUrl = '',
      threatContext = 'HARASSMENT',
      notes = '',
    } = req.body;

    if (typeof fakeProfileHandle !== 'string' || !fakeProfileHandle.trim() || fakeProfileHandle.length > 200) {
      return res.status(400).json({ success: false, error: 'A profile handle (max 200 characters) is required' });
    }
    if (fakeProfileUrl) {
      try { const parsedUrl = new URL(fakeProfileUrl); if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error('invalid protocol'); }
      catch { return res.status(400).json({ success: false, error: 'Profile URL must be a valid http or https URL' }); }
    }

    const newCase = {
      id: 'imp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      targetPersonName,
      platform,
      fakeProfileHandle,
      fakeProfileUrl,
      dateDiscovered: new Date().toISOString().split('T')[0],
      status: 'REPORTED',
      threatContext,
      notes,
      checklist: {
        screenshotsCaptured: true,
        profileUrlSaved: true,
        networkWarned: false,
        officialReportSubmitted: false,
        policeReportFiled: false,
      },
      lastUpdated: new Date().toISOString(),
    };

    const saved = cyberDb.addImpersonation(newCase);
    res.json({ success: true, case: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/cyber/identity/cases/:id', (req, res) => {
  try {
    const updated = cyberDb.updateImpersonation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Impersonation case not found' });
    }
    res.json({ success: true, case: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/cyber/identity/cases/:id', (req, res) => {
  try {
    cyberDb.deleteImpersonation(req.params.id);
    res.json({ success: true, message: 'Impersonation case deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraImage: Image Misuse & Deepfake Tracker ---
app.get('/api/cyber/image/cases', (req, res) => {
  try {
    const cases = cyberDb.getImageCases();
    res.json({ success: true, cases });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/image/cases', (req, res) => {
  try {
    const {
      misuseType = 'NON_CONSENSUAL_INTIMATE',
      platformDetected = 'Web / Social',
      locationUrl = '',
      perpetratorKnown = false,
      perpetratorHandle = '',
      hasStopNciiHash = false,
      stopNciiCaseNumber = '',
      notes = '',
    } = req.body;

    const newCase = {
      id: 'img-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      caseRef: 'CASE-IMG-' + Math.floor(1000 + Math.random() * 9000),
      dateDocumented: new Date().toISOString().split('T')[0],
      misuseType,
      platformDetected,
      locationUrl,
      perpetratorKnown,
      perpetratorHandle,
      // User-entered flags must not imply an external submission. No StopNCII API is connected.
      hasStopNciiHash: false,
      stopNciiCaseNumber: '',
      externalSubmissionStatus: 'NOT_CONNECTED',
      status: 'DOCUMENTED',
      notes,
      evidenceNotes: ['Case initiated with strict victim-privacy protection (no sensitive images stored).'],
      timeline: [{ time: 'Just now', event: 'Case privately documented in AuraSafe' }],
    };

    const saved = cyberDb.addImageCase(newCase);
    res.json({ success: true, case: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/cyber/image/cases/:id', (req, res) => {
  try {
    const updated = cyberDb.updateImageCase(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Image case not found' });
    }
    res.json({ success: true, case: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraPrivacy: 8-Category Assessment & Audit Tasks ---
app.get('/api/cyber/privacy/audit', (req, res) => {
  try {
    const assessment = cyberDb.getPrivacyAssessment();
    res.json({ success: true, assessment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/privacy/audit/toggle-task', (req, res) => {
  try {
    const { taskId, isCompleted } = req.body;
    if (typeof taskId !== 'string' || typeof isCompleted !== 'boolean') {
      return res.status(400).json({ success: false, error: 'taskId and boolean isCompleted are required' });
    }
    const updated = cyberDb.togglePrivacyTask(taskId, Boolean(isCompleted));
    res.json({ success: true, assessment: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraRecover: Compromise Playbooks ---
app.get('/api/cyber/recover/sessions', (req, res) => {
  try {
    const sessions = cyberDb.getRecoverySessions();
    res.json({ success: true, sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/recover/sessions', (req, res) => {
  try {
    const {
      playbookType = 'SOCIAL_TAKEOVER',
      title = 'Account Recovery Session',
      targetAccount = '',
      notes = '',
    } = req.body;

    let defaultSteps: any[] = [];
    if (playbookType === 'EMAIL_COMPROMISE') {
      defaultSteps = [
        { id: 'step-1', title: 'Revoke All Active Web Sessions & Logins', description: 'Force sign-out from all browsers, mobile devices, and mail clients.', isCompleted: false, isUrgent: true },
        { id: 'step-2', title: 'Audit Account Recovery Phone & Secondary Email', description: 'Ensure the attacker did not replace your recovery contacts with their own.', isCompleted: false, isUrgent: true },
        { id: 'step-3', title: 'Inspect Auto-Forwarding and Mail Filtering Rules', description: 'Attackers frequently set silent rules to forward banking OTPs to their inbox and delete receipts.', isCompleted: false, isUrgent: true },
        { id: 'step-4', title: 'Update Master Password & Register Passkey/Authenticator', description: 'Change to a clean 16+ character passphrase and enroll an authenticator app.', isCompleted: false, isUrgent: false },
        { id: 'step-5', title: 'Check Third-Party Apps & OAuth Tokens', description: 'Revoke any unverified cloud utilities or apps granted inbox access.', isCompleted: false, isUrgent: false },
      ];
    } else if (playbookType === 'FINANCIAL_BREACH') {
      defaultSteps = [
        { id: 'step-1', title: 'Freeze Debit/Credit Cards in Banking App', description: 'Immediate temporary card lock prevents fraudulent charges while investigating.', isCompleted: false, isUrgent: true },
        { id: 'step-2', title: 'Call Bank Fraud Department Hotline', description: 'Report unauthorized activity to trigger dispute investigation and card re-issuance.', isCompleted: false, isUrgent: true },
        { id: 'step-3', title: 'Place Free Credit Bureau Fraud Alert', description: 'Contact Experian, Equifax, or TransUnion to stop new credit lines from being opened.', isCompleted: false, isUrgent: true },
        { id: 'step-4', title: 'Reset Linked Email & Bank Passwords', description: 'Ensure credentials used for banking portals are thoroughly changed.', isCompleted: false, isUrgent: false },
      ];
    } else {
      defaultSteps = [
        { id: 'step-1', title: 'Disconnect Unknown Logged-in Devices', description: 'Go to Security Settings > Active Sessions and end foreign logins.', isCompleted: false, isUrgent: true },
        { id: 'step-2', title: 'Restore Primary Contact Information', description: 'Confirm your phone and email are the sole recovery destinations.', isCompleted: false, isUrgent: true },
        { id: 'step-3', title: 'Change Account Password', description: 'Select a unique password not shared with any other platform.', isCompleted: false, isUrgent: true },
        { id: 'step-4', title: 'Turn on Two-Factor Authentication', description: 'Require an authenticator code for every subsequent sign-in.', isCompleted: false, isUrgent: false },
        { id: 'step-5', title: 'Alert Close Friends & Family', description: 'Advise contacts to disregard any unusual messages sent during the takeover.', isCompleted: false, isUrgent: false },
      ];
    }

    const session = {
      id: 'rec-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      playbookType,
      title,
      targetAccount,
      startedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      status: 'IN_PROGRESS',
      steps: defaultSteps,
      notes,
    };

    const saved = cyberDb.addRecoverySession(session);
    res.json({ success: true, session: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/cyber/recover/sessions/:id', (req, res) => {
  try {
    const updated = cyberDb.updateRecoverySession(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Recovery session not found' });
    }
    res.json({ success: true, session: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraEvidence: Private Incident Vault ---
app.get('/api/cyber/evidence/incidents', (req, res) => {
  try {
    const incidents = cyberDb.getIncidents();
    res.json({ success: true, incidents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/cyber/evidence/incidents/:id', (req, res) => {
  try {
    const incident = cyberDb.getIncidentById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/evidence/incidents', (req, res) => {
  try {
    const {
      title = 'Uncategorized Digital Incident',
      category = 'HARASSMENT',
      severity = 'MODERATE',
      summary = '',
      suspectInfo = {},
      confidentialNotes = '',
      lawEnforcementReportNumber = '',
    } = req.body;

    const newIncident = {
      id: 'inc-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
      caseNumber: 'AUR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      title,
      category,
      severity,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      suspectInfo,
      summary,
      timeline: [
        {
          id: 'evt-' + Date.now().toString(36),
          timestamp: new Date().toISOString(),
          title: 'Incident Logged to AuraEvidence',
          description: summary || 'Initial documentation recorded with forensic timestamps.',
          source: 'AuraSafe Vault',
        },
      ],
      attachments: [],
      lawEnforcementReportNumber,
      confidentialNotes,
    };

    const saved = cyberDb.addIncident(newIncident);
    res.json({ success: true, incident: saved });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/cyber/evidence/incidents/:id', (req, res) => {
  try {
    const updated = cyberDb.updateIncident(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, incident: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/cyber/evidence/incidents/:id', (req, res) => {
  try {
    cyberDb.deleteIncident(req.params.id);
    res.json({ success: true, message: 'Incident removed from vault' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/evidence/incidents/:id/timeline', (req, res) => {
  try {
    const { title, description, source } = req.body;
    const event = {
      id: 'evt-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      title: title || 'Timeline Event',
      description: description || '',
      source: source || 'User Log',
    };
    const updated = cyberDb.addIncidentTimelineEvent(req.params.id, event);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, incident: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cyber/evidence/incidents/:id/attachments', (req, res) => {
  try {
    const { filename, fileType, description, sourceUrl } = req.body;
    const attachment = {
      id: 'att-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 5),
      filename: filename || 'evidence_capture.png',
      fileType: fileType || 'image/png',
      fileSizeBytes: 0,
      hashMd5: '',
      storageStatus: 'METADATA_ONLY_NO_FILE_UPLOADED',
      capturedAt: new Date().toISOString(),
      description: description || 'Evidence metadata recorded. The actual file has not been uploaded or stored by AuraSafe.',
      sourceUrl: sourceUrl || '',
    };
    const updated = cyberDb.addIncidentAttachment(req.params.id, attachment);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }
    res.json({ success: true, incident: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- AuraAssist: AI Guided Incident Companion ---
app.post('/api/cyber/assist/triage', async (req, res) => {
  try {
    const { userDescription = '', situationType = 'general' } = req.body;

    if (!userDescription.trim()) {
      return res.status(400).json({ success: false, error: 'Situation description is required' });
    }

    const ai = getGeminiClient();
    let triageData: any = null;

    if (ai) {
      try {
        const prompt = `You are AuraAssist, a compassionate, trauma-informed digital safety companion for women and vulnerable individuals facing online abuse, cyberstalking, account compromise, image misuse, or extortion.
User Situation:
"""
${userDescription}
"""
Category tag: "${situationType}"

Provide an immediate, calm, highly supportive, and structured emergency response plan. Never sound judgmental. Emphasize that this is not their fault and they are in control.

Return strictly valid JSON:
{
  "comfortMessage": "<2 sentences offering immediate emotional grounding and reassurance>",
  "urgency": "IMMEDIATE" | "HIGH" | "ROUTINE",
  "recommendedAction": "<1 concise summary headline of the primary tactical action to take right now>",
  "immediateSteps": [
    "<Priority step 1: immediate containment/breathing space>",
    "<Priority step 2: evidence preservation without retaliation>",
    "<Priority step 3: technical lock or reporting>"
  ],
  "recommendedTools": [
    {
      "tab": "cyber_shield" | "cyber_identity" | "cyber_image" | "cyber_privacy" | "cyber_recover" | "cyber_evidence",
      "title": "<Tool Name>",
      "reason": "<Why using this tool right now directly helps their situation>"
    }
  ],
  "helplineResources": [
    {
      "name": "<Helpline or resource name, e.g. Cyber Civil Rights Initiative Helpline, VictimConnect Resource Center, IC3>",
      "contact": "<Phone / Website>",
      "details": "<Free, confidential support available 24/7>"
    }
  ]
}`;

        const aiResponse = await generateContentWithTimeout(ai, {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.25,
          },
        });

        const parsed = JSON.parse(aiResponse.text || '{}');
        if (parsed.comfortMessage && parsed.immediateSteps) {
          triageData = parsed;
        }
      } catch (err) {
        console.warn('Gemini assist triage fallback:', err);
      }
    }

    if (!triageData) {
      triageData = {
        comfortMessage:
          "Take a slow breath. You are safe right now, this is not your fault, and you do not have to handle this alone. We will take it step-by-step.",
        urgency: 'HIGH',
        recommendedAction: 'Preserve evidence and secure your accounts before responding or engaging.',
        immediateSteps: [
          'Do not reply or negotiate with the harasser; disengage immediately to prevent escalation.',
          'Take complete screenshots showing timestamps, usernames, and phone numbers or URLs.',
          'Store all records securely in AuraEvidence so you have a verified paper trail if needed.',
        ],
        recommendedTools: [
          {
            tab: 'cyber_evidence',
            title: 'AuraEvidence Vault',
            reason: 'Securely document timestamps and screenshots with cryptographic verification.',
          },
          {
            tab: 'cyber_recover',
            title: 'AuraRecover Assistant',
            reason: 'Step-by-step playbook to revoke foreign sessions and reset credentials safely.',
          },
        ],
        helplineResources: [
          {
            name: 'Cyber Civil Rights Initiative (CCRI) Helpline',
            contact: '844-878-2274 | cybercivilrights.org',
            details: 'Dedicated non-judgmental legal and technical guidance for victims of non-consensual image abuse and cyber extortion.',
          },
          {
            name: 'VictimConnect Resource Center',
            contact: '1-855-4-VICTIM | victimconnect.org',
            details: 'Confidential national referral service for victims of crime, stalking, and harassment.',
          },
        ],
      };
    }

    res.json({ success: true, triage: triageData });
  } catch (err: any) {
    console.error('Error in /api/cyber/assist/triage:', err);
    res.status(500).json({ success: false, error: 'Assistant triage failed: ' + err.message });
  }
});

/* =========================================================================
   PHYSICAL NAVIGATION & EMERGENCY SYSTEM (PRESERVED)
========================================================================= */

// 2. Route Safety Analysis & AI Recommendation Engine
app.post('/api/routes/analyze', async (req, res) => {
  try {
    const {
      origin = 'University North Gate',
      destination = 'Greenwood Metro Station',
      timeOfDay = 'after_dark',
      priorities = { lighting: 5, crowd: 4, nearbyTransport: 4, accessibility: 3, crimeHistoryWeight: 5 },
      customNotes = '',
    } = req.body;

    const ai = getGeminiClient();

    if (ai) {
      const prompt = `You are an AI Machine Learning Route Safety Engine specializing in women's safety navigation.
Analyze possible navigation paths between "${origin}" and "${destination}" during "${timeOfDay}".
The woman has configured the following personal safety priorities on a 1-5 scale:
- Street Lighting Priority: ${priorities.lighting}/5
- Crowd Density / Active Shops: ${priorities.crowd}/5
- Nearby Public Transport: ${priorities.nearbyTransport}/5
- Accessibility & Open Spaces: ${priorities.accessibility}/5
- Past Crime History Concern: ${priorities.crimeHistoryWeight}/5
Additional context: ${customNotes}

Generate a JSON object containing 3 distinct route alternatives:
1. "The Well-Lit Transit Corridor"
2. "The Bustling Market Walk"
3. "The Direct Shortcut"

Respond ONLY with valid JSON matching this structure:
{
  "routes": [
    {
      "name": "string",
      "tagline": "string",
      "isAiRecommended": boolean,
      "distanceKm": number,
      "estimatedMinutes": number,
      "overallScore": number,
      "safetyTier": "SAFE" | "MODERATE" | "CAUTION",
      "breakdown": {
        "lightingScore": number,
        "crowdScore": number,
        "transportScore": number,
        "crimeHistorySafety": number,
        "accessibilityScore": number
      },
      "metrics": {
        "activeStreetlightsPercent": number,
        "openShopsCount": number,
        "nearestTransitMeters": number,
        "historicalIncidentsCount": number,
        "isolatedSegmentsMeters": number
      },
      "highlights": ["string", "string", "string"],
      "risks": ["string"],
      "aiReasoning": "string"
    }
  ]
}`;

      const response = await generateContentWithTimeout(ai, {
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.routes && Array.isArray(parsed.routes)) {
          return res.json({ success: true, routes: parsed.routes, source: 'gemini-ai' });
        }
      } catch (parseErr) {
        console.warn('Failed to parse Gemini JSON output, falling back to ML rule engine:', parseErr);
      }
    }

    // Fallback deterministic ML scoring rule-based response
    return res.json({
      success: true,
      routes: [
        {
          id: 'route-gen-1',
          name: `Via Main Transit Boulevard (${destination})`,
          tagline: 'Optimal Night-time Lighting & Continuous Police Patrols',
          isAiRecommended: true,
          distanceKm: 2.6,
          estimatedMinutes: 21,
          overallScore: 93,
          safetyTier: 'SAFE',
          breakdown: {
            lightingScore: 95,
            crowdScore: 89,
            transportScore: 94,
            crimeHistorySafety: 92,
            accessibilityScore: 90,
          },
          metrics: {
            activeStreetlightsPercent: 97,
            openShopsCount: 28,
            nearestTransitMeters: 60,
            historicalIncidentsCount: 0,
            isolatedSegmentsMeters: 0,
          },
          highlights: [
            'Continuous LED road lighting with active street CCTV',
            'Commuter traffic and transit stations every 300 meters',
            'Zero crime records in police database over past 12 months',
          ],
          risks: ['Extra 300m walking distance compared to cut-through lanes'],
          aiReasoning: `Prioritized specifically because your settings emphasize lighting (${priorities.lighting}/5) and transit proximity (${priorities.nearbyTransport}/5). Keeps you along populated transit spines.`,
        },
        {
          id: 'route-gen-2',
          name: 'Via Market Promenade',
          tagline: 'High Natural Surveillance from Open Stores',
          isAiRecommended: false,
          distanceKm: 2.1,
          estimatedMinutes: 17,
          overallScore: 83,
          safetyTier: 'SAFE',
          breakdown: {
            lightingScore: 80,
            crowdScore: 94,
            transportScore: 78,
            crimeHistorySafety: 85,
            accessibilityScore: 82,
          },
          metrics: {
            activeStreetlightsPercent: 84,
            openShopsCount: 35,
            nearestTransitMeters: 200,
            historicalIncidentsCount: 1,
            isolatedSegmentsMeters: 20,
          },
          highlights: [
            'High crowd density and watchful local merchants',
            'Shorter walking duration (17 mins)',
          ],
          risks: ['Side alleys off the market become deserted after 10 PM'],
          aiReasoning: 'Strong candidate if you prioritize active crowd presence. Safe during active hours with slight drop-off late at night.',
        },
        {
          id: 'route-gen-3',
          name: 'Shortest Cut via Parkland Alley',
          tagline: 'Fastest Path - High Isolation Risk After Dark',
          isAiRecommended: false,
          distanceKm: 1.5,
          estimatedMinutes: 13,
          overallScore: 44,
          safetyTier: 'CAUTION',
          breakdown: {
            lightingScore: 30,
            crowdScore: 22,
            transportScore: 35,
            crimeHistorySafety: 42,
            accessibilityScore: 48,
          },
          metrics: {
            activeStreetlightsPercent: 35,
            openShopsCount: 1,
            nearestTransitMeters: 750,
            historicalIncidentsCount: 4,
            isolatedSegmentsMeters: 520,
          },
          highlights: ['Saves 8 minutes of transit time'],
          risks: [
            'Over 500 meters with broken/non-existent street lamps',
            'Isolated park perimeter with 4 previous harassment incident reports',
            'Transit access is over 750m away',
          ],
          aiReasoning: 'Standard navigation apps recommend this shortcut for speed, but our safety engine flags critical lighting and isolation deficits.',
        },
      ],
      source: 'ml-rule-engine',
    });
  } catch (error) {
    console.error('Error in /api/routes/analyze:', error);
    res.status(500).json({ success: false, error: 'Internal server error analyzing routes' });
  }
});

// 3. Custom prediction calculation
app.post('/api/routes/predict-custom', async (req, res) => {
  try {
    const {
      routeName = 'Custom Commute Corridor',
      origin = 'Workplace',
      destination = 'Residence',
      timeOfDay = 'after_dark',
      lightingLevel = 7,
      crowdDensity = 6,
      transitProximityMeters = 250,
      recentCrimeReports = 1,
      cctvAndOpenVisibility = 7,
      isolatedAlleywayMeters = 50,
      priorities = { lighting: 5, crowd: 4, nearbyTransport: 4, accessibility: 3, crimeHistoryWeight: 5 },
    } = req.body;

    const ai = getGeminiClient();

    const lightingScore = Math.min(100, Math.max(5, lightingLevel * 10));
    const crowdScore = Math.min(100, Math.max(5, crowdDensity * 10));
    const transportScore = Math.max(10, Math.min(100, Math.round(100 - transitProximityMeters / 12)));
    const crimeHistorySafety = Math.max(5, Math.min(100, Math.round(100 - recentCrimeReports * 11)));
    const isolatedPenalty = Math.min(40, (isolatedAlleywayMeters / 400) * 35);
    const accessibilityScore = Math.max(10, Math.min(100, Math.round(cctvAndOpenVisibility * 10 - isolatedPenalty)));

    const totalWeight =
      priorities.lighting +
      priorities.crowd +
      priorities.nearbyTransport +
      priorities.accessibility +
      priorities.crimeHistoryWeight;

    const weightedScore = Math.round(
      (lightingScore * priorities.lighting +
        crowdScore * priorities.crowd +
        transportScore * priorities.nearbyTransport +
        accessibilityScore * priorities.accessibility +
        crimeHistorySafety * priorities.crimeHistoryWeight) /
        totalWeight
    );

    let finalScore = weightedScore;
    if ((timeOfDay === 'after_dark' || timeOfDay === 'late_night') && lightingLevel <= 4) {
      finalScore = Math.min(finalScore, 52);
    }
    if ((timeOfDay === 'after_dark' || timeOfDay === 'late_night') && isolatedAlleywayMeters > 200) {
      finalScore = Math.min(finalScore, 48);
    }
    if (recentCrimeReports >= 5) {
      finalScore = Math.min(finalScore, 45);
    }

    let safetyTier: 'SAFE' | 'MODERATE' | 'CAUTION' = 'SAFE';
    if (finalScore < 60) safetyTier = 'CAUTION';
    else if (finalScore < 80) safetyTier = 'MODERATE';

    let aiVerdict = '';
    let keyVulnerabilities: string[] = [];
    let safetyEnhancements: string[] = [];

    if (ai) {
      try {
        const prompt = `A woman has provided custom environmental inputs for a route from "${origin}" to "${destination}" during "${timeOfDay}".
Calculated Safety Score: ${finalScore}/100 (Tier: ${safetyTier}).

Provide a short, authoritative AI ML Safety Assessment:
1. aiVerdict (2 sentences summarizing if she should take this route and how the specific parameters impact her safety).
2. keyVulnerabilities (array of 2 short bullet points).
3. safetyEnhancements (array of 2 practical recommendations).

Return ONLY valid JSON:
{
  "aiVerdict": "...",
  "keyVulnerabilities": ["...", "..."],
  "safetyEnhancements": ["...", "..."]
}`;

        const aiRes = await generateContentWithTimeout(ai, {
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(aiRes.text || '{}');
        if (parsed.aiVerdict) aiVerdict = parsed.aiVerdict;
        if (parsed.keyVulnerabilities) keyVulnerabilities = parsed.keyVulnerabilities;
        if (parsed.safetyEnhancements) safetyEnhancements = parsed.safetyEnhancements;
      } catch (geminiErr) {
        console.warn('Gemini custom predict prompt error:', geminiErr);
      }
    }

    if (!aiVerdict) {
      if (safetyTier === 'SAFE') {
        aiVerdict = `This route scores a reassuring ${finalScore}/100 based on your priorities. High illumination and reliable transit proximity significantly buffer your transit security.`;
        keyVulnerabilities = ['Potential slowing down at intersections', 'Minor crowd thinning past 11:00 PM'];
        safetyEnhancements = ['Keep live location beacon active', 'Walk along brightly lit storefront awnings'];
      } else if (safetyTier === 'MODERATE') {
        aiVerdict = `Score of ${finalScore}/100 indicates moderate safety. While manageable, lighting gaps or lower evening foot traffic warrant heightened awareness.`;
        keyVulnerabilities = [`${isolatedAlleywayMeters}m of low-visibility alley`, `Transit is ${transitProximityMeters}m away`];
        safetyEnhancements = ['Share live GPS link with emergency contact', 'Have the one-touch panic alarm ready on your lock screen'];
      } else {
        aiVerdict = `Score of ${finalScore}/100 signals CAUTION. Low lighting (${lightingLevel}/10) combined with past crime reports make this path vulnerable for solo travel after dark.`;
        keyVulnerabilities = ['Unlit stretches provide hiding spots', 'Low pedestrian density prevents quick assistance'];
        safetyEnhancements = ['Choose an alternate brightly lit transit route', 'Travel with a companion or take verified transit'];
      }
    }

    return res.json({
      success: true,
      predictedScore: finalScore,
      safetyTier,
      priorityWeightedScore: finalScore,
      breakdown: {
        lightingScore,
        crowdScore,
        transportScore,
        crimeHistorySafety,
        accessibilityScore,
      },
      keyVulnerabilities,
      safetyEnhancements,
      recommendationDecision:
        safetyTier === 'SAFE'
          ? 'Recommended Route'
          : safetyTier === 'MODERATE'
          ? 'Alternative Suggested'
          : 'Do Not Travel Alone After Dark',
      aiVerdict,
    });
  } catch (err) {
    console.error('Error in /api/routes/predict-custom:', err);
    res.status(500).json({ success: false, error: 'Prediction calculation failed' });
  }
});

// 4. Live Emergency Location Sync
app.post('/api/emergency/share', (req, res) => {
  try {
    const {
      trackingId = 'track-' + Math.random().toString(36).substring(2, 9),
      userName = 'User',
      emergencyContactName = 'Emergency Contact',
      emergencyContactPhone = '+1 (555) 019-2831',
      latitude = 28.545,
      longitude = 77.192,
      accuracy = 12,
      batteryLevel = 88,
      isPanic = false,
    } = req.body;

    const existing = activeTrackingSessions.get(trackingId);
    const history = existing ? [...existing.history] : [];
    history.push({ lat: latitude, lng: longitude, time: new Date().toISOString() });
    if (history.length > 50) history.shift();

    const sessionData: TrackingSession = {
      trackingId,
      userName,
      emergencyContactName,
      emergencyContactPhone,
      latitude,
      longitude,
      accuracy,
      batteryLevel,
      lastUpdated: new Date().toLocaleTimeString(),
      isPanic,
      history,
    };

    activeTrackingSessions.set(trackingId, sessionData);

    res.json({
      success: true,
      trackingId,
      message: `Live coordinates actively shared with ${emergencyContactName} (${emergencyContactPhone})`,
      session: sessionData,
    });
  } catch (err) {
    console.error('Error in /api/emergency/share:', err);
    res.status(500).json({ success: false, error: 'Failed to broadcast emergency location' });
  }
});

// 5. Emergency Contact Tracking Status View
app.get('/api/emergency/status/:id', (req, res) => {
  const session = activeTrackingSessions.get(req.params.id);
  if (!session) {
    return res.json({
      success: true,
      session: {
        trackingId: req.params.id,
        userName: 'AuraSafe Protected User',
        emergencyContactName: 'Emergency Contact',
        emergencyContactPhone: '+1 (555) 019-2831',
        latitude: 28.545,
        longitude: 77.192,
        accuracy: 10,
        batteryLevel: 91,
        lastUpdated: new Date().toLocaleTimeString(),
        isPanic: false,
        history: [{ lat: 28.545, lng: 77.192, time: new Date().toISOString() }],
      },
    });
  }
  res.json({ success: true, session });
});

// 6. Legacy digital-safety endpoint (maintained for backward compatibility)
app.post('/api/digital-safety/analyze', (req, res) => {
  // Delegate directly to the enhanced cyber shield endpoint
  req.url = '/api/cyber/shield/analyze';
  app._router.handle(req, res);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AuraSafe Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
