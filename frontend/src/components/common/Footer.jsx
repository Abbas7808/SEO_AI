import React from 'react';
import { Sparkles, Shield, Cpu, Code2, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
                AI SEO <span className="text-brand-600 dark:text-brand-400">Auditor</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Production-ready SEO audit & optimization platform powered by real website crawling, technical analysis, and intelligent AI recommendations.
            </p>
          </div>

          {/* Product Col */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Audit Capabilities
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">Technical SEO Crawler</a></li>
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">On-Page Meta & Headings</a></li>
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">Schema & Structured Data</a></li>
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">Social OpenGraph & Twitter</a></li>
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400">0–100 Weighted Score</a></li>
            </ul>
          </div>

          {/* AI Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              AI Powered Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dashboard/optimizer" className="hover:text-brand-600 dark:hover:text-brand-400">Content Optimizer</Link></li>
              <li><Link to="/dashboard/consultant" className="hover:text-brand-600 dark:hover:text-brand-400">AI SEO Consultant</Link></li>
              <li><Link to="/dashboard/issues" className="hover:text-brand-600 dark:hover:text-brand-400">Fix Code Generator</Link></li>
              <li><Link to="/dashboard/reports" className="hover:text-brand-600 dark:hover:text-brand-400">PDF Report Generator</Link></li>
            </ul>
          </div>

          {/* Security & Architecture */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Security & Engine
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-emerald-500" /> SSRF & Private IP Guard</li>
              <li className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-brand-500" /> Queue-based Modular Crawler</li>
              <li className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-blue-500" /> MySQL Relational Schema</li>
              <li className="text-xs text-slate-400 pt-2">No fake scores • 100% Calculated</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Website SEO Auditor. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
