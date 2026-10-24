import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Shield,
  Lock,
  Eye,
  MapPin,
  Key,
  Smartphone,
  Globe,
  Cloud,
  Wifi,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { PrivacyAssessment, PrivacyCategoryScore, PrivacyAuditTask, CyberTab } from '../../types/cyber';
import { cyberApi } from '../../services/cyberApi';

const CATEGORY_ICONS: Record<string, any> = {
  social: Eye,
  location: MapPin,
  auth: Key,
  permissions: Smartphone,
  brokers: Globe,
  cloud: Cloud,
  wifi: Wifi,
  lock: Lock,
};

interface AuraPrivacyViewProps {
  onNavigateTab: (tab: CyberTab) => void;
}

export const AuraPrivacyView: React.FC<AuraPrivacyViewProps> = ({ onNavigateTab }) => {
  const [assessment, setAssessment] = useState<PrivacyAssessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const loadAudit = async () => {
    try {
      setLoading(true);
      const data = await cyberApi.getPrivacyAudit();
      setAssessment(data);
    } catch (err) {
      console.error('Failed to load privacy audit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, []);

  const handleToggleTask = async (task: PrivacyAuditTask) => {
    try {
      setTogglingTaskId(task.id);
      const updated = await cyberApi.togglePrivacyTask(task.id, !task.isCompleted);
      setAssessment(updated);
    } catch (err: any) {
      alert('Error updating task: ' + err.message);
    } finally {
      setTogglingTaskId(null);
    }
  };

  const filteredTasks = assessment?.tasks
    ? activeCategoryFilter === 'all'
      ? assessment.tasks
      : assessment.tasks.filter((t) => t.categoryId === activeCategoryFilter)
    : [];

  const completedCount = assessment?.tasks?.filter((t) => t.isCompleted).length || 0;
  const totalCount = assessment?.tasks?.length || 24;

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F5] border border-[#F5A5BC]/50 text-[#E94F83] text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>AuraPrivacy 8-Category Audit</span>
          </div>
          <h1 className="font-serif-title text-2xl sm:text-3xl font-bold text-[#34232D]">
            Personal Privacy Audit & Hardening
          </h1>
          <p className="text-xs sm:text-sm text-[#866F7A] mt-1">
            Systematically minimize your attack surface across social apps, location tracking, data brokers, and device permissions.
          </p>
        </div>

        <button
          onClick={loadAudit}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-xs font-semibold text-[#866F7A] border border-white/90 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Audit</span>
        </button>
      </div>

      {/* Score Hero Summary */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#FFE7ED] via-[#FFF4F5] to-white border border-white/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#388568]/10 text-[#388568] border border-[#388568]/20">
            Privacy Defense Status
          </span>
          <h2 className="font-serif-title text-2xl font-bold text-[#34232D]">
            {assessment && assessment.overallScore >= 80
              ? 'Hardened Privacy Posture'
              : assessment && assessment.overallScore >= 60
              ? 'Moderate Privacy Protection'
              : 'Action Needed: Elevated Exposure'}
          </h2>
          <p className="text-xs text-[#866F7A] leading-relaxed">
            You have completed <strong>{completedCount}</strong> of <strong>{totalCount}</strong> recommended privacy hardening steps across all 8 security vectors.
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-[10px] font-bold text-[#866F7A] uppercase tracking-wider">
              Overall Score
            </div>
            <div className="font-serif-title text-5xl font-bold text-[#34232D]">
              {assessment ? assessment.overallScore : 78}
              <span className="text-sm font-normal text-[#866F7A]">/100</span>
            </div>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-[#388568] flex items-center justify-center bg-white shadow-sm text-2xl font-bold text-[#388568]">
            {assessment ? `${assessment.overallScore}%` : '78%'}
          </div>
        </div>
      </div>

      {/* 8 Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
            Audit Vector Breakdown (8 Categories)
          </h3>
          <span className="text-xs text-[#866F7A]">Tap category to filter tasks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-[#34232D] text-white border-[#34232D] shadow-sm'
                : 'bg-white/80 hover:bg-white text-[#34232D] border-white/90 shadow-2xs'
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">All Tasks</div>
            <div className="text-sm font-bold mt-1">{totalCount} Steps Total</div>
          </button>

          {assessment?.categoryScores?.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.categoryId] || Shield;
            const isSelected = activeCategoryFilter === cat.categoryId;
            return (
              <button
                key={cat.categoryId}
                onClick={() => setActiveCategoryFilter(cat.categoryId)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#E94F83] text-white border-[#E94F83] shadow-sm'
                    : 'bg-white/80 hover:bg-white text-[#34232D] border-white/90 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#E94F83]'}`} />
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : cat.score >= 80
                        ? 'bg-[#388568]/10 text-[#388568]'
                        : 'bg-[#C88724]/10 text-[#C88724]'
                    }`}
                  >
                    {cat.score}%
                  </span>
                </div>
                <div className="text-xs font-bold mt-1.5 truncate">{cat.title}</div>
                <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#866F7A]'}`}>
                  {cat.completedTasks}/{cat.totalTasks} Done
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Task Checklist */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F5A5BC]/20">
          <div>
            <h3 className="font-serif-title text-lg font-bold text-[#34232D]">
              Hardening Action Items ({filteredTasks.length})
            </h3>
            <p className="text-xs text-[#866F7A]">
              Check items off as you configure them in your settings. Changes persist permanently to your secure database.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleToggleTask(task)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 group ${
                task.isCompleted
                  ? 'bg-[#FFFBF8] border-[#F5A5BC]/30 opacity-75'
                  : 'bg-white hover:bg-[#FFF4F5] border-[#F5A5BC]/40 shadow-2xs hover:shadow-xs'
              }`}
            >
              <input
                type="checkbox"
                checked={task.isCompleted}
                onChange={() => {}} // handled by div click
                className="w-5 h-5 mt-0.5 text-[#E94F83] rounded-md border-[#F5A5BC] focus:ring-[#E94F83] cursor-pointer"
              />

              <div className="space-y-1 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      task.isCompleted ? 'line-through text-[#866F7A]' : 'text-[#34232D]'
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      task.impact === 'HIGH'
                        ? 'bg-[#D83B52]/10 text-[#D83B52]'
                        : 'bg-[#C88724]/10 text-[#C88724]'
                    }`}
                  >
                    {task.impact} Impact
                  </span>
                  {task.platform && (
                    <span className="text-[10px] text-[#866F7A] font-medium">
                      • {task.platform}
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#866F7A] leading-relaxed">
                  {task.description}
                </p>
              </div>

              {togglingTaskId === task.id && (
                <RefreshCw className="w-4 h-4 animate-spin text-[#E94F83] shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
