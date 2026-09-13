import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Trash2,
  Globe,
  ExternalLink,
  Award,
  Layers,
  ChevronDown,
  Sparkles,
  Zap,
  Target,
  BarChart2
} from 'lucide-react';
import { agencyApi } from '../services/api';

export default function KeywordTrackerPage() {
  const [keywords, setKeywords] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Keyword Form
  const [newKeyword, setNewKeyword] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [country, setCountry] = useState('US');
  const [device, setDevice] = useState('desktop');
  const [searchVolume, setSearchVolume] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clientsRes, keywordsRes] = await Promise.all([
        agencyApi.getClients(),
        agencyApi.getKeywords(),
      ]);

      if (clientsRes && clientsRes.data) {
        setClients(clientsRes.data);
      }
      if (keywordsRes && keywordsRes.data) {
        setKeywords(keywordsRes.data);
      }
    } catch (err) {
      console.error('Failed to load keywords/clients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    try {
      setSaving(true);
      const res = await agencyApi.addKeyword({
        keyword: newKeyword.trim(),
        targetUrl: targetUrl.trim() || undefined,
        country,
        device,
        searchVolume: searchVolume ? Number(searchVolume) : undefined,
      });

      if (res && res.data) {
        setKeywords((prev) => [res.data, ...prev]);
        setNewKeyword('');
        setTargetUrl('');
        setSearchVolume('');
        setShowAddModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to add keyword');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyword = async (id, kw) => {
    if (!window.confirm(`Stop tracking keyword "${kw}"?`)) return;
    try {
      await agencyApi.removeKeyword(id);
      setKeywords((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      alert('Failed to remove keyword');
    }
  };

  const handleRefreshAll = async () => {
    try {
      setRefreshing(true);
      const res = await agencyApi.trackAllKeywords();
      if (res && res.data) {
        // Re-fetch keywords
        const fresh = await agencyApi.getKeywords();
        if (fresh && fresh.data) {
          setKeywords(fresh.data);
        }
      }
    } catch (err) {
      alert('SERP check in progress or failed');
    } finally {
      setRefreshing(false);
    }
  };

  // Metrics
  const totalKeywords = keywords.length;
  const top3Count = keywords.filter((k) => k.current_position && k.current_position <= 3).length;
  const top10Count = keywords.filter(
    (k) => k.current_position && k.current_position <= 10
  ).length;
  const avgPosition =
    keywords.filter((k) => k.current_position).length > 0
      ? (
          keywords
            .filter((k) => k.current_position)
            .reduce((sum, k) => sum + k.current_position, 0) /
          keywords.filter((k) => k.current_position).length
        ).toFixed(1)
      : 'N/A';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-emerald-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Award className="w-3.5 h-3.5" />
              Live SERP Intelligence
            </span>
            <span className="text-xs text-slate-400 font-medium">Google Search Position Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Keyword Rank Tracker
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Monitor Google rankings for your clients. Show proof of SEO progress with top-3 positions, SERP movements, and search visibility.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={handleRefreshAll}
            disabled={refreshing || totalKeywords === 0}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 shadow-md transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Checking Google...' : 'Refresh All Positions'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Track New Keyword</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Tracked Keywords</span>
            <Target className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalKeywords}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active queries monitored</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Top 3 Rankings</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {top3Count}
          </div>
          <p className="text-xs text-emerald-600/80 font-medium mt-1">High-traffic podium spots</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>First Page (Top 10)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {top10Count}
          </div>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">
            Google Page 1 visibility
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <span>Average Position</span>
            <BarChart2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {avgPosition !== 'N/A' ? `#${avgPosition}` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all tracked sites</p>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Target Keywords & SERP Rankings
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live Google SERP position check updated automatically
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Checking keyword rankings...</p>
          </div>
        ) : keywords.length === 0 ? (
          <div className="text-center py-16 p-8">
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No Keywords Added Yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
              Add target search terms that your client wants to rank for on Google.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Track Your First Keyword</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-6">Keyword</th>
                  <th className="py-3.5 px-4">Current Rank</th>
                  <th className="py-3.5 px-4">Change</th>
                  <th className="py-3.5 px-4">Best Rank</th>
                  <th className="py-3.5 px-4">Country & Device</th>
                  <th className="py-3.5 px-4">Target URL</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {keywords.map((kw) => {
                  const pos = kw.current_position;
                  const prev = kw.previous_position;
                  const change = prev && pos ? prev - pos : 0; // Positive = improved (e.g. was 10, now 5 -> +5)

                  return (
                    <tr
                      key={kw.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{kw.keyword}</span>
                          {pos && pos <= 3 && (
                            <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                              🏆 Top 3
                            </span>
                          )}
                        </div>
                        {kw.search_volume && (
                          <span className="text-[10px] text-slate-400">
                            Vol: {kw.search_volume.toLocaleString()}/mo
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {pos ? (
                          <span
                            className={`inline-flex items-center justify-center font-black px-2.5 py-1 rounded-xl text-xs ${
                              pos <= 3
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : pos <= 10
                                ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20'
                                : pos <= 20
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            #{pos}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Checking...</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {change > 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{change}
                          </span>
                        ) : change < 0 ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-600 dark:text-rose-400 text-xs">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {change}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-400 text-xs">
                            <Minus className="w-3 h-3" />
                            0
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {kw.best_position ? `#${kw.best_position}` : '-'}
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300">
                        <span className="uppercase font-bold text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-sm mr-1">
                          {kw.country || 'US'}
                        </span>
                        <span className="capitalize text-[11px] text-slate-400">
                          {kw.device || 'desktop'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {kw.target_url ? (
                          <a
                            href={kw.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                          >
                            <span className="truncate">{kw.target_url.replace(/^https?:\/\//, '')}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleDeleteKeyword(kw.id, kw.keyword)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Remove Keyword"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Track New Keyword
                  </h2>
                  <p className="text-xs text-slate-500">Monitor Google search ranking</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Search Keyword *
                </label>
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g. best dental clinic near me"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Target Ranking URL (Optional)
                </label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://clientwebsite.com/services"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="US">United States (US)</option>
                    <option value="PK">Pakistan (PK)</option>
                    <option value="UK">United Kingdom (UK)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AE">UAE (AE)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Device
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="desktop">Desktop</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center gap-2"
                >
                  {saving ? 'Adding...' : 'Start Tracking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
