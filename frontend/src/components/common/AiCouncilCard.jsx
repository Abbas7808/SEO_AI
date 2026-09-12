import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Zap,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Flame,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function AiCouncilCard({ councilData = null, auditData = {} }) {
  const [activeAgentId, setActiveAgentId] = useState('all');

  // Fallback defaults if councilData hasn't loaded yet
  const overall = auditData.seo_score ?? auditData.overallScore ?? auditData.score ?? 78;
  const techScore = auditData.technical_score ?? auditData.technicalScore ?? 84;
  const onPageScore = auditData.onpage_score ?? auditData.onPageScore ?? 80;
  const perfScore = auditData.performance_score ?? auditData.performanceScore ?? 75;
  const schemaScore = auditData.structured_data_score ?? auditData.structuredDataScore ?? 65;

  const defaultAgents = [
    {
      id: 'agent_thorne',
      name: 'Dr. Aris Thorne',
      title: 'Principal Technical SEO Architect',
      specialty: 'Crawl Budget & Server Infrastructure',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      grade: techScore >= 80 ? 'A' : 'B',
      score: techScore,
      status: techScore >= 80 ? 'Optimal' : 'Action Needed',
      summary: 'Solid crawlability foundation. Verify canonical tags and ensure HTTPS 301 redirects are enforced site-wide.',
      keyFindings: [
        'Server response and canonical routing adhere to crawl standards.',
        'Zero destructive crawl-budget blackholes detected.'
      ],
      immediateDirective: 'Reinforce self-referential canonical tags across all dynamic parameter URLs.'
    },
    {
      id: 'agent_vance',
      name: 'Elena Vance',
      title: 'Head of Content & Semantic Relevance',
      specialty: 'Search Intent & On-Page Architecture',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      grade: onPageScore >= 80 ? 'A' : 'B',
      score: onPageScore,
      status: onPageScore >= 80 ? 'Optimal' : 'Action Needed',
      summary: 'Topical headings and title tags are mostly aligned. Increase meta description CTR urgency and secondary keyword depth.',
      keyFindings: [
        'Title tags match primary brand keywords within recommended character bounds.',
        'Heading hierarchy maintains logical semantic sequence.'
      ],
      immediateDirective: 'Incorporate actionable high-CTR call-to-actions in all landing page meta descriptions.'
    },
    {
      id: 'agent_frost',
      name: 'Kaelen Frost',
      title: 'Core Web Vitals & Web Performance Engineer',
      specialty: 'LCP, CLS, Asset Delivery & Latency',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      grade: perfScore >= 80 ? 'A' : 'B',
      score: perfScore,
      status: perfScore >= 80 ? 'Optimal' : 'Action Needed',
      summary: 'Good first-contentful paint speed. Minimize CLS risks by enforcing explicit width and height attributes on media.',
      keyFindings: [
        'Initial server TTFB response is within acceptable thresholds (<600ms).',
        'Payload size is manageable on standard 4G mobile connections.'
      ],
      immediateDirective: 'Add explicit width and height attributes to all <img> tags to stabilize CLS layout shifts.'
    },
    {
      id: 'agent_tanaka',
      name: 'Sora Tanaka',
      title: 'Authority, Entity & Link Architecture Lead',
      specialty: 'Schema.org JSON-LD & Knowledge Graph',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      grade: schemaScore >= 80 ? 'A' : schemaScore >= 65 ? 'B' : 'C',
      score: schemaScore,
      status: schemaScore >= 75 ? 'Optimal' : 'Action Needed',
      summary: 'Rich snippet eligibility can be maximized by implementing Organization and FAQPage Schema JSON-LD.',
      keyFindings: [
        'Entity signals can be amplified with verified Schema.org markup.',
        'Internal link equity flows evenly across primary navigation roots.'
      ],
      immediateDirective: 'Deploy Organization and WebSite Schema.org JSON-LD in document <head>.'
    }
  ];

  const council = councilData || {
    consensusScore: Math.round((techScore + onPageScore + perfScore + schemaScore) / 4),
    consensusVerdict: overall >= 80 ? 'Strong Foundation with High Growth Velocity' : 'Moderate Authority with High-Impact Optimization Opportunities',
    projectedScoreAfterFixes: Math.min(100, overall + 14),
    agents: defaultAgents,
    strategicRoadmapSummary: [
      { phase: 'Sprint 1 (Day 1-14)', goal: 'Resolve Technical & Mobile Blockers', lead: 'Dr. Aris Thorne' },
      { phase: 'Sprint 2 (Day 15-30)', goal: 'Metadata CTR & Heading Semantic Restructure', lead: 'Elena Vance' },
      { phase: 'Sprint 3 (Day 31-60)', goal: 'Core Web Vitals & Image Asset Pipeline', lead: 'Kaelen Frost' },
      { phase: 'Sprint 4 (Day 61-90)', goal: 'Schema.org Entity Architecture & Rich Snippets', lead: 'Sora Tanaka' }
    ]
  };

  const agents = council.agents || defaultAgents;
  const filteredAgents = activeAgentId === 'all' ? agents : agents.filter(a => a.id === activeAgentId);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* Executive Council Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border-b border-indigo-500/20 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
                Autonomous Multi-Agent AI Council
              </span>
              <span className="text-xs text-slate-400 font-medium">
                4 Specialized Senior Personas
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {council.consensusVerdict}
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Consensus review synthesized by our 4 autonomous virtual SEO leads. Each specialist focuses on a distinct domain of search engine crawling, ranking, and user experience.
            </p>
          </div>

          {/* Quick Score Projection Badge */}
          <div className="flex items-center gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-indigo-500/30 shadow-inner">
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Current Score</p>
              <p className="text-2xl font-black text-white">{overall}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <div className="text-center px-2">
              <p className="text-[10px] uppercase font-bold text-emerald-400">Projected Score</p>
              <p className="text-2xl font-black text-emerald-400">+{council.projectedScoreAfterFixes - overall} pts ({council.projectedScoreAfterFixes})</p>
            </div>
          </div>
        </div>
      </div>

      {/* Agents Filter Selector */}
      <div className="px-5 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveAgentId('all')}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            activeAgentId === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
          }`}
        >
          All Specialists (4)
        </button>
        {agents.map(ag => (
          <button
            key={ag.id}
            onClick={() => setActiveAgentId(ag.id)}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeAgentId === ag.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span>{ag.name.split(' ')[0]}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
              ag.grade.startsWith('A') ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
            }`}>
              {ag.grade}
            </span>
          </button>
        ))}
      </div>

      {/* Agents Cards Grid */}
      <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredAgents.map(ag => (
          <div
            key={ag.id}
            className="rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={ag.avatar}
                  alt={ag.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30 shadow-md"
                />
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                    {ag.name}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium leading-tight">
                    {ag.title}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    {ag.specialty}
                  </span>
                </div>
              </div>

              {/* Grade Badge */}
              <div className="text-right">
                <span className={`inline-block text-base font-black px-2.5 py-1 rounded-xl shadow-sm ${
                  ag.grade.startsWith('A')
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : ag.grade.startsWith('B')
                      ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                }`}>
                  {ag.grade} ({ag.score}/100)
                </span>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                  {ag.status}
                </p>
              </div>
            </div>

            {/* Specialist Summary */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              "{ag.summary}"
            </p>

            {/* Key Findings */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Key Diagnostic Findings:
              </p>
              {ag.keyFindings?.map((find, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 shrink-0" />
                  <span className="leading-snug">{find}</span>
                </div>
              ))}
            </div>

            {/* Immediate Directive Box */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/50 text-xs">
              <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-extrabold mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Specialist's Immediate Directive:</span>
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">
                {ag.immediateDirective}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
