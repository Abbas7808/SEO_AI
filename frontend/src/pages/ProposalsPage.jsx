import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Send,
  Download,
  Copy,
  Check,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Trash2,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { agencyApi } from '../services/api';

const PRESET_PACKAGES = [
  {
    title: 'Starter SEO Booster',
    price: 350,
    currency: 'USD',
    deliverables: [
      'Comprehensive Technical SEO & Speed Audit',
      'Fix Top 15 High-Severity Errors & Broken Links',
      'Meta Titles & Descriptions Optimization for 10 Key Pages',
      'Google Search Console & XML Sitemap Verification',
      'Monthly Ranking & Traffic Progress Report'
    ]
  },
  {
    title: 'Full Growth & Authority Retainer',
    price: 750,
    currency: 'USD',
    deliverables: [
      'Complete On-Page & Technical Codebase Optimization',
      'Keyword Research & Top 20 Keyword Rank Tracking',
      'Content Optimization & AI Keyword Density Enhancements',
      'Schema.org JSON-LD Structured Data Implementation',
      'Core Web Vitals & Mobile Speed Acceleration (90+ Score)',
      'Bi-Weekly Strategy Calls & 24/7 Client Portal Access'
    ]
  },
  {
    title: 'Enterprise SEO Dominance',
    price: 1500,
    currency: 'USD',
    deliverables: [
      'Full Site Architecture & Crawlability Overhaul',
      'Tracking for 50+ High-Intent Commercial Keywords',
      'Competitor Gap Analysis & Steal-Rankings Strategy',
      'High-Authority Niche Relevant Backlinks Acquisition',
      'Dedicated SEO Consultant & Custom SLA Guarantee',
      'Weekly Executive Dashboard & Priority Support'
    ]
  }
];

export default function ProposalsPage() {
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('clientId');

  const [proposals, setProposals] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedPitchId, setCopiedPitchId] = useState(null);

  // Proposal Creation State
  const [formData, setFormData] = useState({
    clientId: preselectedClientId || '',
    title: 'Professional SEO Growth & Ranking Proposal',
    scopeDescription: 'Comprehensive search engine optimization strategy to improve organic keyword rankings, fix critical technical bottlenecks, and increase inbound leads and revenue.',
    deliverables: PRESET_PACKAGES[1].deliverables,
    price: 750,
    currency: 'USD',
    validUntil: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  });

  const [deliverableInput, setDeliverableInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        agencyApi.getProposals(),
        agencyApi.getClients(),
      ]);
      if (pRes && pRes.data) setProposals(pRes.data);
      if (cRes && cRes.data) {
        setClients(cRes.data);
        if (preselectedClientId && !formData.clientId) {
          setFormData((prev) => ({ ...prev, clientId: preselectedClientId }));
          setShowCreateModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to load proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.title.trim()) return;

    try {
      setSaving(true);
      const res = await agencyApi.createProposal({
        ...formData,
        price: Number(formData.price),
      });

      if (res && res.data) {
        setProposals((prev) => [res.data, ...prev]);
        setShowCreateModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to create proposal');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await agencyApi.updateProposal(id, { status });
      setProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status } : p))
      );
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDeleteProposal = async (id) => {
    if (!window.confirm('Delete this proposal?')) return;
    try {
      await agencyApi.deleteProposal(id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete proposal');
    }
  };

  const handleCopyWhatsAppPitch = (proposal) => {
    const client = clients.find((c) => c.id === proposal.client_id) || {};
    const delivs = Array.isArray(proposal.deliverables)
      ? proposal.deliverables
      : typeof proposal.deliverables === 'string'
      ? JSON.parse(proposal.deliverables || '[]')
      : [];

    const text = `Hi ${client.name || 'there'}! 👋\n\nI just finished analyzing your website (${client.website_url || 'your business site'}) and prepared a customized SEO Growth Proposal to get you to Page 1 on Google.\n\n🎯 *Proposal:* ${proposal.title}\n💰 *Investment:* ${proposal.currency === 'PKR' ? '₨' : '$'}${proposal.price.toLocaleString()}/month\n\n🚀 *What is Included:*\n${delivs.map((d) => `• ${d}`).join('\n')}\n\nLet's schedule a quick 10-minute call to discuss when we can kick off your rankings!`;

    navigator.clipboard.writeText(text);
    setCopiedPitchId(proposal.id);
    setTimeout(() => setCopiedPitchId(null), 2500);
  };

  const handleApplyPreset = (pkg) => {
    setFormData((prev) => ({
      ...prev,
      title: `${pkg.title} - Proposal`,
      deliverables: pkg.deliverables,
      price: pkg.price,
      currency: pkg.currency,
    }));
  };

  const addDeliverable = () => {
    if (!deliverableInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, deliverableInput.trim()],
    }));
    setDeliverableInput('');
  };

  const removeDeliverable = (idx) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <FileText className="w-3.5 h-3.5" />
              Client Closing Engine
            </span>
            <span className="text-xs text-slate-400 font-medium">SEO Proposals & Pitches</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            SEO Proposals & Retainer Pitches
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Win new clients with professional, high-converting SEO proposals. Customize deliverables, estimate ROI, and send instant WhatsApp/Email pitches.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Proposal</span>
          </button>
        </div>
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          <p className="text-xs text-slate-500">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            No Proposals Created Yet
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
            Create your first SEO proposal to pitch to a prospective client and start earning monthly retainer income.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Proposal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {proposals.map((p) => {
            const client = clients.find((c) => c.id === p.client_id);
            const delivs = Array.isArray(p.deliverables)
              ? p.deliverables
              : typeof p.deliverables === 'string'
              ? JSON.parse(p.deliverables || '[]')
              : [];

            return (
              <div
                key={p.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block mb-1">
                        Client: {client?.name || 'Prospect Client'}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        {p.title}
                      </h3>
                    </div>

                    <select
                      value={p.status || 'draft'}
                      onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                      className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border cursor-pointer ${
                        p.status === 'accepted'
                          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                          : p.status === 'sent'
                          ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                          : p.status === 'rejected'
                          ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="sent">Sent to Client</option>
                      <option value="accepted">Accepted 🎉</option>
                      <option value="rejected">Declined</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                    {p.scope_description}
                  </p>

                  {/* Pricing Box */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl mb-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                        Monthly Retainer Fee
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">
                        {p.currency === 'PKR' ? '₨' : '$'}
                        {Number(p.price || 0).toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal"> / month</span>
                      </span>
                    </div>

                    {p.valid_until && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                          Valid Until
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {new Date(p.valid_until).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Deliverables Bullet List */}
                  <div className="space-y-1.5 mb-5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Included Deliverables ({delivs.length})
                    </span>
                    {delivs.slice(0, 4).map((d, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{d}</span>
                      </div>
                    ))}
                    {delivs.length > 4 && (
                      <span className="text-[10px] text-slate-400 italic pl-5">
                        +{delivs.length - 4} more deliverables
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => handleCopyWhatsAppPitch(p)}
                    className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5 transition-all border border-emerald-500/20"
                  >
                    {copiedPitchId === p.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Pitch Copied!</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Copy WhatsApp Pitch</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeleteProposal(p.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg"
                    title="Delete Proposal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Proposal Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">
                    Create SEO Proposal
                  </h2>
                  <p className="text-xs text-slate-500">Pick a preset package or customize</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Presets Quick-Select */}
            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Quick-Apply Strategy Package:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {PRESET_PACKAGES.map((pkg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(pkg)}
                    className="p-3 rounded-2xl text-left border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-all text-xs"
                  >
                    <div className="font-extrabold text-slate-900 dark:text-white">{pkg.title}</div>
                    <div className="text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                      ${pkg.price}/mo
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Client *
                  </label>
                  <select
                    required
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Client --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.company ? `(${c.company})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Proposal Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. 6-Month SEO Growth & Ranking Strategy"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Scope & Executive Summary
                </label>
                <textarea
                  rows="2"
                  value={formData.scopeDescription}
                  onChange={(e) => setFormData({ ...formData, scopeDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                ></textarea>
              </div>

              {/* Deliverables List Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverables & Action Items
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={deliverableInput}
                    onChange={(e) => setDeliverableInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                    placeholder="Add a deliverable e.g. Fix broken internal links"
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {formData.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800"
                    >
                      <span className="text-slate-800 dark:text-slate-200 flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(idx)}
                        className="text-slate-400 hover:text-rose-500 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Investment
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="PKR">PKR (₨)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2"
                >
                  {saving ? 'Generating...' : 'Save & Prepare Pitch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
