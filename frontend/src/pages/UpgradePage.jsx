import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Crown,
  CheckCircle2,
  Lock,
  Upload,
  CreditCard,
  Building,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Key,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  PRICING_PLANS,
  PAYMENT_METHODS,
  getUserPlan,
  getTrialUsage,
  submitPaymentProof,
  redeemLicenseKey
} from '../utils/planLimits';

export default function UpgradePage() {
  const { user } = useAuth();
  const userEmail = user?.email || '';

  const [currentPlan, setCurrentPlan] = useState('free');
  const [trialUsage, setTrialUsage] = useState({ auditsCount: 0, auditsRemaining: 3, isLimitReached: false });
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [transactionId, setTransactionId] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const fileInputRef = useRef(null);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [pendingSubmission, setPendingSubmission] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');

  // License Key Redemption
  const [licenseKeyInput, setLicenseKeyInput] = useState('');
  const [redeemFeedback, setRedeemFeedback] = useState(null);

  // Refresh plan status on mount
  useEffect(() => {
    refreshPlanState();
  }, [userEmail]);

  const refreshPlanState = () => {
    const activePlan = getUserPlan(userEmail);
    setCurrentPlan(activePlan);
    const usage = getTrialUsage(userEmail);
    setTrialUsage(usage);

    // Check if there is a pending payment submission
    try {
      const pending = localStorage.getItem(`seo_pending_payment_${userEmail.toLowerCase().trim()}`);
      if (pending) {
        setPendingSubmission(JSON.parse(pending));
      }
    } catch (e) {}
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // Handle image upload & base64 encoding
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please upload an image file (PNG, JPG, or JPEG).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setFormError('Screenshot image must be under 5MB.');
      return;
    }

    setFormError('');
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotBase64(reader.result);
      setScreenshotPreview(reader.result);
    };
    reader.onerror = () => {
      setFormError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshotBase64('');
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitProof = (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!transactionId.trim()) {
      setFormError('Please enter the Transaction ID (TID) or reference number.');
      return;
    }
    if (!screenshotBase64) {
      setFormError('Please attach a screenshot or photo of your payment receipt.');
      return;
    }

    setSubmitting(true);
    try {
      const newRequest = submitPaymentProof({
        name,
        email,
        plan: selectedPlan,
        paymentMethod: selectedMethod,
        transactionId,
        screenshotBase64,
        notes
      });

      setSubmissionSuccess(true);
      setPendingSubmission(newRequest);
      setFormError('');
    } catch (err) {
      setFormError(err.message || 'Failed to submit payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRedeem = (e) => {
    e.preventDefault();
    setRedeemFeedback(null);

    const res = redeemLicenseKey(licenseKeyInput, userEmail);
    setRedeemFeedback(res);

    if (res.success) {
      setLicenseKeyInput('');
      refreshPlanState();
    }
  };

  const isProActive = currentPlan === 'pro' || currentPlan === 'agency';

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>SiteGlow AI Membership</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Upgrade Your SEO Superpowers
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base">
          Free demo gives you 3 website audit trials with essential features. Upgrade to unlock unlimited scans, deep 50+ page crawls, and Antigravity auto-patches.
        </p>

        {/* Current status pill */}
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">Current Plan:</span>
          <span className="font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
            {currentPlan} {isProActive ? 'Active' : 'Trial'}
          </span>
          {!isProActive && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {trialUsage.auditsCount} of 3 trials used ({trialUsage.auditsRemaining} remaining)
            </span>
          )}
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {PRICING_PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => plan.id !== 'free' && setSelectedPlan(plan.id)}
              className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all cursor-pointer ${
                plan.popular
                  ? 'bg-gradient-to-b from-brand-50/60 to-white dark:from-brand-950/30 dark:to-slate-900 border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
              } ${isSelected && plan.id !== 'free' ? 'ring-2 ring-brand-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Crown className="w-3 h-3 text-amber-300" />
                  <span>Most Popular</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
                      Active
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                      {plan.priceUsd === 0 ? 'Free' : `$${plan.priceUsd}`}
                    </span>
                    {plan.priceUsd > 0 && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">/month</span>
                    )}
                  </div>
                  {plan.pricePkr > 0 && (
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                      PKR {plan.pricePkr.toLocaleString()} / month
                    </p>
                  )}
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {plan.auditsAllowed === 'Unlimited' ? 'Unlimited audits & scans' : `${plan.auditsAllowed} total website trials`}
                  </p>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
                    Included Features:
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}

                  {plan.lockedFeatures?.map((locked, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-400 dark:text-slate-600 line-through">
                      <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0 mt-0.5" />
                      <span>{locked}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                {plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  >
                    Default Free Trial
                  </button>
                ) : (
                  <button
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <span>{isSelected ? 'Selected For Upgrade' : `Select ${plan.name}`}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Approval Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Owner Payment Methods */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <CreditCard className="w-4 h-4" />
                <span>Step 1: Send Payment</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Official Nextsoft Payment Accounts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose any official account below. Copy the details, transfer the fee, and save your receipt screenshot.
              </p>
            </div>

            {/* Payment Method Selector Pills */}
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((method) => {
                const active = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-2xl text-left text-xs transition-all border ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500 text-brand-700 dark:text-brand-300 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{method.name}</span>
                      {active && <Check className="w-3 h-3 text-brand-600" />}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{method.badge}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Payment Details Box */}
            {(() => {
              const active = PAYMENT_METHODS.find((m) => m.id === selectedMethod) || PAYMENT_METHODS[0];
              return (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {active.name} Details
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                      {active.badge}
                    </span>
                  </div>

                  {active.bankName && (
                    <div className="text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Bank Name:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{active.bankName}</span>
                    </div>
                  )}

                  {active.accountTitle && (
                    <div className="text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Account Title:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{active.accountTitle}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(active.accountTitle, 'title')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title="Copy account title"
                      >
                        {copiedKey === 'title' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {active.accountNumber && (
                    <div className="text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Account / Mobile Number:</span>
                        <span className="font-black font-mono text-slate-900 dark:text-white text-sm">
                          {active.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(active.accountNumber, 'acc')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title="Copy account number"
                      >
                        {copiedKey === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {active.iban && (
                    <div className="text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">IBAN (Wire Transfer):</span>
                        <span className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                          {active.iban}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(active.iban, 'iban')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        title="Copy IBAN"
                      >
                        {copiedKey === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {active.paypalEmail && (
                    <div className="text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">PayPal Email:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{active.paypalEmail}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(active.paypalEmail, 'paypal')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      >
                        {copiedKey === 'paypal' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  {active.cryptoAddress && (
                    <div className="text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">USDT Address:</span>
                        <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200 break-all">
                          {active.cryptoAddress}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(active.cryptoAddress, 'crypto')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                      >
                        {copiedKey === 'crypto' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    ℹ️ {active.instructions}
                  </p>
                </div>
              );
            })()}

            {/* Nextsoft Branding Note */}
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                All payments are securely verified by{' '}
                <a
                  href="https://nexsoft.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline hover:text-indigo-900 dark:hover:text-indigo-100"
                >
                  Nextsoft
                </a>
                .
              </span>
            </div>
          </div>

          {/* Instant License Key Redemption Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Key className="w-4 h-4" />
              <span>Have a License Key?</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              If the site owner gave you a license key (e.g. from WhatsApp or Email), redeem it here for instant unlock:
            </p>

            <form onSubmit={handleRedeem} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="NEXTSOFT-PRO-XXXX-XXXX"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-700 transition-colors"
                >
                  Redeem
                </button>
              </div>

              {redeemFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                    redeemFeedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {redeemFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{redeemFeedback.message}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Screenshot Upload & Verification Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Pending Submission Banner if already sent */}
          {pendingSubmission && (
            <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-400 dark:border-amber-600/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                  <Clock className="w-5 h-5 animate-pulse" />
                  <span>Payment Review Pending</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-extrabold uppercase">
                  Awaiting Owner Approval
                </span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Your payment proof for <strong>{pendingSubmission.plan?.toUpperCase()}</strong> (TID: <code className="font-mono">{pendingSubmission.transactionId}</code>) was submitted on {new Date(pendingSubmission.submittedAt).toLocaleTimeString()}. The site owner is reviewing your screenshot. Once approved, your account will be activated with unlimited audits!
              </p>
              {pendingSubmission.screenshot && (
                <div className="pt-2 flex items-center gap-3">
                  <img
                    src={pendingSubmission.screenshot}
                    alt="Receipt proof"
                    className="w-16 h-16 object-cover rounded-xl border border-amber-300 shadow-xs"
                  />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400">
                    Payment proof attached securely.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Upload Form Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                <Upload className="w-4 h-4" />
                <span>Step 2: Upload Payment Proof</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Submit Receipt & Unlock Member Access
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Provide your transaction reference and screenshot so the site owner can verify and approve your membership.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {submissionSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Payment Proof Submitted Successfully!</span>
                  <span>
                    Thank you! The site administrator has received your transaction details and screenshot. Your account will be upgraded immediately upon review.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitProof} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Account Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    This is the email address that will be granted Pro access.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Selected Plan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Chosen Plan
                  </label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="pro">Pro Specialist ($19 / 2,999 PKR)</option>
                    <option value="agency">Agency Enterprise ($49 / 6,999 PKR)</option>
                  </select>
                </div>

                {/* Payment Method Used */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Payment Method Used
                  </label>
                  <select
                    value={selectedMethod}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction ID / Reference (TID) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. 19283746501 or Bank Transfer Ref #"
                  className="w-full px-3.5 py-2.5 font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Screenshot File Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Receipt Screenshot <span className="text-rose-500">*</span>
                </label>

                {!screenshotPreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-brand-500 dark:hover:border-brand-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/40 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Click to upload screenshot or drag & drop
                    </span>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      PNG, JPG, or JPEG up to 5MB
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800 flex items-center gap-4">
                    <img
                      src={screenshotPreview}
                      alt="Uploaded preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-300 dark:border-slate-700 shadow-xs"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                        Payment Screenshot Ready
                      </span>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Image loaded successfully
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeScreenshot}
                      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-500 transition-colors"
                      title="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific note or sender name..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 disabled:opacity-50 shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>{submitting ? 'Submitting Proof...' : 'Submit Payment Proof for Approval'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Owner Admin Link Footer Banner */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-brand-600" />
          <span>
            Are you the Site Owner / Administrator? Review and approve customer payment proofs.
          </span>
        </div>
        <Link
          to="/dashboard/admin-billing"
          className="px-4 py-2 rounded-xl font-bold text-xs bg-brand-600 hover:bg-brand-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span>Open Admin Approval Portal</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
