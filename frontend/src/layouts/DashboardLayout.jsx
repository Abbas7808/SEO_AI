import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Lock, Sparkles, ArrowRight, UserPlus, LogIn, ExternalLink } from 'lucide-react';
import Sidebar from '../components/dashboard/Sidebar';
import Topbar from '../components/dashboard/Topbar';
import { useAuth } from '../hooks/useAuth';

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const hasToken = !!localStorage.getItem('seo_token') || isAuthenticated;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Account creation requirement guard
  if (!hasToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 backdrop-blur-xl relative overflow-hidden">
          <div className="w-16 h-16 bg-indigo-600/20 border border-indigo-400/40 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Account Required
            </span>
            <h2 className="text-2xl font-black text-white">Create Account to Continue</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Please create an account or sign in to access your website audits, Master AI Solution Prompts, and SEO optimization tools.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Existing Account</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Topbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        {/* Dashboard Footer with Developer Attribution */}
        <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/50 dark:bg-slate-900/50 py-4 px-6 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} siteglow-ai &bull; Autonomous SEO Platform</span>
          <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
            <span>Developed By</span>
            <a
              href="https://www.linkedin.com/in/munim-abbas"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-extrabold hover:underline transition-all bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900"
            >
              <span>Munim Abbas</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
