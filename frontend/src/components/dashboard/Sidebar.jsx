import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  History,
  AlertTriangle,
  Bot,
  FileEdit,
  FileText,
  Settings,
  LogOut,
  Sparkles,
  X,
  Layers,
  ChevronRight,
  Milestone,
  FileSearch,
  GitCompare,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/dashboard/new', label: 'Start Audit', icon: Search },
    { to: '/dashboard/roadmap', label: 'SEO Roadmap', icon: Milestone, badge: 'New' },
    { to: '/dashboard/antigravity', label: 'Antigravity Auto-Fixer', icon: Cpu, badge: 'Agent' },
    { to: '/dashboard/backlit-words', label: 'Backlit Words & Links', icon: Sparkles, badge: 'AI' },
    { to: '/dashboard/issues', label: 'SEO Issues', icon: AlertTriangle },
    { to: '/dashboard/pages', label: 'Page Analysis', icon: Layers },
    { to: '/dashboard/inspector', label: 'Site Inspector', icon: FileSearch },
    { to: '/dashboard/compare', label: 'Competitor Compare', icon: GitCompare },
    { to: '/dashboard/consultant', label: 'AI Consultant', icon: Bot, badge: 'AI' },
    { to: '/dashboard/optimizer', label: 'Content Optimizer', icon: FileEdit, badge: 'AI' },
    { to: '/dashboard/reports', label: 'Reports', icon: FileText },
    { to: '/dashboard/history', label: 'Audit History', icon: History },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base leading-tight tracking-tight text-slate-900 dark:text-white">
              AI SEO <span className="text-brand-600 dark:text-brand-400">Auditor</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
              SaaS Engine
            </span>
          </div>
        </NavLink>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold uppercase rounded bg-brand-100 dark:bg-brand-900/50 text-brand-700 dark:text-brand-300">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer / Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
        <div className="px-3 py-2 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs uppercase">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {user?.name || 'SEO Analyst'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {user?.email || 'analyst@audit.local'}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </div>
    </>
  );
}
