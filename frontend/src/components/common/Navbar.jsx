import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Sun, Moon, Menu, X, ArrowRight, LayoutDashboard, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import TurboBoostModal from './TurboBoostModal';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [turboOpen, setTurboOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                siteglow<span className="text-brand-600 dark:text-brand-400">-ai</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">
                SEO Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              How It Works
            </a>
          </nav>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Admin Portal link */}
            <Link
              to="/admin"
              title="Owner Admin Member Approvals"
              className="text-xs font-bold px-3 py-1.5 rounded-xl text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Admin</span>
            </Link>

            {/* Turbo Boost & Cache Button */}
            <button
              onClick={() => setTurboOpen(true)}
              title="Clean cache & boost speed"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-400/15 hover:bg-amber-400/25 border border-amber-500/30 transition-all hover:scale-105 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Turbo Boost</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-lg bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition-all hover:gap-2"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/admin"
              className="text-xs font-bold px-2.5 py-1 rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800"
            >
              Admin
            </Link>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-base font-bold text-indigo-600 dark:text-indigo-400"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Approvals (Owner Portal)</span>
          </Link>
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-slate-700 dark:text-slate-200 hover:text-brand-600"
          >
            How It Works
          </a>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/dashboard');
                }}
                className="w-full text-center py-2.5 font-semibold text-white bg-brand-600 rounded-lg"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 font-semibold text-slate-700 dark:text-slate-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Get Started Free
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setTurboOpen(true);
                  }}
                  className="w-full py-2 px-3 text-xs font-bold text-amber-900 dark:text-amber-200 bg-amber-400/20 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Turbo Boost & Clear Cache</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Turbo Boost Modal */}
      <TurboBoostModal isOpen={turboOpen} onClose={() => setTurboOpen(false)} />
    </header>
  );
}
