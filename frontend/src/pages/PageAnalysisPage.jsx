import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Layers,
  Globe,
  ExternalLink,
  Search,
  FileCode,
  Image,
  Link2,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import ScoreBadge from '../components/common/ScoreBadge';
import { auditApi } from '../services/api';

export default function PageAnalysisPage() {
  const [searchParams] = useSearchParams();
  const queryAuditId = searchParams.get('auditId');

  const [auditsList, setAuditsList] = useState([]);
  const [selectedAuditId, setSelectedAuditId] = useState(queryAuditId || '');
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPage, setSelectedPage] = useState(null);

  const demoPages = [
    {
      id: 1,
      url: 'https://example.com/',
      status_code: 200,
      seo_score: 88,
      title: 'AI SEO Auditor - Production SEO Engine & Analyzer',
      meta_description: 'Complete SEO crawler and analysis system for modern SaaS applications.',
      canonical_url: 'https://example.com/',
      h1_count: 1,
      word_count: 1420,
      image_count: 14,
      images_missing_alt: 2,
      internal_link_count: 32,
      external_link_count: 5,
      load_time_ms: 320,
      page_size_kb: 48.5,
    },
    {
      id: 2,
      url: 'https://example.com/services',
      status_code: 200,
      seo_score: 74,
      title: 'Our Digital Services | Example Domain',
      meta_description: 'Explore full suite of SEO analysis and auditing services.',
      canonical_url: 'https://example.com/services',
      h1_count: 1,
      word_count: 890,
      image_count: 18,
      images_missing_alt: 12,
      internal_link_count: 24,
      external_link_count: 3,
      load_time_ms: 410,
      page_size_kb: 72.1,
    },
    {
      id: 3,
      url: 'https://example.com/about',
      status_code: 200,
      seo_score: 68,
      title: 'About Us',
      meta_description: null,
      canonical_url: null,
      h1_count: 0,
      word_count: 540,
      image_count: 6,
      images_missing_alt: 0,
      internal_link_count: 16,
      external_link_count: 2,
      load_time_ms: 280,
      page_size_kb: 34.0,
    },
    {
      id: 4,
      url: 'https://example.com/contact',
      status_code: 200,
      seo_score: 82,
      title: 'Contact Us - Get in Touch',
      meta_description: 'Contact our support and technical engineering team for inquiries.',
      canonical_url: 'https://example.com/contact',
      h1_count: 1,
      word_count: 420,
      image_count: 2,
      images_missing_alt: 0,
      internal_link_count: 12,
      external_link_count: 1,
      load_time_ms: 210,
      page_size_kb: 22.4,
    },
  ];

  // 1. Fetch audits list
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
        console.error('Failed to load audits:', err);
      }
    }
    loadAudits();
  }, []);

  // 2. Fetch real pages when auditId changes
  useEffect(() => {
    async function loadPages() {
      if (!selectedAuditId) {
        setPages(demoPages);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await auditApi.getPages(selectedAuditId);
        if (res?.data?.pages && res.data.pages.length > 0) {
          setPages(res.data.pages);
        } else {
          setPages(demoPages);
        }
      } catch (err) {
        setPages(demoPages);
      } finally {
        setLoading(false);
      }
    }
    loadPages();
  }, [selectedAuditId]);

  const filteredPages = pages.filter(
    (p) =>
      p.url.toLowerCase().includes(search.toLowerCase()) ||
      (p.title && p.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Page-Level Analysis
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review individual page audits, heading hierarchies, word counts, metadata, and link graphs.
          </p>
        </div>

        {auditsList.length > 0 && (
          <div className="relative">
            <select
              value={selectedAuditId}
              onChange={(e) => setSelectedAuditId(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 pr-8 cursor-pointer"
            >
              {auditsList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.website_url} ({a.pages_crawled || 0} pages)
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter crawled pages by URL or title..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Crawled Pages Table */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Page URL & Title</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">H1</th>
                <th className="px-5 py-3">Words</th>
                <th className="px-5 py-3">Images (No Alt)</th>
                <th className="px-5 py-3">Links</th>
                <th className="px-5 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPages.map((page) => (
                <tr
                  key={page.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  onClick={() => setSelectedPage(page)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-sm">
                          {page.url}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-sm">
                          {page.title || 'No Title Tag'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <ScoreBadge score={page.seo_score} size="sm" showLabel={false} />
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                      {page.status_code} OK
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {page.h1_count === 1 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">1</span>
                    ) : page.h1_count === 0 ? (
                      <span className="text-rose-600 dark:text-rose-400 font-bold text-xs">0 (Missing)</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-bold text-xs">{page.h1_count} (Multiple)</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-300">
                    {page.word_count.toLocaleString()}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <span className="text-slate-600 dark:text-slate-300">{page.image_count}</span>
                    {page.images_missing_alt > 0 && (
                      <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">
                        ({page.images_missing_alt} missing)
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {page.internal_link_count} int / {page.external_link_count} ext
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPage(page);
                      }}
                      className="px-3 py-1 text-xs font-semibold rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 hover:bg-brand-100"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Page Modal */}
      {selectedPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Page SEO Drill-Down</h3>
                <p className="text-xs text-slate-400 font-mono truncate max-w-md">{selectedPage.url}</p>
              </div>
              <ScoreBadge score={selectedPage.seo_score} size="sm" />
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Title Tag</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedPage.title || 'None'}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">Meta Description</span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  {selectedPage.meta_description || <span className="text-rose-500 font-bold">Missing</span>}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">H1 Count</span>
                  <span className="text-base font-extrabold">{selectedPage.h1_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Word Count</span>
                  <span className="text-base font-extrabold">{selectedPage.word_count}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Load Time</span>
                  <span className="text-base font-extrabold">{selectedPage.load_time_ms}ms</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">HTML Size</span>
                  <span className="text-base font-extrabold">{selectedPage.page_size_kb} KB</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPage(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
