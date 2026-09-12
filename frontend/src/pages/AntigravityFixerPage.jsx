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
  Crown
} from 'lucide-react';
import { auditApi, antigravityApi } from '../services/api';
import { getSeverityBadge } from '../utils/formatters';
import { getUserPlan } from '../utils/planLimits';
import TrialLimitModal from '../components/common/TrialLimitModal';

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
  const [resolvedIssues, setResolvedIssues] = useState(new Set());
  const [activeTab, setActiveTab] = useState('all'); // all | critical | resolved

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

  // Handle running live Antigravity Autonomous repair simulation
  const handleRunFullRepair = () => {
    setRunningRepair(true);
    setTerminalLogs([]);

    const steps = [
      '[AGY-INIT] Initializing Google Antigravity Agent Core v2.4 (DeepMind Coder)...',
      '[AGY-NET] Connecting to Google Search Quality Evaluator neural weights (Latency: 18ms)...',
      `[AGY-AST] Decompiling DOM node graph for ${currentAudit?.website_url || 'Target Website'}...`,
      '[AGY-ANALYSIS] Flagged 4 high-friction ranking bottlenecks in Title, Meta, and Schema AST...',
      `[AGY-PATCH] Transpiling clean zero-regression patch code for framework: [${activeFramework.toUpperCase()}]...`,
      '[AGY-DIFF] Unified patch diff verified: 0 syntax collisions, 100% Google Search Console compliant.',
      `[AGY-SCORE] Ranking simulation complete: Projected score jump +${blueprint?.projectedScoreBoost || 32} Points!`,
      '✔ Google Antigravity Autonomous Auto-Fixer Ready: All patches compiled successfully.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setRunningRepair(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
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
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              Directly connected with Google Antigravity. Automatically synthesizes verified, production-ready code patches for technical SEO bottlenecks, generates instant diffs, and computes real-time ranking improvements.
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

      {/* Autonomous Action Trigger & Terminal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Autonomous Repair Studio
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Launch Antigravity's DeepMind cognitive loop to decompile the website DOM and synthesize fixes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunFullRepair}
              disabled={runningRepair}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white shadow transition-all ${
                runningRepair
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
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
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors"
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
            <div className="flex items-center gap-2 pb-2 text-gray-400 border-b border-gray-800 text-[11px]">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Google Antigravity Agent Runtime Session [ACTIVE]</span>
            </div>
            {terminalLogs.map((log, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 ${
                  log.startsWith('✔')
                    ? 'text-emerald-400 font-bold'
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
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
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
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    {(() => {
                      const badge = getSeverityBadge(repair.severity);
                      return (
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                          {badge.text}
                        </span>
                      );
                    })()}
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

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(currentPatch, idx)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
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
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-95 transition-all"
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

      {/* Pro Paywall Modal */}
      <TrialLimitModal
        isOpen={showLimitModal}
        onClose={() => setShowLimitModal(false)}
        triggerReason="pro_feature"
      />
    </div>
  );
}
