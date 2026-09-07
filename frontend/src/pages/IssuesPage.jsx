import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Code2,
  Milestone,
  Link2
} from 'lucide-react';
import { auditApi } from '../services/api';
import { getSeverityBadge } from '../utils/formatters';

export default function IssuesPage() {
  const [searchParams] = useSearchParams();
  const auditId = searchParams.get('auditId');

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedIssue, setExpandedIssue] = useState(null);

  // Mock initial demo issues if newly loaded without specific backend audit items
  const demoIssues = [
    {
      id: 1,
      severity: 'critical',
      issue_type: 'missing_h1',
      title: 'Missing H1 Heading Tag',
      page_url: 'https://example.com/',
      description: 'The page does not contain a top-level <h1> heading tag.',
      impact: 'Search engines rely heavily on the H1 tag to identify the primary subject matter of the page.',
      recommendation: 'Add a single, descriptive <h1> element that encapsulates the primary page keyword.',
      suggested_fix: '<h1>Professional SEO Audit & Optimization Services</h1>',
    },
    {
      id: 2,
      severity: 'high',
      issue_type: 'missing_meta_description',
      title: 'Missing Meta Description',
      page_url: 'https://example.com/about',
      description: 'The page does not contain a <meta name="description"> tag.',
      impact: 'Search engines may generate an arbitrary and unsuitable search snippet, lowering click-through rates (CTR).',
      recommendation: 'Add a unique, relevant meta description between 120 and 160 characters.',
      suggested_fix: '<meta name="description" content="Discover how our SEO intelligence engine audits web performance, tracks indexing issues, and delivers automated AI-powered fixes.">',
    },
    {
      id: 3,
      severity: 'high',
      issue_type: 'images_missing_alt',
      title: '12 Images Missing Alt Text',
      page_url: 'https://example.com/services',
      description: 'Multiple <img> elements lack descriptive alt attributes.',
      impact: 'Impedes web accessibility for screen readers and deprives the website of Google Image Search traffic.',
      recommendation: 'Add meaningful alt attributes describing the graphic content or context of each image.',
      suggested_fix: '<img src="/assets/cctv-camera.jpg" alt="High-definition 4K indoor security CCTV camera" />',
    },
    {
      id: 4,
      severity: 'medium',
      issue_type: 'missing_schema',
      title: 'Missing Organization / LocalBusiness Schema',
      page_url: 'https://example.com/',
      description: 'No JSON-LD structured data detected on the homepage.',
      impact: 'Restricts Google Knowledge Graph eligibility and rich search snippet enhancements.',
      recommendation: 'Implement JSON-LD Schema.org markup for Organization or LocalBusiness.',
      suggested_fix: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Safdar Mobile Store",
  "telephone": "+92-300-1234567",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Hangu",
    "addressRegion": "KPK"
  }
}
</script>`,
    },
    {
      id: 5,
      severity: 'low',
      issue_type: 'no_canonical',
      title: 'Self-referencing Canonical Missing',
      page_url: 'https://example.com/contact',
      description: 'Page does not declare a canonical link rel="canonical".',
      impact: 'May risk duplicate content flags if accessed via parameter URLs or trailing slashes.',
      recommendation: 'Specify the authoritative canonical URL in the HTML <head>.',
      suggested_fix: '<link rel="canonical" href="https://example.com/contact" />',
    },
    {
      id: 6,
      severity: 'passed',
      issue_type: 'https_active',
      title: 'Valid SSL & HTTPS Active',
      page_url: 'https://example.com/',
      description: 'The site enforces strong HTTPS encryption with valid TLS certificate.',
      impact: 'Ensures data protection and satisfies standard search engine ranking signals.',
      recommendation: 'No action required. Security certificate is in good standing.',
      suggested_fix: null,
    },
  ];

  useEffect(() => {
    async function loadIssues() {
      if (auditId) {
        try {
          setLoading(true);
          const res = await auditApi.getIssues(auditId);
          if (res?.data?.issues && res.data.issues.length > 0) {
            setIssues(res.data.issues);
          } else {
            setIssues(demoIssues);
          }
        } catch (err) {
          setIssues(demoIssues);
        } finally {
          setLoading(false);
        }
      } else {
        setIssues(demoIssues);
        setLoading(false);
      }
    }
    loadIssues();
  }, [auditId]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter and search
  const filteredIssues = issues.filter((issue) => {
    const matchesFilter = activeFilter === 'all' || issue.severity === activeFilter;
    const matchesSearch =
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.page_url && issue.page_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.issue_type && issue.issue_type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const counts = {
    all: issues.length,
    critical: issues.filter((i) => i.severity === 'critical').length,
    high: issues.filter((i) => i.severity === 'high').length,
    medium: issues.filter((i) => i.severity === 'medium').length,
    low: issues.filter((i) => i.severity === 'low').length,
    passed: issues.filter((i) => i.severity === 'passed').length,
  };

  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SEO Issues & Fixes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Detailed diagnostic findings detected during the audit with actionable code and content remedies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/dashboard/roadmap${auditId ? `?auditId=${auditId}` : ''}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/20 transition-all"
          >
            <Milestone className="w-3.5 h-3.5" />
            <span>View Full Roadmap</span>
          </button>

          <button
            onClick={() => navigate(`/dashboard/backlit-words${auditId ? `?auditId=${auditId}` : ''}`)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white shadow-sm shadow-violet-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Backlit Words & Links</span>
          </button>
        </div>
      </div>

      {/* Severity Counters Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: 'all', label: 'All Issues', count: counts.all, color: 'slate' },
          { key: 'critical', label: 'Critical', count: counts.critical, color: 'rose' },
          { key: 'high', label: 'High Priority', count: counts.high, color: 'orange' },
          { key: 'medium', label: 'Medium', count: counts.medium, color: 'amber' },
          { key: 'low', label: 'Low / Minor', count: counts.low, color: 'blue' },
          { key: 'passed', label: 'Passed Checks', count: counts.passed, color: 'emerald' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveFilter(item.key)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeFilter === item.key
                ? 'border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-950/40'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              {item.label}
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issues by title, URL, or type..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Issues Found</h3>
            <p className="text-xs text-slate-500">All checks in this category are in good standing.</p>
          </div>
        ) : (
          filteredIssues.map((issue) => {
            const badge = getSeverityBadge(issue.severity);
            const isExpanded = expandedIssue === issue.id;

            return (
              <div
                key={issue.id}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider border ${badge.bg}`}>
                      {badge.text}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {issue.title}
                    </h3>
                  </div>

                  {issue.page_url && (
                    <a
                      href={issue.page_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1 font-mono truncate max-w-xs"
                    >
                      <span className="truncate">{issue.page_url}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  )}
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {issue.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Why It Matters (Impact):</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{issue.impact}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">Recommended Action:</span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{issue.recommendation}</p>
                  </div>
                </div>

                {/* Suggested Fix Section */}
                {issue.suggested_fix && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        AI Suggested Implementation / Fix
                      </span>
                      <button
                        onClick={() => handleCopy(issue.suggested_fix, issue.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-500 transition-colors"
                      >
                        {copiedId === issue.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Fix</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800">
                      <code>{issue.suggested_fix}</code>
                    </pre>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
