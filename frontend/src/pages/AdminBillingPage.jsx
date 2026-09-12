import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  UserCheck,
  Key,
  CreditCard,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  X
} from 'lucide-react';
import {
  ADMIN_PASSCODE,
  OWNER_ACCOUNT,
  isProjectOwner,
  getAllPaymentRequests,
  approvePaymentRequest,
  rejectPaymentRequest,
  manualActivateMember,
  generateLicenseKey
} from '../utils/planLimits';
import { useAuth } from '../hooks/useAuth';

export default function AdminBillingPage() {
  const { user, loginAsOwner } = useAuth();
  const isOwner = isProjectOwner(user?.email) || user?.isOwner;

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Data
  const [requests, setRequests] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState({});
  const [licenseKeys, setLicenseKeys] = useState([]);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Screenshot Lightbox Modal
  const [activeScreenshot, setActiveScreenshot] = useState(null);

  // Manual Member Activation Form
  const [manualEmail, setManualEmail] = useState('');
  const [manualPlan, setManualPlan] = useState('pro');
  const [manualFeedback, setManualFeedback] = useState(null);

  // Key Generator
  const [newKeyPlan, setNewKeyPlan] = useState('pro');
  const [generatedKeyResult, setGeneratedKeyResult] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    // If logged in as project owner Munim Abbas or session admin unlocked, authenticate directly
    const sessionAuth = sessionStorage.getItem('seo_admin_authenticated');
    if (sessionAuth === 'true' || isOwner) {
      setIsAuthenticated(true);
      sessionStorage.setItem('seo_admin_authenticated', 'true');
      loadAllData();
    }
  }, [user, isOwner]);

  const loadAllData = () => {
    setRequests(getAllPaymentRequests());
    try {
      const members = JSON.parse(localStorage.getItem('seo_approved_members') || '{}');
      setApprovedMembers(members);
      const keys = JSON.parse(localStorage.getItem('seo_license_keys') || '[]');
      setLicenseKeys(keys);
    } catch (e) {}
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem('seo_admin_authenticated', 'true');
      setAuthError('');
      loadAllData();
    } else {
      setAuthError('Incorrect admin passcode. Default passcode is: NEXTSOFT_ADMIN_2025');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('seo_admin_authenticated');
    setIsAuthenticated(false);
    setPasscode('');
  };

  const handleApprove = (requestId) => {
    const success = approvePaymentRequest(requestId);
    if (success) {
      loadAllData();
    }
  };

  const handleReject = (requestId) => {
    const reason = window.prompt('Enter reason for rejection (optional):', 'Invalid or unverified transaction ID');
    if (reason !== null) {
      rejectPaymentRequest(requestId, reason);
      loadAllData();
    }
  };

  const handleManualActivate = (e) => {
    e.preventDefault();
    setManualFeedback(null);
    if (!manualEmail.trim() || !manualEmail.includes('@')) {
      setManualFeedback({ success: false, message: 'Please enter a valid customer email.' });
      return;
    }

    const success = manualActivateMember(manualEmail.trim(), manualPlan);
    if (success) {
      setManualFeedback({
        success: true,
        message: `Member ${manualEmail} successfully activated as ${manualPlan.toUpperCase()}!`
      });
      setManualEmail('');
      loadAllData();
    } else {
      setManualFeedback({ success: false, message: 'Failed to activate member.' });
    }
  };

  const handleRevokeMember = (email) => {
    if (window.confirm(`Revoke Pro access for ${email}?`)) {
      try {
        const members = JSON.parse(localStorage.getItem('seo_approved_members') || '{}');
        delete members[email];
        localStorage.setItem('seo_approved_members', JSON.stringify(members));
        loadAllData();
      } catch (e) {}
    }
  };

  const handleGenerateKey = () => {
    const key = generateLicenseKey(newKeyPlan);
    setGeneratedKeyResult(key);
    loadAllData();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.transactionId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // If not authenticated, show passcode screen
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-brand-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Admin Member Approval Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Site owner access to inspect customer payment proofs, approve members, and generate license keys.
          </p>
        </div>

        {authError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Master Admin Passcode
            </label>
            <input
              type="password"
              required
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode (NEXTSOFT_ADMIN_2025)"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">
              Default owner passcode: <code className="font-mono font-bold text-brand-600 dark:text-brand-400">NEXTSOFT_ADMIN_2025</code>
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Admin Panel</span>
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={() => {
              loginAsOwner();
              setIsAuthenticated(true);
            }}
            className="w-full py-2.5 px-3 rounded-xl font-extrabold text-xs bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant Login as Munim Abbas (Project Owner)</span>
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Control Panel • SiteGlow AI</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-black">
              <span>👑 Project Owner: Munim Abbas</span>
              <span className="text-[10px] opacity-70 font-mono">munimabbas@nexsoft.site</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Customer Payments & Member Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review uploaded payment receipts, unlock customer accounts, and issue instant license keys.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllData}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Pending Approvals
            </span>
            <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {pendingCount}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Pro Members
            </span>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {Object.keys(approvedMembers).length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated License Keys
            </span>
            <p className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {licenseKeys.length}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Key className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Section: Payment Submissions Table */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Payment Proof Submissions</span>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-500 text-white">
                  {pendingCount} new
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any receipt thumbnail to inspect the full image and approve the member.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, email, TID..."
                className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Only</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <CreditCard className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              No payment requests found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              When customers submit payment screenshots from the billing page, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 px-3">Customer</th>
                  <th className="pb-3 px-3">Plan & Amount</th>
                  <th className="pb-3 px-3">Method & TID</th>
                  <th className="pb-3 px-3">Screenshot Receipt</th>
                  <th className="pb-3 px-3">Date</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Owner Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Customer */}
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 dark:text-white">{req.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{req.email}</div>
                    </td>

                    {/* Plan */}
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold uppercase text-[10px]">
                        {req.plan}
                      </span>
                      <div className="text-[11px] text-slate-500 mt-0.5">{req.amount}</div>
                    </td>

                    {/* Method & TID */}
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                        {req.paymentMethod?.replace('_', ' ')}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500 font-bold">
                        TID: {req.transactionId}
                      </div>
                    </td>

                    {/* Screenshot thumbnail */}
                    <td className="py-3.5 px-3">
                      {req.screenshot ? (
                        <div
                          onClick={() => setActiveScreenshot(req.screenshot)}
                          className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 cursor-pointer group shadow-xs hover:border-brand-500"
                        >
                          <img
                            src={req.screenshot}
                            alt="Receipt"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No image</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-500">
                      {new Date(req.submittedAt).toLocaleDateString()}{' '}
                      <span className="block text-slate-400">
                        {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      {req.status === 'approved' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          Approved
                        </span>
                      )}
                      {req.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          Rejected
                        </span>
                      )}
                      {req.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 animate-pulse">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right space-x-2">
                      {req.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-3 py-1.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          Approve & Unlock
                        </button>
                      )}
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-2.5 py-1.5 rounded-xl font-medium text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Columns: Manual Member Activator & License Key Generator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: Manual Customer Activator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <UserCheck className="w-4 h-4" />
            <span>Instant Member Grant</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Directly Activate Any Member Email
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Received payment directly via WhatsApp, cash, or client contract? Type the customer's email below to unlock Pro access immediately.
          </p>

          {manualFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                manualFeedback.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {manualFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{manualFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleManualActivate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Customer Account Email
              </label>
              <input
                type="email"
                required
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                placeholder="customer@domain.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Membership Tier to Grant
              </label>
              <select
                value={manualPlan}
                onChange={(e) => setManualPlan(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="pro">Pro Specialist (Unlimited audits & features)</option>
                <option value="agency">Agency Enterprise (Full agency suite)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              <span>Activate Customer Now</span>
            </button>
          </form>

          {/* Currently Approved Members List */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Pro / Agency Members ({Object.keys(approvedMembers).length})
            </span>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {Object.keys(approvedMembers).length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No approved members yet.</p>
              ) : (
                Object.entries(approvedMembers).map(([email, info]) => (
                  <div key={email} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{email}</span>
                      <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                        {info.plan}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRevokeMember(email)}
                      className="text-[11px] text-rose-500 hover:underline"
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Column 2: One-Click License Key Generator */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <Key className="w-4 h-4" />
            <span>Prepaid License Keys</span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Generate One-Time License Keys
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate a unique key and send it to your customer via WhatsApp, SMS, or Email. They can redeem it on the billing page for instant auto-unlock.
          </p>

          <div className="flex gap-2">
            <select
              value={newKeyPlan}
              onChange={(e) => setNewKeyPlan(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="pro">Pro Specialist Key</option>
              <option value="agency">Agency Key</option>
            </select>
            <button
              onClick={handleGenerateKey}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-md shadow-brand-500/20 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Key</span>
            </button>
          </div>

          {generatedKeyResult && (
            <div className="p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 block">
                  New License Key Generated:
                </span>
                <span className="font-mono font-black text-sm text-slate-900 dark:text-white select-all">
                  {generatedKeyResult}
                </span>
              </div>
              <button
                onClick={() => handleCopy(generatedKeyResult)}
                className="px-3 py-1.5 rounded-xl font-bold text-xs bg-brand-600 text-white hover:bg-brand-700 flex items-center gap-1 transition-colors"
              >
                {copiedKey === generatedKeyResult ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generated Keys History */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              License Key Inventory ({licenseKeys.length})
            </span>
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {licenseKeys.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No keys generated yet.</p>
              ) : (
                licenseKeys.map((k) => (
                  <div key={k.key} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {k.key}
                      </span>
                      <span className="ml-2 px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {k.plan}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {k.redeemed ? (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Redeemed ({k.redeemedBy || 'User'})
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCopy(k.key)}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Lightbox Modal */}
      {activeScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Payment Proof Receipt Full Preview
              </span>
              <button
                onClick={() => setActiveScreenshot(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-auto flex items-center justify-center bg-slate-950/40">
              <img
                src={activeScreenshot}
                alt="Payment Screenshot"
                className="max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
