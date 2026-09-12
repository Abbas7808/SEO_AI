import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  X,
  CreditCard
} from 'lucide-react';
import { PRICING_PLANS } from '../../utils/planLimits';

export default function TrialLimitModal({ isOpen, onClose, triggerReason = 'trial_exceeded' }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const proPlan = PRICING_PLANS.find((p) => p.id === 'pro') || PRICING_PLANS[1];

  const handleGoToBilling = () => {
    onClose?.();
    navigate('/dashboard/billing');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Gradient Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-brand-600 to-indigo-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-amber-300" />
            {triggerReason === 'pro_feature' ? 'Pro Feature Locked' : 'Free Demo Limit Reached'}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
            {triggerReason === 'pro_feature'
              ? 'Unlock Full Pro Capabilities'
              : 'You Have Reached Your 3 Free Trial Audits'}
          </h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1">
            {triggerReason === 'pro_feature'
              ? 'This feature is available exclusively on Pro Specialist and Agency plans.'
              : 'The free demo allows 3 project trials. Upgrade to Pro Specialist for unlimited website audits.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Price highlight */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Pro Specialist Plan
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl font-black text-slate-900 dark:text-white">$19</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/month</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-1.5">
                  (or 2,999 PKR)
                </span>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Unlimited Access</span>
            </div>
          </div>

          {/* Pro Benefits list */}
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              What you unlock with Pro:
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Unlimited website project audits</strong> (no 3-audit limit)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Deep crawl</strong> up to 50 discovered pages per website</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Antigravity 1-Click Code Patch</strong> downloads</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>White-Label PDF Reports</strong> ready for client delivery</span>
              </li>
            </ul>
          </div>

          {/* Payment info note */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2.5">
            <CreditCard className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Pay via <strong>EasyPaisa</strong>, <strong>JazzCash</strong>, <strong>Bank Transfer</strong>, or <strong>PayPal</strong> and upload your screenshot for quick approval.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleGoToBilling}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 shadow-md shadow-brand-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Make Payment & Upgrade</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
