import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Link2,
  Search,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  ArrowRight,
  TrendingUp,
  FileText,
  Mail,
  Zap,
  Globe,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { auditApi } from '../services/api';

export default function BacklitWordsPage() {
  const [searchParams] = useSearchParams();
  const queryAuditId = searchParams.get('auditId');

  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'backlinks'
  const [auditsList, setAuditsList] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(queryAuditId || '');

  // Tab 1: Visual Backlit Words Scanner State
  const [contentInput, setContentInput] = useState('');
  const [targetKeyword, setTargetKeyword] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [backlitResult, setBacklitResult] = useState(null);
  const [activeGlowFilter, setActiveGlowFilter] = useState('all');

  // Tab 2: Backlink & Anchor Words State
  const [backlinkData, setBacklinkData] = useState(null);
  const [loadingBacklinks, setLoadingBacklinks] = useState(false);
  const [copiedTemplateId, setCopiedTemplateId] = useState(null);

  // Default demo sample for instant interactive illumination
  const defaultSample = `Artificial Intelligence Website SEO Auditor empowers businesses with real-time crawling, algorithmic scoring, and high-impact search optimization. Our automated SEO tools detect technical bottlenecks, broken links, missing meta descriptions, and heading hierarchy flaws. By targeting high value keywords and building a natural backlink anchor text distribution, your website gains organic rankings and search engine visibility. High performance websites implement structured data schema, optimize server response time, and enhance user engagement through clear copywriting.`;

  // 1. Fetch Audits List
  useEffect(() => {
    async function loadAudits() {
      try {
        const res = await auditApi.getAudits();
        if (res?.data?.audits && res.data.audits.length > 0) {
          setAuditsList(res.data.audits);
          if (!selectedAuditId) {
            setSelectedAuditId(res.data.audits[0].id);
            if (res.data.audits[0].target_keyword) {
              setTargetKeyword(res.data.audits[0].target_keyword);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load audits:', err);
      }
    }
    loadAudits();
  }, []);

  // 2. Load Backlink Data for the Selected Audit
  useEffect(() => {
    async function loadBacklinks() {
      if (!selectedAuditId) return;
      try {
        setLoadingBacklinks(true);
        const res = await auditApi.getBacklinkAnalysis(selectedAuditId);
        if (res?.data?.backlinkProfile) {
          setBacklinkData(res.data.backlinkProfile);
        }
      } catch (err) {
        console.error('Failed to load backlink analysis:', err);
      } finally {
        setLoadingBacklinks(false);
      }
    }
    loadBacklinks();
  }, [selectedAuditId]);

  // Initial scan with demo text on load
  useEffect(() => {
    handleScan(defaultSample, targetKeyword || 'search optimization');
  }, []);

  const handleScan = async (textToScan, keywordToScan) => {
    const text = textToScan !== undefined ? textToScan : contentInput;
    const kw = keywordToScan !== undefined ? keywordToScan : targetKeyword;

    if (!text && !urlInput) return;
    try {
      setScanning(true);
      const res = await auditApi.analyzeBacklitWords({
        content: text,
        targetKeyword: kw,
        url: urlInput
      });

      if (res?.data) {
        setBacklitResult(res.data);
        if (!contentInput && res.data.contentSample) {
          setContentInput(res.data.contentSample);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to scan backlit words');
    } finally {
      setScanning(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateId(id);
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  // Helper to render illuminated backlit words in content paragraph
  const renderIlluminatedContent = () => {
    const text = contentInput || defaultSample;
    if (!backlitResult || !backlitResult.backlitKeywords) {
      return <p className="leading-relaxed whitespace-pre-wrap">{text}</p>;
    }

    const kwMap = new Map();
    backlitResult.backlitKeywords.forEach((k) => {
      kwMap.set(k.word.toLowerCase(), k);
    });

    const targetWords = (targetKeyword || '').toLowerCase().split(/\s+/).filter(Boolean);

    const tokens = text.split(/(\s+|[.,!?;:()"])/);

    return (
      <div className="leading-loose font-sans text-sm tracking-wide">
        {tokens.map((token, idx) => {
          const clean = token.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isTarget = targetWords.includes(clean);
          const meta = kwMap.get(clean);

          if (!clean || !meta) {
            return <span key={idx} className="text-slate-700 dark:text-slate-300">{token}</span>;
          }

          // Check Glow Filter
          if (activeGlowFilter === 'target' && !isTarget) {
            return <span key={idx} className="text-slate-400 dark:text-slate-500">{token}</span>;
          }
          if (activeGlowFilter === 'frequency' && isTarget) {
            return <span key={idx} className="text-slate-400 dark:text-slate-500">{token}</span>;
          }

          // Visual glowing neon accents
          if (isTarget) {
            return (
              <span
                key={idx}
                className="inline-block mx-0.5 px-2 py-0.5 rounded-md font-extrabold text-emerald-950 dark:text-emerald-200 bg-emerald-400/30 dark:bg-emerald-500/25 border border-emerald-500/50 shadow-sm shadow-emerald-500/40 ring-1 ring-emerald-400/40 transition-all hover:scale-105 cursor-pointer"
                title={`Target Keyword Match · Density: ${meta.density} · Prominence: ${meta.prominence}/100`}
              >
                {token}
              </span>
            );
          }

          if (meta.glowType === 'amber') {
            return (
              <span
                key={idx}
                className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md font-bold text-amber-950 dark:text-amber-200 bg-amber-400/25 dark:bg-amber-500/20 border border-amber-500/40 shadow-xs shadow-amber-500/30 cursor-pointer"
                title={`High Frequency Term (${meta.count}x) · Density: ${meta.density}`}
              >
                {token}
              </span>
            );
          }

          return (
            <span
              key={idx}
              className="inline-block mx-0.5 px-1.5 py-0.5 rounded-md font-semibold text-indigo-950 dark:text-indigo-200 bg-indigo-400/25 dark:bg-indigo-500/20 border border-indigo-500/40 shadow-xs shadow-indigo-500/30 cursor-pointer"
              title={`Topical Anchor Term · Density: ${meta.density}`}
            >
              {token}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-violet-950 to-slate-900 text-white shadow-xl border border-violet-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Keyword Backlight & Anchor Words Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Backlit Words & Backlink Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Visually illuminate target keywords and topical anchors with glowing neon prominence. Audit anchor
            text diversity, prevent over-optimization penalties, and deploy battle-tested backlink outreach.
          </p>
        </div>

        {/* Audit Selector */}
        {auditsList.length > 0 && (
          <div className="relative z-10">
            <label className="text-[10px] uppercase font-bold text-violet-300 block mb-1">
              Active Audit Website
            </label>
            <select
              value={selectedAuditId}
              onChange={(e) => {
                setSelectedAuditId(e.target.value);
                const found = auditsList.find((a) => a.id.toString() === e.target.value.toString());
                if (found?.target_keyword) setTargetKeyword(found.target_keyword);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-violet-500 pr-8 cursor-pointer"
            >
              {auditsList.map((a) => (
                <option key={a.id} value={a.id} className="bg-slate-900">
                  {a.website_url}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scanner'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Visual Backlit Words Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('backlinks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'backlinks'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>Backlinks & Anchor Words Profile</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VISUAL BACKLIT WORDS SCANNER */}
      {/* ========================================================================= */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Target Keyword to Illuminate
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={targetKeyword}
                    onChange={(e) => setTargetKeyword(e.target.value)}
                    placeholder="e.g. search optimization, smartphone repair..."
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Fetch URL Directly (Optional)
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/blog..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Content or Page Text to Backlight
              </label>
              <textarea
                rows={4}
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                placeholder="Paste article, landing page copy, or text..."
                className="w-full p-3 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setContentInput(defaultSample);
                  setTargetKeyword('search optimization');
                  handleScan(defaultSample, 'search optimization');
                }}
                className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline"
              >
                Load Sample Text
              </button>

              <button
                type="button"
                onClick={() => handleScan()}
                disabled={scanning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-50 shadow-md shadow-violet-500/20 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>{scanning ? 'Illuminating Words...' : 'Scan & Backlight Words'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostics Metrics */}
          {backlitResult && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Target Prominence
                </span>
                <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {backlitResult.targetProminence}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  {backlitResult.targetOccurrences} exact occurrences
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Word Count
                </span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {backlitResult.wordCount}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Readable tokens analyzed</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Clarity Score
                </span>
                <span className="text-2xl font-extrabold text-brand-600 dark:text-brand-400">
                  {backlitResult.overallClarityScore}/100
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Sentence flow index</span>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Backlit Keywords
                </span>
                <span className="text-2xl font-extrabold text-violet-600 dark:text-violet-400">
                  {backlitResult.backlitKeywords?.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Illuminated terms</span>
              </div>
            </div>
          )}

          {/* Interactive Visual Illuminator Window */}
          <div className="p-6 sm:p-8 rounded-2xl bg-slate-950 text-white border-2 border-violet-900/60 shadow-2xl space-y-5">
            {/* Visualizer Header with Glow Legend & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-md shadow-emerald-400/50" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">
                  Visual Keyword Backlight Scanner
                </h3>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 text-[11px] mr-1">Filter Glow:</span>
                {[
                  { key: 'all', label: 'All Glows' },
                  { key: 'target', label: 'Target Only', color: 'emerald' },
                  { key: 'frequency', label: 'Topical Only', color: 'violet' }
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setActiveGlowFilter(f.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                      activeGlowFilter === f.key
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-400/30 border border-emerald-400 shadow-xs shadow-emerald-400/50" />
                <span className="text-emerald-300">Target Keyword Match</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-indigo-400/30 border border-indigo-400 shadow-xs shadow-indigo-400/50" />
                <span className="text-indigo-300">Topical Anchor Term</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-400/30 border border-amber-400 shadow-xs shadow-amber-400/50" />
                <span className="text-amber-300">High Frequency Term</span>
              </div>
            </div>

            {/* The Illuminated Text Content */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 min-h-[140px]">
              {renderIlluminatedContent()}
            </div>
          </div>

          {/* Keywords Prominence Breakdown Table */}
          {backlitResult?.backlitKeywords && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Illuminated Keyword Prominence Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Keyword / Phrase</th>
                      <th className="px-4 py-2.5">Category</th>
                      <th className="px-4 py-2.5">Occurrences</th>
                      <th className="px-4 py-2.5">Density</th>
                      <th className="px-4 py-2.5">Prominence Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {backlitResult.backlitKeywords.map((kw, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              kw.glowType === 'emerald'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                                : kw.glowType === 'amber'
                                ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                                : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400'
                            }`}
                          >
                            {kw.word}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{kw.category}</td>
                        <td className="px-4 py-3 text-xs font-mono">{kw.count} times</td>
                        <td className="px-4 py-3 text-xs font-mono font-semibold">{kw.density}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full ${
                                  kw.glowType === 'emerald'
                                    ? 'bg-emerald-500'
                                    : kw.glowType === 'amber'
                                    ? 'bg-amber-500'
                                    : 'bg-indigo-500'
                                }`}
                                style={{ width: `${kw.prominence}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-slate-400">{kw.prominence}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BACKLINKS & ANCHOR WORDS PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'backlinks' && (
        <div className="space-y-6">
          {loadingBacklinks && (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Analyzing crawled link graph...</p>
            </div>
          )}

          {backlinkData && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Total Links Crawled
                  </span>
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {backlinkData.stats.totalLinksScanned}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {backlinkData.stats.internalLinks} Internal · {backlinkData.stats.externalLinks} Outbound
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Unique Anchor Words
                  </span>
                  <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                    {backlinkData.stats.uniqueAnchorWords}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">Anchor phrases detected</span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Empty Anchors Risk
                  </span>
                  <span
                    className={`text-3xl font-extrabold ${
                      backlinkData.stats.emptyAnchors > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                    }`}
                  >
                    {backlinkData.stats.emptyAnchors}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {backlinkData.stats.emptyAnchors > 0 ? 'Needs immediate fix' : 'All links labeled'}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Profile Health Status
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 block truncate">
                    {backlinkData.healthCheck.status}
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {backlinkData.healthCheck.riskLevel}
                  </span>
                </div>
              </div>

              {/* Anchor Text Distribution Portfolio */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Anchor Text Distribution & Target Benchmarks
                    </h3>
                    <p className="text-xs text-slate-500">
                      Google Penguin compliance model: prevents over-optimization penalties through natural diversification.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  {[
                    { label: 'Branded Anchors', data: backlinkData.distribution.branded, tip: 'Brand name or company domain' },
                    { label: 'Exact Match Keyword', data: backlinkData.distribution.exactMatch, tip: 'Identical to primary target keyword' },
                    { label: 'Partial Match / LSI', data: backlinkData.distribution.partialMatch, tip: 'Conversational phrases with keyword' },
                    { label: 'Generic Anchors', data: backlinkData.distribution.generic, tip: '"click here", "learn more", etc.' },
                    { label: 'Naked URLs', data: backlinkData.distribution.nakedUrl, tip: 'Raw https:// or www. hyperlinks' },
                    { label: 'Empty Anchors', data: backlinkData.distribution.emptyAnchors, tip: 'Links without text or alt labels' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                        <span className="text-xs font-extrabold text-violet-600 dark:text-violet-400 font-mono">
                          {item.data.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-violet-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, item.data.percentage)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{item.data.count} links</span>
                        <span className="text-brand-600 dark:text-brand-400 font-medium">
                          Target: {item.data.recommendedTarget}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Anchor Words & Target Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Anchor Words Found */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Top Crawled Anchor Words
                  </h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {backlinkData.topAnchorWords?.length > 0 ? (
                      backlinkData.topAnchorWords.map((anchor, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                            "{anchor.text}"
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-500 font-mono">{anchor.count}x</span>
                            <span className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 font-bold font-mono">
                              {anchor.percentage}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400">No anchor words extracted from crawl.</p>
                    )}
                  </div>
                </div>

                {/* Target Anchor Words for Outreach */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Recommended Target Anchor Portfolio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Use these exact anchor variations when acquiring external backlinks, guest posts, and press mentions:
                  </p>
                  <div className="space-y-2">
                    {backlinkData.targetAnchorRecommendations?.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/40 text-xs"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            "{rec.text}"
                          </span>
                          <span className="text-[11px] text-slate-400">{rec.category} Anchor</span>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 font-extrabold text-violet-600 dark:text-violet-400 font-mono border border-slate-200 dark:border-slate-700">
                          {rec.targetPercentage}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ready-to-Deploy Outreach Pitch Email Templates */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Ready-to-Deploy Backlink Outreach Pitch Templates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pre-filled with your target keyword and domain. Copy and send directly to industry editors.
                  </p>
                </div>

                <div className="space-y-4">
                  {backlinkData.outreachTemplates?.map((template) => (
                    <div
                      key={template.id}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-violet-600" />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {template.type}
                          </span>
                        </div>

                        <button
                          onClick={() => handleCopy(`${template.subject}\n\n${template.body}`, template.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-violet-500 transition-colors shadow-xs"
                        >
                          {copiedTemplateId === template.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 font-bold">Copied Email!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Template</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-2">
                        <p className="text-slate-500">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Subject:</span> {template.subject}
                        </p>
                        <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                          {template.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
