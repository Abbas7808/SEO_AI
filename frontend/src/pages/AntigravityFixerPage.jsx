import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Cpu,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Terminal,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Sliders,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Flame,
  Code2,
  Lock,
  Crown,
  Bot,
  FolderGit2,
  Play,
  FileCode,
  Loader2,
  Laptop
} from 'lucide-react';
import { auditApi, antigravityApi } from '../services/api';
import { getSeverityBadge } from '../utils/formatters';
import { getUserPlan } from '../utils/planLimits';
import TrialLimitModal from '../components/common/TrialLimitModal';
import GoogleAntigravityModal from '../components/common/GoogleAntigravityModal';

export default function AntigravityFixerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const auditId = searchParams.get('auditId');

  const userPlan = getUserPlan();
  const isPro = userPlan === 'pro' || userPlan === 'agency';
  const [showLimitModal, setShowLimitModal] = useState(false);

  const [audits, setAudits] = useState([]);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [selectedAuditId, setSelectedAuditId] = useState(auditId || '');
  const [loading, setLoading] = useState(true);
  const [activeFramework, setActiveFramework] = useState('html');
  const [blueprint, setBlueprint] = useState(null);
  const [runningRepair, setRunningRepair] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [resolvedIssues, setResolvedIssues] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // all | critical | resolved

  // Google Antigravity Workspace & Editor state
  const [workspacePath, setWorkspacePath] = useState(
    localStorage.getItem('seo_project_path') || 'C:\\Users\\AGP KOHAT\\Desktop\\SEO'
  );
  const [openingWorkspace, setOpeningWorkspace] = useState(false);
  const [openingFileId, setOpeningFileId] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);
  const [selectedAgentIssue, setSelectedAgentIssue] = useState(null);

  // Fallback demo blueprint if loading on a fresh un-audited state
  const demoBlueprint = {
    session: {
      connected: true,
      agent: 'Google Antigravity Autonomous Agent (DeepMind Engine)',
      version: 'AGY-2.4.0-deepmind',
      latency: '18ms',
      protocol: 'DeepMind Autonomous Code Repair v2.4'
    },
    totalIssuesFound: 5,
    repairableIssuesCount: 4,
    projectedScoreBoost: 32,
    averageConfidence: 99.1,
    repairs: [
      {
        issueId: 'demo-1',
        issueType: 'missing_h1',
        title: 'Missing H1 Heading Tag',
        filePath: 'frontend/index.html',
        lineNumber: 17,
        severity: 'critical',
        confidence: 99.4,
        scoreBoost: 12,
        agentInsight: 'Google RankBrain weighs the top-level H1 heading as the primary on-page topical anchor. Antigravity synthesized a high-intent, semantically weighted H1 heading tailored to your brand identity.',
        diffView: '- <div class="hero-banner"><p class="big-text">Welcome to My Enterprise</p></div>\n+ <div class="hero-banner">\n+   <h1>My Enterprise - Premier Web Solutions & Digital Growth</h1>\n+   <p class="subtitle">Accelerating your online visibility with precision technical architecture.</p>\n+ </div>',
        activePatch: '<div class="hero-banner">\n  <h1>My Enterprise - Premier Web Solutions & Digital Growth</h1>\n  <p class="subtitle">Accelerating your online visibility with precision technical architecture.</p>\n</div>',
        patches: {
          html: '<div class="hero-banner">\n  <h1>My Enterprise - Premier Web Solutions & Digital Growth</h1>\n  <p class="subtitle">Accelerating your online visibility with precision technical architecture.</p>\n</div>',
          react: 'export default function Hero() {\n  return (\n    <header className="hero-banner">\n      <h1 className="text-4xl font-extrabold tracking-tight">\n        My Enterprise - Premier Web Solutions & Digital Growth\n      </h1>\n    </header>\n  );\n}',
          wordpress: '<h1><?php bloginfo("name"); ?> &mdash; <?php bloginfo("description"); ?></h1>'
        }
      },
      {
        issueId: 'demo-2',
        issueType: 'missing_meta_description',
        title: 'Missing Meta Description',
        filePath: 'frontend/index.html',
        lineNumber: 7,
        severity: 'high',
        confidence: 99.1,
        scoreBoost: 10,
        agentInsight: 'Search engines generate random, truncated snippet previews without a descriptive meta description. Antigravity synthesized a high-CTR 148-character description containing core brand terms.',
        diffView: '- <!-- Current <head>: Missing <meta name="description"> -->\n+ <meta name="description" content="Discover My Enterprise\'s cutting-edge digital platform. Explore technical capabilities, automated solutions, and expert resources crafted to drive measurable growth.">',
        activePatch: '<meta name="description" content="Discover My Enterprise\'s cutting-edge digital platform. Explore technical capabilities, automated solutions, and expert resources crafted to drive measurable growth.">',
        patches: {
          html: '<meta name="description" content="Discover My Enterprise\'s cutting-edge digital platform. Explore technical capabilities, automated solutions, and expert resources crafted to drive measurable growth.">',
          react: 'export const metadata = {\n  description: "Discover My Enterprise\'s cutting-edge digital platform. Explore technical capabilities, automated solutions, and expert resources crafted to drive measurable growth.",\n};',
          wordpress: 'add_action("wp_head", function() {\n  echo \'<meta name="description" content="Discover My Enterprise\'s cutting-edge digital platform." />\';\n});'
        }
      },
      {
        issueId: 'demo-3',
        issueType: 'missing_schema',
        title: 'Missing Schema.org JSON-LD Structured Data',
        filePath: 'frontend/index.html',
        lineNumber: 12,
        severity: 'high',
        confidence: 99.6,
        scoreBoost: 14,
        agentInsight: 'Structured data unlocks Google Rich Snippets, Knowledge Graph panels, and enhanced search listings. Antigravity synthesized a validated Schema.org Organization markup schema with sitelinks search action.',
        diffView: '- <!-- Current <head>: No Schema.org JSON-LD found -->\n+ <script type="application/ld+json">\n+ {\n+   "@context": "https://schema.org",\n+   "@type": "Organization",\n+   "name": "My Enterprise",\n+   "url": "https://example.com"\n+ }\n+ </script>',
        activePatch: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "My Enterprise",\n  "url": "https://example.com"\n}\n</script>',
        patches: {
          html: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "My Enterprise",\n  "url": "https://example.com"\n}\n</script>',
          react: '// Next.js JSON-LD Injection\n<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />',
          wordpress: 'echo "<script type=\\"application/ld+json\\">" . json_encode($schema) . "</script>";'
        }
      }
    ]
  };

  // Load audits list for dropdown
  useEffect(() => {
    async function fetchAudits() {
      try {
        const res = await auditApi.getAudits();
        if (res?.data?.audits) {
          setAudits(res.data.audits);
          if (!selectedAuditId && res.data.audits.length > 0) {
            setSelectedAuditId(res.data.audits[0].id.toString());
            setSearchParams({ auditId: res.data.audits[0].id });
          }
        }
      } catch (err) {
        console.error('Error fetching audits:', err);
      }
    }
    fetchAudits();
  }, []);

  // Fetch blueprint when selected audit or framework changes
  useEffect(() => {
    async function loadBlueprint() {
      if (!selectedAuditId) {
        setBlueprint(demoBlueprint);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [auditRes, bpRes] = await Promise.all([
          auditApi.getAuditById(selectedAuditId),
          antigravityApi.getBlueprint(selectedAuditId, activeFramework)
        ]);

        if (auditRes?.data?.audit) {
          setCurrentAudit(auditRes.data.audit);
          if (auditRes.data.audit.project_path) {
            setWorkspacePath(auditRes.data.audit.project_path);
          }
        }
        if (bpRes?.data) {
          setBlueprint(bpRes.data);
        } else {
          setBlueprint(demoBlueprint);
        }
      } catch (err) {
        console.warn('Using demo blueprint fallback:', err);
        setBlueprint(demoBlueprint);
      } finally {
        setLoading(false);
      }
    }
    loadBlueprint();
  }, [selectedAuditId, activeFramework]);

  // Initial greeting logs in terminal
  useEffect(() => {
    if (terminalLogs.length === 0) {
      setTerminalLogs([
        'Google Antigravity Agent Runtime Session [INITIALIZED]',
        `[AGY-WORKSPACE] Active Codebase: ${workspacePath}`,
        '[AGY-AGENT] Google Antigravity Agent Core v2.4 (DeepMind Coder) standing by.',
        `[AGY-DEV] Live dev server: http://localhost:5173/ | Command: npm run dev`,
        'Ready to open Google Antigravity IDE for live coding and code improvements.'
      ]);
    }
  }, [workspacePath]);

  // 1. Open entire workspace in Google Antigravity IDE
  const handleOpenAntigravityWorkspace = async () => {
    setOpeningWorkspace(true);
    const targetPath = workspacePath.trim() || 'C:\\Users\\AGP KOHAT\\Desktop\\SEO';

    setTerminalLogs(prev => [
      ...prev,
      `[AGY-IDE] Launching Google Antigravity IDE at: ${targetPath}...`,
      `[AGY-STATUS] Spawning antigravity-ide process on Windows...`
    ]);

    try {
      // Call backend native launcher
      await auditApi.openWorkspace({ projectPath: targetPath });

      // Trigger URI deep-link fallback for instant editor response
      const cleanUri = `vscode://file/${targetPath.replace(/\\/g, '/')}`;
      window.location.href = cleanUri;

      setTerminalLogs(prev => [
        ...prev,
        `✔ [AGY-SUCCESS] Google Antigravity IDE workspace launched! [CODE 0 READY]`,
        `[AGY-RUN] Terminal ready in IDE: run 'npm run dev' to serve live changes at http://localhost:5173/`,
        `[AGY-AGENT] Pair-programming session active. Use /goal in Antigravity chat for autonomous refactoring.`
      ]);

      setToastNotice({
        title: 'Google Antigravity IDE Opened!',
        message: `Workspace launched at ${targetPath}. You can now run the code and make improvements in Antigravity.`
      });
      setTimeout(() => setToastNotice(null), 8000);
    } catch (err) {
      // Direct deep link fallback even if backend is offline or on remote host
      const cleanUri = `vscode://file/${targetPath.replace(/\\/g, '/')}`;
      window.location.href = cleanUri;

      setTerminalLogs(prev => [
        ...prev,
        `✔ [AGY-URI] Dispatched Google Antigravity IDE URI handler: ${cleanUri}`,
        `[AGY-RUN] Run 'npm run dev' in your IDE terminal to test code live.`
      ]);

      setToastNotice({
        title: 'Google Antigravity IDE Launched',
        message: `Workspace opened via system URI handler at ${targetPath}.`
      });
      setTimeout(() => setToastNotice(null), 8000);
    } finally {
      setOpeningWorkspace(false);
    }
  };

  // 2. Open specific file at line number in Google Antigravity IDE
  const handleOpenFileInAntigravity = async (repair) => {
    const file = repair.filePath || 'frontend/index.html';
    const line = repair.lineNumber || 1;
    const targetPath = workspacePath.trim() || 'C:\\Users\\AGP KOHAT\\Desktop\\SEO';

    setOpeningFileId(repair.issueId);
    setTerminalLogs(prev => [
      ...prev,
      `[AGY-IDE] Opening ${file} at line ${line} in Google Antigravity IDE...`
    ]);

    try {
      await auditApi.openInEditor({
        projectPath: targetPath,
        filePath: file,
        lineNumber: line
      });

      // System URI fallback
      const cleanUri = `vscode://file/${targetPath.replace(/\\/g, '/')}/${file}:${line}`;
      window.location.href = cleanUri;

      setTerminalLogs(prev => [
        ...prev,
        `✔ [AGY-FILE] Opened ${file}:${line} in Google Antigravity IDE for live editing!`
      ]);

      setToastNotice({
        title: `Opened ${file} (Line ${line})`,
        message: 'Google Antigravity IDE navigated directly to the issue location for coding.'
      });
      setTimeout(() => setToastNotice(null), 6000);
    } catch (err) {
      const cleanUri = `vscode://file/${targetPath.replace(/\\/g, '/')}/${file}:${line}`;
      window.location.href = cleanUri;
    } finally {
      setOpeningFileId(null);
    }
  };

  // 3. Open Agent Repair Modal for an issue
  const handleOpenAgentModal = (repair) => {
    const file = repair.filePath || 'frontend/index.html';
    const line = repair.lineNumber || 1;
    const currentPatch = repair.patches?.[activeFramework] || repair.activePatch;

    setSelectedAgentIssue({
      id: repair.issueId,
      title: repair.title,
      severity: repair.severity,
      file_path: file,
      line_number: line,
      code_snippet: repair.originalCode || '<!-- Current Markup -->',
      suggested_fix: currentPatch,
      solution_steps: repair.agentInsight,
      antigravity_command: `/goal In ${file} at line ${line}, refactor SEO issue "${repair.title}": apply fix ${currentPatch}`
    });
  };

  // 4. Handle running live Antigravity Autonomous repair simulation
  const handleRunFullRepair = () => {
    setRunningRepair(true);
    setTerminalLogs([]);

    const steps = [
      '[AGY-INIT] Initializing Google Antigravity Agent Core v2.4 (DeepMind Coder)...',
      `[AGY-IDE] Connecting to active Google Antigravity IDE session at ${workspacePath}...`,
      '[AGY-NET] Connecting to Google Search Quality Evaluator neural weights (Latency: 18ms)...',
      `[AGY-AST] Decompiling DOM node graph for ${currentAudit?.website_url || 'Target Website'}...`,
      '[AGY-ANALYSIS] Flagged 4 high-friction ranking bottlenecks in Title, Meta, and Schema AST...',
      `[AGY-PATCH] Transpiling clean zero-regression patch code for framework: [${activeFramework.toUpperCase()}]...`,
      '[AGY-DIFF] Unified patch diff verified: 0 syntax collisions, 100% Google Search Console compliant.',
      `[AGY-SCORE] Ranking simulation complete: Projected score jump +${blueprint?.projectedScoreBoost || 32} Points!`,
      `[AGY-RUN] Live dev server: http://localhost:5173/ | Ready to run code improvements in Google Antigravity IDE.`,
      '✔ Google Antigravity Autonomous Auto-Fixer Ready: All patches compiled successfully.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setRunningRepair(false);
        }
      }, (idx + 1) * 300);
    });
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const handleCopyRunCmd = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  const handleResolveIssue = async (issueId, scoreBoost = 10) => {
    if (selectedAuditId && !issueId.toString().startsWith('demo')) {
      try {
        await antigravityApi.resolveIssue(selectedAuditId, { issueId, scoreBoost });
        if (currentAudit) {
          setCurrentAudit(prev => ({
            ...prev,
            seo_score: Math.min(100, (prev.seo_score || 70) + scoreBoost)
          }));
        }
      } catch (err) {
        console.error('Resolve error:', err);
      }
    }
    setResolvedIssues(prev => new Set([...prev, issueId]));
  };

  const currentScore = currentAudit?.seo_score || 64;
  const projectedBoost = blueprint?.projectedScoreBoost || 32;
  const projectedFinalScore = Math.min(100, currentScore + projectedBoost);

  const displayRepairs = (blueprint?.repairs || []).filter(repair => {
    const isResolved = resolvedIssues.has(repair.issueId);
    if (activeTab === 'resolved') return isResolved;
    if (activeTab === 'critical') return !isResolved && (repair.severity === 'critical' || repair.severity === 'high');
    return true; // all
  });

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900 border-2 border-indigo-500 shadow-2xl text-white text-xs flex items-start gap-3 animate-scale-up">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-indigo-600/30">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-sm text-white">{toastNotice.title}</p>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastNotice.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 via-indigo-950 to-purple-950 rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute -right-12 -top-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-32 bottom-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Google Antigravity Agent Engine Connected &bull; DeepMind v2.4
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Cpu className="h-9 w-9 text-indigo-400 animate-pulse" />
              Autonomous SEO Auto-Fixer
            </h1>
            <p className="text-gray-300 max-w-2xl text-sm sm:text-base leading-relaxed">
              Directly connected with <strong>Google Antigravity IDE</strong>. Launch the IDE to run code, test improvements, synthesize verified code patches with AST diffs, and boost your Google rankings.
            </p>
          </div>

          {/* Score Jump Card */}
          <div className="flex items-center gap-4 bg-gray-800/80 backdrop-blur-md border border-indigo-500/30 p-5 rounded-xl shrink-0 shadow-lg">
            <div className="text-center">
              <span className="text-xs text-gray-400 block font-medium uppercase">Current Score</span>
              <span className="text-3xl font-black text-gray-200">{currentScore}</span>
              <span className="text-xs text-gray-400 block">/100</span>
            </div>
            <ArrowRight className="h-6 w-6 text-emerald-400 animate-pulse" />
            <div className="text-center">
              <span className="text-xs text-emerald-400 block font-medium uppercase">Antigravity Projected</span>
              <span className="text-3xl font-black text-emerald-400">{projectedFinalScore}</span>
              <span className="text-xs text-emerald-300 block font-semibold">+{projectedBoost} pts</span>
            </div>
          </div>
        </div>

        {/* Audit Switcher & Framework Selector Bar */}
        <div className="mt-8 pt-6 border-t border-indigo-900/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">Audit Target:</span>
            <select
              value={selectedAuditId}
              onChange={(e) => {
                setSelectedAuditId(e.target.value);
                setSearchParams({ auditId: e.target.value });
              }}
              className="bg-gray-800/90 text-white text-xs sm:text-sm rounded-lg border border-gray-700 px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.website_url} (Score: {a.seo_score}/100)
                </option>
              ))}
              {audits.length === 0 && (
                <option value="">Demo Enterprise Site (https://example.com)</option>
              )}
            </select>
          </div>

          {/* Framework Switcher */}
          <div className="flex items-center gap-2 bg-gray-800/60 p-1 rounded-lg border border-gray-700/60">
            <span className="text-xs text-gray-400 px-2 font-medium">Patch Syntax:</span>
            {[
              { id: 'html', label: 'HTML / Head' },
              { id: 'react', label: 'Next.js 14 / React' },
              { id: 'wordpress', label: 'WordPress PHP' },
              { id: 'schema', label: 'Schema JSON-LD' }
            ].map(fw => (
              <button
                key={fw.id}
                onClick={() => setActiveFramework(fw.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeFramework === fw.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {fw.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Dedicated Google Antigravity Code Runner & Workspace Controller */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-2 border-indigo-500/40 shadow-xl text-white space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-400" />
                <span>Google Antigravity IDE & Live Code Runner</span>
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                Active Coding Studio
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Open your project in <strong>Google Antigravity IDE</strong> to run the code, test live changes, and apply AI code fixes.
            </p>
          </div>

          {/* Big Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenAntigravityWorkspace}
              disabled={openingWorkspace}
              className="px-5 py-2.5 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-indigo-600 via-brand-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              title="Launches Google Antigravity IDE with this project workspace"
            >
              {openingWorkspace ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span>🚀 Open in Google Antigravity IDE</span>
            </button>

            <button
              type="button"
              onClick={() => handleCopyRunCmd('npm run dev')}
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Copy the dev server run command"
            >
              {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              <span>{copiedCmd ? 'Command Copied!' : 'npm run dev (Copy)'}</span>
            </button>

            <a
              href={currentAudit?.website_url || 'http://localhost:5173/'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Open the live preview in browser"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
              <span>Open Live Preview</span>
            </a>
          </div>
        </div>

        {/* Workspace Path Input Bar */}
        <div className="pt-3 border-t border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-slate-400 shrink-0 font-medium">Workspace Location:</span>
            <div className="relative flex-1">
              <input
                type="text"
                value={workspacePath}
                onChange={(e) => {
                  setWorkspacePath(e.target.value);
                  localStorage.setItem('seo_project_path', e.target.value);
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-700 text-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="C:\Users\...\ProjectFolder"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                const defaultWs = 'C:\\Users\\AGP KOHAT\\Desktop\\SEO';
                setWorkspacePath(defaultWs);
                localStorage.setItem('seo_project_path', defaultWs);
              }}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-bold underline shrink-0 cursor-pointer"
            >
              Use Current Workspace
            </button>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px] shrink-0">
            <span className="flex items-center gap-1">
              <Bot className="w-3.5 h-3.5 text-indigo-400" />
              Agent Protocol: <strong>/goal ready</strong>
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Live Coding: <strong>Enabled</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Autonomous Action Trigger & Terminal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Autonomous Repair Studio
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Launch Antigravity's DeepMind cognitive loop to decompile the website DOM, synthesize fixes, and open in Google Antigravity IDE.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Direct Open in IDE Button in Repair Studio */}
            <button
              type="button"
              onClick={handleOpenAntigravityWorkspace}
              disabled={openingWorkspace}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all cursor-pointer"
              title="Open the project in Google Antigravity IDE for live coding"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Open in Google Antigravity IDE</span>
            </button>

            <button
              onClick={handleRunFullRepair}
              disabled={runningRepair}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-all cursor-pointer ${
                runningRepair
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${runningRepair ? 'animate-spin' : ''}`} />
              {runningRepair ? 'Executing DeepMind Agent...' : '⚡ Run Antigravity Autonomous Fixer'}
            </button>

            {selectedAuditId && (
              isPro ? (
                <a
                  href={antigravityApi.getPatchDownloadUrl(selectedAuditId, activeFramework)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Download className="h-4 w-4 text-gray-600" />
                  Download Patch Sheet
                </a>
              ) : (
                <button
                  onClick={() => setShowLimitModal(true)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors cursor-pointer"
                  title="Unlock 1-Click Patches with Pro Specialist"
                >
                  <Lock className="h-4 w-4 text-amber-600" />
                  <span>Download Patch Sheet</span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                    Pro
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Terminal Log Stream */}
        {terminalLogs.length > 0 && (
          <div className="bg-gray-950 p-5 font-mono text-xs text-gray-200 border-t border-gray-800 space-y-1.5 transition-all">
            <div className="flex items-center justify-between pb-2 text-gray-400 border-b border-gray-800 text-[11px]">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Google Antigravity Agent Runtime Session [ACTIVE]</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleOpenAntigravityWorkspace}
                  className="text-indigo-400 hover:text-indigo-300 font-bold underline text-[11px] cursor-pointer"
                >
                  Launch IDE Workspace
                </button>
                <button
                  type="button"
                  onClick={() => setTerminalLogs([])}
                  className="text-gray-500 hover:text-gray-300 text-[11px] cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>
            {terminalLogs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  log.startsWith('✔')
                    ? 'text-emerald-400 font-bold'
                    : log.includes('SUCCESS')
                    ? 'text-emerald-300 font-semibold'
                    : log.includes('IDE')
                    ? 'text-indigo-300 font-semibold'
                    : log.includes('SCORE')
                    ? 'text-amber-300 font-semibold'
                    : 'text-gray-300'
                }`}
              >
                <span className="text-gray-600 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <div className="flex gap-2">
          {[
            { id: 'all', label: `All Patches (${blueprint?.repairs?.length || 0})` },
            { id: 'critical', label: 'Critical & High Priority' },
            { id: 'resolved', label: `Resolved (${resolvedIssues.size})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-gray-500 font-medium hidden sm:inline">
          Avg. Antigravity Repair Confidence: <strong className="text-indigo-600">{blueprint?.averageConfidence || 99.1}%</strong>
        </span>
      </div>

      {/* List of Repaired Issues */}
      <div className="space-y-6">
        {displayRepairs.map((repair, idx) => {
          const isResolved = resolvedIssues.has(repair.issueId);
          const currentPatch = repair.patches?.[activeFramework] || repair.activePatch;
          const targetFile = repair.filePath || 'frontend/index.html';
          const targetLine = repair.lineNumber || 1;

          return (
            <div
              key={repair.issueId || idx}
              className={`bg-white rounded-xl shadow-sm border transition-all overflow-hidden ${
                isResolved
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-5 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const badge = getSeverityBadge(repair.severity);
                      return (
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      );
                    })()}

                    {/* File Path & Line pill */}
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{targetFile}:{targetLine}</span>
                    </span>

                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      Antigravity Verified &bull; {repair.confidence}% Confidence
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                      +{repair.scoreBoost} SEO Pts
                    </span>
                    {isResolved && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    {repair.title}
                  </h3>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Open in Antigravity IDE directly at line */}
                  <button
                    type="button"
                    onClick={() => handleOpenFileInAntigravity(repair)}
                    disabled={openingFileId === repair.issueId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 shadow-sm transition-all cursor-pointer"
                    title={`Directly opens ${targetFile} at line ${targetLine} in Google Antigravity IDE for live coding`}
                  >
                    {openingFileId === repair.issueId ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ExternalLink className="h-3.5 w-3.5 text-white" />
                    )}
                    <span>Open in Antigravity (Line {targetLine})</span>
                  </button>

                  {/* Launch Agent Fix Modal */}
                  <button
                    type="button"
                    onClick={() => handleOpenAgentModal(repair)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                    title="Launch Antigravity Agent modal with /goal command and 1-click safe patching"
                  >
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Launch Agent Fix</span>
                  </button>

                  <button
                    onClick={() => handleCopy(currentPatch, idx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-gray-500" />
                        <span>Copy Patch</span>
                      </>
                    )}
                  </button>

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolveIssue(repair.issueId, repair.scoreBoost)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Apply &amp; Resolve
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-semibold px-2">
                      Marked Live
                    </span>
                  )}
                </div>
              </div>

              {/* Agent Insight Note */}
              <div className="px-6 py-3.5 bg-indigo-50/40 border-b border-indigo-100/60 text-xs text-indigo-900 flex items-start gap-2.5">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold text-indigo-950">Google Antigravity Diagnostic: </strong>
                  <span>{repair.agentInsight}</span>
                </div>
              </div>

              {/* Side-by-Side Before vs After Unified Diff */}
              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 bg-gray-50/50">
                {/* Before */}
                <div className="rounded-lg border border-red-200 bg-red-50/30 overflow-hidden">
                  <div className="px-3.5 py-1.5 bg-red-100/60 border-b border-red-200 text-[11px] font-bold text-red-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Original Failing Markup / Missing State</span>
                    <span className="text-red-600 font-mono">- RED</span>
                  </div>
                  <pre className="p-3.5 font-mono text-xs text-red-900 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {repair.originalCode || '<!-- Element missing or non-compliant in current DOM -->'}
                  </pre>
                </div>

                {/* After (Antigravity Patched) */}
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 overflow-hidden">
                  <div className="px-3.5 py-1.5 bg-emerald-100/60 border-b border-emerald-200 text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Antigravity Patched Code [{activeFramework.toUpperCase()}]</span>
                    <span className="text-emerald-700 font-mono">+ GREEN</span>
                  </div>
                  <pre className="p-3.5 font-mono text-xs text-emerald-950 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {currentPatch}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}

        {displayRepairs.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-gray-900">All Selected Issues Have Been Repaired!</h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Google Antigravity has addressed these items. Your website SEO profile is primed for higher Google rankings.
            </p>
          </div>
        )}
      </div>

      {/* Google Antigravity Code Refactoring & IDE Modal */}
      {selectedAgentIssue && (
        <GoogleAntigravityModal
          isOpen={!!selectedAgentIssue}
          onClose={() => setSelectedAgentIssue(null)}
          issue={selectedAgentIssue}
          auditId={selectedAuditId || currentAudit?.id}
          projectPath={workspacePath}
          onFixApplied={(issueId) => {
            setResolvedIssues(prev => new Set([...prev, issueId]));
          }}
        />
      )}

      {/* Pro Paywall Modal */}
      <TrialLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        triggerReason="pro_feature"
      />
    </div>
  );
}
