import fs from 'fs';
import path from 'path';

export interface CyberDbData {
  threats: Array<any>;
  impersonations: Array<any>;
  imageMisuseCases: Array<any>;
  privacyAssessment: any;
  recoverySessions: Array<any>;
  incidents: Array<any>;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'cyber_db.json');

// Default initial seed data to give the user immediate interactive data
const SEED_DATA: CyberDbData = {
  threats: [],
  impersonations: [],
  imageMisuseCases: [],
  privacyAssessment: {
    id: 'assessment-latest',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    overallScore: 0,
    categoryScores: [
      {
        categoryId: 'social',
        title: 'Social Media Footprint',
        description: 'Profile discoverability, search indexing, and tag permissions.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 4
      },
      {
        categoryId: 'location',
        title: 'Location & Geo-tagging',
        description: 'EXIF metadata in photos, live sharing, and check-in history.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 4
      },
      {
        categoryId: 'auth',
        title: 'Authentication & Passkeys',
        description: '2FA via Authenticator, passkeys, and password uniqueness.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 3
      },
      {
        categoryId: 'permissions',
        title: 'App Device Permissions',
        description: 'Microphone, background location, and camera access audits.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 3
      },
      {
        categoryId: 'brokers',
        title: 'Data Brokers & People Search',
        description: 'Public directory listings with phone numbers and home addresses.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 3
      },
      {
        categoryId: 'cloud',
        title: 'Cloud Albums & Sharing Links',
        description: 'Public Google Drive / iCloud album links and guest access.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 3
      },
      {
        categoryId: 'wifi',
        title: 'Network & Public Wi-Fi',
        description: 'DNS privacy, encrypted Wi-Fi networks, and VPN utilization.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 2
      },
      {
        categoryId: 'lock',
        title: 'Emergency Digital Lockdown',
        description: 'Trusted contact recovery, legacy access, and rapid device wipe.',
        score: 0,
        status: 'NEEDS_ATTENTION',
        completedTasks: 0,
        totalTasks: 2
      }
    ],
    tasks: [
      {
        id: 'task-1',
        categoryId: 'social',
        title: 'Disable search engine indexing on Facebook and LinkedIn',
        description: 'Prevent search engines outside the platforms from linking to your profile.',
        impact: 'HIGH',
        platform: 'Meta / LinkedIn',
        isCompleted: false
      },
      {
        id: 'task-2',
        categoryId: 'social',
        title: 'Review and approve photo tags before they appear on profile',
        description: 'Stop associates or strangers from tagging your location or profile.',
        impact: 'MEDIUM',
        platform: 'Instagram',
        isCompleted: false
      },
      {
        id: 'task-3',
        categoryId: 'social',
        title: 'Set Instagram account to Private',
        description: 'Ensure only approved followers can see stories and posts.',
        impact: 'HIGH',
        platform: 'Instagram',
        isCompleted: false
      },
      {
        id: 'task-4',
        categoryId: 'social',
        title: 'Audit third-party connected apps & OAuth tokens',
        description: 'Revoke old games or quiz tools that have read permissions on your profile.',
        impact: 'HIGH',
        platform: 'Google / Meta',
        isCompleted: false
      },
      {
        id: 'task-5',
        categoryId: 'location',
        title: 'Strip EXIF GPS tags from shared photos',
        description: 'Ensure images posted online do not embed longitude and latitude.',
        impact: 'HIGH',
        platform: 'iOS / Android',
        isCompleted: false
      },
      {
        id: 'task-6',
        categoryId: 'location',
        title: 'Set Location Services to "While Using" only',
        description: 'Never grant "Always Allow" location access to social or shopping apps.',
        impact: 'HIGH',
        platform: 'System Settings',
        isCompleted: false
      },
      {
        id: 'task-7',
        categoryId: 'location',
        title: 'Turn off Google Maps Timeline location history sharing',
        description: 'Avoid public links or household device sharing of visited places.',
        impact: 'MEDIUM',
        platform: 'Google Account',
        isCompleted: false
      },
      {
        id: 'task-8',
        categoryId: 'location',
        title: 'Review Find My / Live Location circle members',
        description: 'Prune past contacts who no longer need permanent location visibility.',
        impact: 'HIGH',
        platform: 'Apple / Android',
        isCompleted: false
      },
      {
        id: 'task-9',
        categoryId: 'auth',
        title: 'Upgrade from SMS 2FA to Hardware Security Key or Authenticator',
        description: 'Defend against SIM-swapping attacks by removing SMS OTP reliance.',
        impact: 'HIGH',
        platform: 'All Accounts',
        isCompleted: false
      },
      {
        id: 'task-10',
        categoryId: 'auth',
        title: 'Create unique 16+ character password on Master Email',
        description: 'Your recovery email is the keys to the castle; keep it completely unique.',
        impact: 'HIGH',
        platform: 'Primary Email',
        isCompleted: false
      },
      {
        id: 'task-11',
        categoryId: 'auth',
        title: 'Generate offline backup emergency recovery codes',
        description: 'Print or securely store 10 one-time recovery codes for lockout scenarios.',
        impact: 'HIGH',
        platform: 'Google / Apple',
        isCompleted: false
      },
      {
        id: 'task-12',
        categoryId: 'permissions',
        title: 'Audit microphone and camera permissions for unused apps',
        description: 'Revoke sensory permissions from ride-share, food delivery, and retail apps.',
        impact: 'HIGH',
        platform: 'System Settings',
        isCompleted: false
      },
      {
        id: 'task-13',
        categoryId: 'permissions',
        title: 'Disable Bluetooth and AirDrop when in crowded transit corridors',
        description: 'Prevent unwanted AirDrop spam and Bluetooth proximity beacons.',
        impact: 'MEDIUM',
        platform: 'Device Control Center',
        isCompleted: false
      },
      {
        id: 'task-14',
        categoryId: 'permissions',
        title: 'Check Local Network permissions on iOS / Android',
        description: 'Block apps from scanning devices on your home or hotel Wi-Fi.',
        impact: 'MEDIUM',
        platform: 'Privacy Settings',
        isCompleted: false
      },
      {
        id: 'task-15',
        categoryId: 'brokers',
        title: 'Submit removal requests on FastPeopleSearch & TruePeopleSearch',
        description: 'Request deletion of your residential address and family relationships.',
        impact: 'HIGH',
        platform: 'People Search',
        isCompleted: false
      },
      {
        id: 'task-16',
        categoryId: 'brokers',
        title: 'Opt-out of Whitepages directory listing',
        description: 'Remove public phone number lookup.',
        impact: 'HIGH',
        platform: 'Whitepages',
        isCompleted: false
      },
      {
        id: 'task-17',
        categoryId: 'brokers',
        title: 'Remove public voter registration address lookup where state law permits',
        description: 'Submit confidential voter request if experiencing stalking or threats.',
        impact: 'MEDIUM',
        platform: 'State Registrar',
        isCompleted: false
      },
      {
        id: 'task-18',
        categoryId: 'cloud',
        title: 'Audit shared Google Drive links set to "Anyone with the link"',
        description: 'Change open permissions to restricted individual emails only.',
        impact: 'HIGH',
        platform: 'Google Drive',
        isCompleted: false
      },
      {
        id: 'task-19',
        categoryId: 'cloud',
        title: 'Turn off shared family album public web links',
        description: 'Ensure photo streams cannot be reached via random web URLs.',
        impact: 'HIGH',
        platform: 'iCloud / Photos',
        isCompleted: false
      },
      {
        id: 'task-20',
        categoryId: 'cloud',
        title: 'Enable multi-factor approval for new cloud backups',
        description: 'Prevent silent restoration of your backups onto foreign devices.',
        impact: 'MEDIUM',
        platform: 'Cloud Storage',
        isCompleted: false
      },
      {
        id: 'task-21',
        categoryId: 'wifi',
        title: 'Enable Private Wi-Fi MAC Address randomization',
        description: 'Stop commercial venue Wi-Fi networks from tracking your device across visits.',
        impact: 'MEDIUM',
        platform: 'Network Settings',
        isCompleted: false
      },
      {
        id: 'task-22',
        categoryId: 'wifi',
        title: 'Use Encrypted DNS over HTTPS (DoH) / Cloudflare 1.1.1.1',
        description: 'Shield website lookup queries from snooping on public hotspot networks.',
        impact: 'MEDIUM',
        platform: 'System / Browser',
        isCompleted: false
      },
      {
        id: 'task-23',
        categoryId: 'lock',
        title: 'Set up Account Recovery Contact with trusted Safe Circle member',
        description: 'Designate a trusted loved one who can verify your identity if locked out.',
        impact: 'HIGH',
        platform: 'Apple / Google Account',
        isCompleted: false
      },
      {
        id: 'task-24',
        categoryId: 'lock',
        title: 'Enable remote wipe via Find My / Find My Device',
        description: 'Guarantee you can erase photos and passwords if your physical phone is taken.',
        impact: 'HIGH',
        platform: 'Device Security',
        isCompleted: false
      }
    ]
  },
  recoverySessions: [],
  incidents: []
};

class CyberDatabase {
  private inMemoryData: CyberDbData;
  private isLoaded: boolean = false;

  constructor() {
    this.inMemoryData = JSON.parse(JSON.stringify(SEED_DATA));
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        const savedAudit = parsed.privacyAssessment || JSON.parse(JSON.stringify(SEED_DATA.privacyAssessment));
        // Older builds shipped a pre-completed demo audit. Reset that built-in example once so scores reflect user actions.
        if (savedAudit.id === 'assessment-latest' && !savedAudit.assessmentType) {
          (savedAudit.tasks || []).forEach((task: any) => { task.isCompleted = false; });
          savedAudit.overallScore = 0;
          savedAudit.assessmentType = 'SELF_REPORTED_CHECKLIST';
        }
        this.inMemoryData = {
          threats: (parsed.threats || []).filter((x: any) => !String(x.id || '').startsWith('scan-init-')),
          impersonations: (parsed.impersonations || []).filter((x: any) => !String(x.id || '').startsWith('imp-case-')),
          imageMisuseCases: (parsed.imageMisuseCases || []).filter((x: any) => !String(x.id || '').startsWith('img-case-')),
          privacyAssessment: savedAudit,
          recoverySessions: (parsed.recoverySessions || []).filter((x: any) => !String(x.id || '').startsWith('rec-session-')),
          incidents: (parsed.incidents || []).filter((x: any) => !['inc-001'].includes(String(x.id || ''))),
        };
      } else {
        this.saveSync();
      }
      // The audit is a self-reported checklist, not a device scan. Derive scores only from saved task completions.
      const audit = this.inMemoryData.privacyAssessment;
      if (audit?.tasks && audit?.categoryScores) {
        for (const category of audit.categoryScores) {
          const categoryTasks = audit.tasks.filter((task: any) => task.categoryId === category.categoryId);
          const completed = categoryTasks.filter((task: any) => task.isCompleted).length;
          category.completedTasks = completed;
          category.totalTasks = categoryTasks.length;
          category.score = categoryTasks.length ? Math.round(completed / categoryTasks.length * 100) : 0;
          category.status = category.score >= 80 ? 'EXCELLENT' : category.score >= 60 ? 'GOOD' : 'NEEDS_ATTENTION';
        }
        const total = audit.tasks.length;
        audit.overallScore = total ? Math.round(audit.tasks.filter((task: any) => task.isCompleted).length / total * 100) : 0;
        audit.assessmentType = 'SELF_REPORTED_CHECKLIST';
      }
      this.saveSync();
      this.isLoaded = true;
    } catch (err) {
      console.warn('Notice: initialized memory fallback for cyber database:', err);
      this.inMemoryData = JSON.parse(JSON.stringify(SEED_DATA));
      this.isLoaded = true;
    }
  }

  private saveSync() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tempPath = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(this.inMemoryData, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving cyber database to file:', err);
    }
  }

  // --- STATS ---
  public getStats() {
    const activeImpersonations = this.inMemoryData.impersonations.filter(
      (c) => c.status !== 'RESOLVED'
    ).length;
    const activeRecoveries = this.inMemoryData.recoverySessions.filter(
      (r) => r.status === 'IN_PROGRESS'
    ).length;
    const totalEvidence = this.inMemoryData.incidents.length;
    const totalAttachments = this.inMemoryData.incidents.reduce(
      (acc, inc) => acc + (inc.attachments?.length || 0),
      0
    );

    return {
      threatsScannedCount: this.inMemoryData.threats.length,
      activeImpersonationCases: activeImpersonations,
      imageMisuseCases: this.inMemoryData.imageMisuseCases.length,
      privacyScore: this.inMemoryData.privacyAssessment?.overallScore || 78,
      recoverySessionsActive: activeRecoveries,
      totalEvidenceIncidents: totalEvidence,
      vaultAttachmentsCount: totalAttachments,
      dataMode: 'LOCAL_FILE_STORAGE',
      privacyScoreType: 'SELF_REPORTED_CHECKLIST',
      externalReportsConnected: false,
    };
  }

  // --- THREATS / SHIELD ---
  public getThreats() {
    return [...this.inMemoryData.threats].reverse();
  }

  public addThreat(threat: any) {
    this.inMemoryData.threats.push(threat);
    this.saveSync();
    return threat;
  }

  public clearThreats() {
    this.inMemoryData.threats = [];
    this.saveSync();
  }

  // --- IMPERSONATION / IDENTITY ---
  public getImpersonations() {
    return [...this.inMemoryData.impersonations];
  }

  public addImpersonation(item: any) {
    this.inMemoryData.impersonations.unshift(item);
    this.saveSync();
    return item;
  }

  public updateImpersonation(id: string, updates: Partial<any>) {
    const idx = this.inMemoryData.impersonations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.inMemoryData.impersonations[idx] = {
        ...this.inMemoryData.impersonations[idx],
        ...updates,
        lastUpdated: new Date().toISOString(),
      };
      this.saveSync();
      return this.inMemoryData.impersonations[idx];
    }
    return null;
  }

  public deleteImpersonation(id: string) {
    this.inMemoryData.impersonations = this.inMemoryData.impersonations.filter(
      (c) => c.id !== id
    );
    this.saveSync();
    return true;
  }

  // --- IMAGE MISUSE ---
  public getImageCases() {
    return [...this.inMemoryData.imageMisuseCases];
  }

  public addImageCase(item: any) {
    this.inMemoryData.imageMisuseCases.unshift(item);
    this.saveSync();
    return item;
  }

  public updateImageCase(id: string, updates: Partial<any>) {
    const idx = this.inMemoryData.imageMisuseCases.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.inMemoryData.imageMisuseCases[idx] = {
        ...this.inMemoryData.imageMisuseCases[idx],
        ...updates,
      };
      this.saveSync();
      return this.inMemoryData.imageMisuseCases[idx];
    }
    return null;
  }

  // --- PRIVACY AUDIT ---
  public getPrivacyAssessment() {
    return this.inMemoryData.privacyAssessment;
  }

  public updatePrivacyAssessment(newAssessment: any) {
    this.inMemoryData.privacyAssessment = newAssessment;
    this.saveSync();
    return this.inMemoryData.privacyAssessment;
  }

  public togglePrivacyTask(taskId: string, isCompleted: boolean) {
    const tasks = this.inMemoryData.privacyAssessment?.tasks || [];
    const task = tasks.find((t: any) => t.id === taskId);
    if (task) {
      task.isCompleted = isCompleted;

      // recalculate category score & overall
      const categoryTasks = tasks.filter((t: any) => t.categoryId === task.categoryId);
      const doneCategoryTasks = categoryTasks.filter((t: any) => t.isCompleted).length;
      const categoryRatio = categoryTasks.length > 0 ? (doneCategoryTasks / categoryTasks.length) * 100 : 100;

      const catScoreObj = this.inMemoryData.privacyAssessment.categoryScores.find(
        (c: any) => c.categoryId === task.categoryId
      );
      if (catScoreObj) {
        catScoreObj.completedTasks = doneCategoryTasks;
        catScoreObj.score = Math.round(categoryRatio);
        catScoreObj.status =
          catScoreObj.score >= 80 ? 'EXCELLENT' : catScoreObj.score >= 70 ? 'GOOD' : 'NEEDS_ATTENTION';
      }

      // overall score
      const totalTasks = tasks.length;
      const totalDone = tasks.filter((t: any) => t.isCompleted).length;
      this.inMemoryData.privacyAssessment.overallScore = Math.round((totalDone / totalTasks) * 100);
      this.inMemoryData.privacyAssessment.completedAt = new Date().toISOString();

      this.saveSync();
    }
    return this.inMemoryData.privacyAssessment;
  }

  // --- RECOVERY PLAYBOOKS ---
  public getRecoverySessions() {
    return [...this.inMemoryData.recoverySessions];
  }

  public addRecoverySession(session: any) {
    this.inMemoryData.recoverySessions.unshift(session);
    this.saveSync();
    return session;
  }

  public updateRecoverySession(id: string, updates: Partial<any>) {
    const idx = this.inMemoryData.recoverySessions.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.inMemoryData.recoverySessions[idx] = {
        ...this.inMemoryData.recoverySessions[idx],
        ...updates,
        lastActive: new Date().toISOString(),
      };
      this.saveSync();
      return this.inMemoryData.recoverySessions[idx];
    }
    return null;
  }

  // --- EVIDENCE INCIDENTS ---
  public getIncidents() {
    return [...this.inMemoryData.incidents];
  }

  public getIncidentById(id: string) {
    return this.inMemoryData.incidents.find((i) => i.id === id) || null;
  }

  public addIncident(incident: any) {
    this.inMemoryData.incidents.unshift(incident);
    this.saveSync();
    return incident;
  }

  public updateIncident(id: string, updates: Partial<any>) {
    const idx = this.inMemoryData.incidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      this.inMemoryData.incidents[idx] = {
        ...this.inMemoryData.incidents[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveSync();
      return this.inMemoryData.incidents[idx];
    }
    return null;
  }

  public deleteIncident(id: string) {
    this.inMemoryData.incidents = this.inMemoryData.incidents.filter((i) => i.id !== id);
    this.saveSync();
    return true;
  }

  public addIncidentTimelineEvent(incidentId: string, event: any) {
    const inc = this.inMemoryData.incidents.find((i) => i.id === incidentId);
    if (inc) {
      if (!inc.timeline) inc.timeline = [];
      inc.timeline.push(event);
      inc.updatedAt = new Date().toISOString();
      this.saveSync();
      return inc;
    }
    return null;
  }

  public addIncidentAttachment(incidentId: string, attachment: any) {
    const inc = this.inMemoryData.incidents.find((i) => i.id === incidentId);
    if (inc) {
      if (!inc.attachments) inc.attachments = [];
      inc.attachments.push(attachment);
      inc.updatedAt = new Date().toISOString();
      this.saveSync();
      return inc;
    }
    return null;
  }
}

export const cyberDb = new CyberDatabase();
