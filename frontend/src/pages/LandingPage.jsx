import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Search,
  Zap,
  Globe,
  BarChart3,
  Bot,
  Layers,
  Code2,
  Check,
  Lock
} from 'lucide-react';
import ScoreBadge from '../components/common/ScoreBadge';

export default function LandingPage() {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStartAudit = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a website URL');
      return;
    }
    setError('');
    navigate(`/dashboard/new?url=${encodeURIComponent(urlInput.trim())}`);
  };

  const features = [
    {
      icon: Search,
      title: 'Technical SEO',
      description: 'Find crawling, indexing, robots.txt, sitemap, SSL, redirect loops, and structural HTML issues across multiple pages.',
      badge: 'Crawler Engine',
    },
    {
      icon: Layers,
      title: 'On-Page SEO',
      description: 'Analyze title tags, meta descriptions, H1-H6 hierarchy, link distribution, and image alt text compliance.',
      badge: 'Rules Engine',
    },
    {
      icon: Bot,
      title: 'AI Recommendations',
      description: 'Intelligent explanations synthesized strictly from live audit results. Never generic or invented advice.',
      badge: 'AI Powered',
    },
    {
      icon: BarChart3,
      title: 'SEO Score (0–100)',
      description: 'Calculated using real industry weights: 25% Technical, 25% On-Page, 20% Content, 15% Performance, and more.',
      badge: 'Real Math',
    },
    {
      icon: FileText,
      title: 'Professional Reports',
      description: 'Generate comprehensive, executive-ready downloadable PDF reports with issues breakdown and action plans.',
      badge: 'PDF Ready',
    },
    {
      icon: Globe,
      title: 'Audit History',
      description: 'Track SEO improvements over time, compare historical audits, and visualize score growth side-by-side.',
      badge: 'History & Diff',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Enter Website URL',
      description: 'Submit any public domain. Our SSRF-safe gateway validates accessibility and domain status.',
    },
    {
      number: '02',
      title: 'Real-Time Deep Crawl',
      description: 'Our crawler parses internal links, verifies HTTP status codes, and extracts DOM structure.',
    },
    {
      number: '03',
      title: 'SEO Rules & Scoring',
      description: '50+ rigorous audits evaluate technical health, on-page factors, content depth, and structured data.',
    },
    {
      number: '04',
      title: 'AI Fixes & PDF Export',
      description: 'Review prioritized fixes, copy AI-generated meta tags or schema, and export PDF audits for clients.',
    },
  ];

  return (
    <div className="space-y-24 py-12 sm:py-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 sm:pt-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider mb-8 shadow-xs">
          <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Production-Ready SEO Intelligence</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
          Audit Your Website <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-cyan-500">
            with Real AI Insights
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Find SEO problems, understand why they matter, and get AI-powered recommendations to improve your website ranking. No fake scores.
        </p>

        {/* Audit Form Box */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleStartAudit}
            className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none focus-within:border-brand-500 dark:focus-within:border-brand-500 transition-all"
          >
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Globe className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError('');
                }}
                placeholder="https://yourwebsite.com"
                className="w-full pl-10 pr-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-base focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <span>Analyze Website</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {error && <p className="mt-2 text-xs font-semibold text-rose-500 text-left pl-2">{error}</p>}

          <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              SSRF & IP Guard Protected
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-500" />
              Real Crawler Analysis
            </span>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-brand-600 dark:text-brand-400 underline hover:opacity-80 font-semibold"
            >
              View Demo Dashboard
            </button>
          </div>
        </div>

        {/* Live Score Preview Card */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-1 flex flex-col items-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-6">
              <ScoreBadge score={84} size="lg" showLabel={true} />
              <span className="text-xs text-slate-500 mt-2">Sample Real-World Audit</span>
            </div>

            <div className="md:col-span-3 space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Score Breakdown</span>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 38 Checks Passed
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Technical SEO</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">88/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">On-Page SEO</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">79/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Content Quality</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">73/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Performance</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">84/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Structured Data</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">91/100</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Local & Social</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">86/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Comprehensive Analysis
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Real SEO Engineers & Agencies
          </h3>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
            From technical indexability to AI-generated meta descriptions, our platform gives you the full picture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="group relative p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/50 dark:hover:border-brand-500/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold uppercase rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {f.badge}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-16 border border-slate-800 relative overflow-hidden shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-400 mb-2">
              Step-by-Step Flow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              From URL to Actionable Code Fixes
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            {steps.map((s, idx) => (
              <div key={idx} className="flex flex-col space-y-3">
                <span className="text-4xl font-extrabold text-brand-500/30 dark:text-brand-400/20 font-mono">
                  {s.number}
                </span>
                <h4 className="text-lg font-bold text-white">{s.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 mb-2">
            Simple Pricing
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transparent Plans for Growing Brands
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Starter Plan */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Free Auditor</h4>
              <p className="text-xs text-slate-500 mt-1">Perfect for single websites & hobbyists</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Up to 20 crawled pages</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Full technical & on-page checks</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> 0–100 Weighted score engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> AI Executive summary</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/dashboard/new')}
              className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Start Free Audit
            </button>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-600 shadow-xl flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
              Most Popular
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Pro Consultant</h4>
              <p className="text-xs text-slate-500 mt-1">For web agencies & growth consultants</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$49</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Up to 100 crawled pages per audit</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Downloadable White-Label PDF reports</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Interactive AI Consultant Chatbot</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Auto-Generated HTML/Schema code fixes</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Historical audit comparisons</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="mt-8 w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
            >
              Get Started with Pro
            </button>
          </div>

          {/* Agency Plan */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Enterprise Agency</h4>
              <p className="text-xs text-slate-500 mt-1">High-volume audits & client pipelines</p>
              <div className="mt-6 mb-6">
                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">$149</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Unlimited monthly audits</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Priority multi-threaded crawler queue</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Custom branding on PDF exports</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> REST API programmatic access</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="mt-8 w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
