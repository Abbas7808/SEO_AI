import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Milestone,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  Filter,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Globe,
  Layers,
  Code2,
  AlertCircle,
  ExternalLink,
  Search,
  ListTodo
} from 'lucide-react';
import { auditApi } from '../services/api';
import ScoreBadge from '../components/common/ScoreBadge';

export default function RoadmapPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryAuditId = searchParams.get('auditId');

  const [auditsList, setAuditsList] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(queryAuditId || '');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & State
  const [selectedPhase, setSelectedPhase] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTask, setExpandedTask] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedExport, setCopiedExport] = useState(false);

  // User interactive task status stored locally for persistence
  const [taskStatuses, setTaskStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('seo_roadmap_status');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save task statuses to localStorage
  const updateTaskStatus = (taskId, newStatus) => {
    const updated = { ...taskStatuses, [taskId]: newStatus };
    setTaskStatuses(updated);
    try {
      localStorage.setItem('seo_roadmap_status', JSON.stringify(updated));
    } catch (e) {}
  };

  // 1. Load Audits List for selector
  useEffect(() => {
    async function loadAudits() {
      try {
        const res = await auditApi.getAudits();
        if (res?.data?.audits && res.data.audits.length > 0) {
          setAuditsList(res.data.audits);
          if (!selectedAuditId) {
            setSelectedAuditId(res.data.audits[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load audits list:', err);
      }
    }
    loadAudits();
  }, []);

  // 2. Fetch Roadmap when selectedAuditId changes
  useEffect(() => {
    async function loadRoadmap() {
      if (!selectedAuditId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const res = await auditApi.getRoadmap(selectedAuditId);
        if (res?.data?.roadmap) {
          setRoadmap(res.data.roadmap);
        }
      } catch (err) {
        setError(err.message || 'Failed to load SEO roadmap.');
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [selectedAuditId]);

  const handleCopyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Roadmap as Markdown
  const handleExportMarkdown = () => {
    if (!roadmap) return;
    let md = `# SEO Growth Roadmap: ${roadmap.websiteUrl}\n`;
    md += `Current Score: ${roadmap.summary.currentScore}/100 | Target: ${roadmap.summary.projectedScore}/100 (${roadmap.summary.projectedScoreLift})\n\n`;

    roadmap.phases.forEach((phase) => {
      md += `## ${phase.name}\n${phase.description}\n\n`;
      phase.tasks.forEach((t) => {
        const status = taskStatuses[t.id] || t.status || 'todo';
        const checkbox = status === 'completed' ? '[x]' : '[ ]';
        md += `### ${checkbox} [${t.priority}] ${t.title} (${t.category})\n`;
        md += `- **Effort**: ${t.estimatedEffort} | **Difficulty**: ${t.difficulty}\n`;
        md += `- **Expected Impact**: ${t.expectedImpact}\n`;
        md += `- **Action Steps**:\n`;
        t.actionSteps.forEach((s) => (md += `  - ${s}\n`));
        if (t.suggestedFix) {
          md += `\n\`\`\`\n${t.suggestedFix}\n\`\`\`\n`;
        }
        md += `\n`;
      });
    });

    navigator.clipboard.writeText(md);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  // Export as CSV
  const handleDownloadCsv = () => {
    if (!roadmap) return;
    let csv = 'Phase,Priority,Category,Task Title,Status,Difficulty,Estimated Effort,Expected Impact\n';
    roadmap.allTasks.forEach((t) => {
      const status = taskStatuses[t.id] || t.status || 'todo';
      const cleanTitle = `"${t.title.replace(/"/g, '""')}"`;
      const cleanImpact = `"${t.expectedImpact.replace(/"/g, '""')}"`;
      csv += `${t.phase},${t.priority},${t.category},${cleanTitle},${status},${t.difficulty},${t.estimatedEffort},${cleanImpact}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `SEO_Roadmap_${roadmap.websiteUrl.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.click();
  };

  // Filter Tasks
  const allTasks = roadmap?.allTasks || [];
  const filteredTasks = allTasks.filter((t) => {
    const status = taskStatuses[t.id] || t.status || 'todo';
    const matchesPhase = selectedPhase === 'all' || t.phase === Number(selectedPhase);
    const matchesCategory = selectedCategory === 'all' || t.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.expectedImpact.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPhase && matchesCategory && matchesStatus && matchesSearch;
  });

  // Calculate Progress
  const totalTasksCount = allTasks.length || 1;
  const completedTasksCount = allTasks.filter((t) => (taskStatuses[t.id] || t.status) === 'completed').length;
  const inProgressTasksCount = allTasks.filter((t) => (taskStatuses[t.id] || t.status) === 'in_progress').length;
  const progressPercent = Math.round((completedTasksCount / totalTasksCount) * 100);

  return (
    <div className="space-y-8">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold tracking-wide uppercase">
            <Milestone className="w-3.5 h-3.5" />
            <span>Interactive 30 - 60 - 90 Day Growth Blueprint</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            SEO Implementation Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Prioritized strategic phases tailored directly to your crawl results. Track implementation status,
            deploy ready-to-copy code fixes, and forecast ranking increases.
          </p>
        </div>

        {/* Audit Selector & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10">
          {auditsList.length > 0 && (
            <div className="relative">
              <select
                value={selectedAuditId}
                onChange={(e) => setSelectedAuditId(e.target.value)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none pr-8 cursor-pointer"
              >
                {auditsList.map((a) => (
                  <option key={a.id} value={a.id} className="bg-slate-900">
                    {a.website_url} ({a.seo_score}/100)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
              title="Copy markdown action plan"
            >
              {copiedExport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedExport ? 'Copied MD' : 'Copy Plan'}</span>
            </button>

            <button
              onClick={handleDownloadCsv}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress & Metrics Summary Bar */}
      {roadmap && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progress Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider">Roadmap Progress</span>
              <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-600 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>{completedTasksCount} Completed</span>
              <span>{inProgressTasksCount} In Progress</span>
              <span>{totalTasksCount - completedTasksCount - inProgressTasksCount} To Do</span>
            </div>
          </div>

          {/* Current Score vs Projected */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Projected Score Lift
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                  {roadmap.summary.projectedScore}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-1 px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50">
                  {roadmap.summary.projectedScoreLift}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Estimated Implementation Time */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Estimated Dev Effort
              </span>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white block">
                {roadmap.summary.estimatedTotalTime}
              </span>
              <span className="text-[11px] text-slate-400">Spread across 4 strategic phases</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          {/* Audited Domain */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Audited Website
              </span>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {roadmap.websiteUrl}
              </p>
              <span className="text-[11px] text-slate-400">
                {roadmap.summary.totalTasks} Actionable Roadmap Tasks
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-brand-600 flex items-center justify-center shrink-0">
              <Globe className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Phase Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { key: 'all', label: 'All 4 Phases', count: allTasks.length },
          { key: '1', label: 'Phase 1: Days 1–14', count: roadmap?.summary?.phaseCounts?.phase1 || 0 },
          { key: '2', label: 'Phase 2: Days 15–30', count: roadmap?.summary?.phaseCounts?.phase2 || 0 },
          { key: '3', label: 'Phase 3: Days 31–60', count: roadmap?.summary?.phaseCounts?.phase3 || 0 },
          { key: '4', label: 'Phase 4: Days 61–90+', count: roadmap?.summary?.phaseCounts?.phase4 || 0 },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedPhase(tab.key)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between ${
              selectedPhase === tab.key
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                selectedPhase === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filters Bar: Search, Category, Status */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roadmap tasks, keywords, fixes..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'todo', 'in_progress', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            Generating custom SEO growth roadmap...
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Task List */}
      {!loading && (
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="font-bold text-slate-900 dark:text-white">No Tasks Match Your Filters</h3>
              <p className="text-xs text-slate-400">Try clearing your search query or phase filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const currentStatus = taskStatuses[task.id] || task.status || 'todo';
              const isExpanded = expandedTask === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                    currentStatus === 'completed'
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-80'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
                  }`}
                >
                  {/* Task Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            currentStatus === 'completed' ? 'todo' : 'completed'
                          )
                        }
                        className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                          currentStatus === 'completed'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : currentStatus === 'in_progress'
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'border-slate-300 dark:border-slate-700 hover:border-brand-500'
                        }`}
                        title="Toggle task completion"
                      >
                        {currentStatus === 'completed' && <Check className="w-3.5 h-3.5" />}
                        {currentStatus === 'in_progress' && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {/* Priority Badge */}
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                              task.priority.includes('P0')
                                ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                                : task.priority.includes('P1')
                                ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-400'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {/* Category Badge */}
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {task.category}
                          </span>

                          <span className="text-xs text-slate-400 font-medium">
                            Phase {task.phase} · {task.estimatedEffort} · {task.difficulty} Effort
                          </span>
                        </div>

                        <h3
                          className={`text-base font-bold ${
                            currentStatus === 'completed'
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </h3>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={currentStatus}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer ${
                          currentStatus === 'completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-400'
                            : currentStatus === 'in_progress'
                            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <button
                        onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Toggle Details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Impact Summary Pill */}
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                    <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                    <span>{task.expectedImpact}</span>
                  </div>

                  {/* Expanded Task Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs">
                      {/* Action Steps */}
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                          Step-by-Step Implementation Guide:
                        </span>
                        <ul className="space-y-1.5 pl-4 list-disc text-slate-600 dark:text-slate-300">
                          {task.actionSteps.map((step, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Suggested Code / Config Fix */}
                      {task.suggestedFix && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                              <Code2 className="w-3.5 h-3.5" />
                              Ready-to-Deploy Fix / Configuration:
                            </span>
                            <button
                              onClick={() => handleCopyCode(task.suggestedFix, task.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            >
                              {copiedId === task.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="text-emerald-600 font-bold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Snippet</span>
                                </>
                              )}
                            </button>
                          </div>

                          <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                            <code>{task.suggestedFix}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
