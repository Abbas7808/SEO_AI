import React, { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Share2,
  Twitter,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit3,
  RotateCcw
} from 'lucide-react';

export default function SerpPreviewCard({ serpData = {}, defaultUrl = 'https://example.com' }) {
  const [activeTab, setActiveTab] = useState('desktop'); // 'desktop' | 'mobile' | 'facebook' | 'twitter'
  const [isEditing, setIsEditing] = useState(false);

  const initialTitle = serpData.desktop?.title || serpData.title || 'Premier Web Optimization & Digital Solutions';
  const initialDesc = serpData.desktop?.metaDescription || serpData.metaDescription || 'Explore our verified digital platform. Discover automated SEO tools, real-time auditing, and expert recommendations.';
  const initialUrl = serpData.desktop?.displayUrl || defaultUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDesc);
  const [displayUrl, setDisplayUrl] = useState(initialUrl);

  const titleChars = title.length;
  const descChars = description.length;
  const titlePixelEst = Math.round(titleChars * 9.6);

  // Status limits
  const isTitleGood = titleChars >= 40 && titleChars <= 60;
  const isTitleTooLong = titleChars > 60;
  const isDescGood = descChars >= 120 && descChars <= 160;
  const isDescTooLong = descChars > 160;

  const handleReset = () => {
    setTitle(initialTitle);
    setDescription(initialDesc);
    setDisplayUrl(initialUrl);
    setIsEditing(false);
  };

  const domain = displayUrl.split('/')[0];
  const breadcrumbs = displayUrl.includes('/') ? displayUrl.split('/').slice(1).join(' › ') : '';

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl transition-all">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Live SERP & Social Preview Simulator</span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Google 2026 Spec
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive pixel-precise preview of your organic search and social card appearance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isEditing
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Close Editor' : 'Test Live Title/Meta'}</span>
          </button>

          {isEditing && (
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
              title="Reset to crawled values"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Live Editor Drawer if toggled */}
      {isEditing && (
        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                SERP Title Tag
              </label>
              <span className={`font-mono text-[11px] font-bold ${isTitleTooLong ? 'text-rose-500' : isTitleGood ? 'text-emerald-500' : 'text-amber-500'}`}>
                {titleChars}/60 chars ({titlePixelEst}px / ~600px)
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter page title..."
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Meta Description Snippet
              </label>
              <span className={`font-mono text-[11px] font-bold ${isDescTooLong ? 'text-rose-500' : isDescGood ? 'text-emerald-500' : 'text-amber-500'}`}>
                {descChars}/160 chars
              </span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              placeholder="Enter meta description..."
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 pt-3 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('desktop')}
          className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-all ${
            activeTab === 'desktop'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <span>Google Desktop</span>
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-all ${
            activeTab === 'mobile'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Google Mobile</span>
        </button>

        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-all ${
            activeTab === 'facebook'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Facebook Card</span>
        </button>

        <button
          onClick={() => setActiveTab('twitter')}
          className={`flex items-center gap-1.5 pb-2.5 px-2.5 border-b-2 transition-all ${
            activeTab === 'twitter'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Twitter className="w-4 h-4" />
          <span>Twitter / X Card</span>
        </button>
      </div>

      {/* Simulator Display Body */}
      <div className="p-5 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60">
        {/* 1. Google Desktop */}
        {activeTab === 'desktop' && (
          <div className="max-w-2xl bg-white dark:bg-[#202124] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-sans text-left">
            {/* Breadcrumb line */}
            <div className="flex items-center gap-2 mb-1 text-xs">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                {domain.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-1 text-[13px] text-[#202124] dark:text-[#dadce0] font-normal leading-tight">
                <span className="font-semibold">{domain}</span>
                {breadcrumbs && (
                  <span className="text-[#5f6368] dark:text-[#9aa0a6] text-xs">
                    › {breadcrumbs}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <h4 className="text-[19px] leading-snug font-normal text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1 tracking-tight">
              {title.length > 65 ? title.slice(0, 62) + '...' : title}
            </h4>

            {/* Snippet */}
            <p className="text-[14px] leading-relaxed text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2">
              {description.length > 160 ? description.slice(0, 155) + '...' : description}
            </p>

            {/* Google Metric Badges */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-3 text-[11px]">
              <span className={`inline-flex items-center gap-1 font-semibold ${isTitleGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isTitleGood ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Title: {titleChars}/60 chars ({titlePixelEst}px)
              </span>
              <span className={`inline-flex items-center gap-1 font-semibold ${isDescGood ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {isDescGood ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Snippet: {descChars}/160 chars
              </span>
            </div>
          </div>
        )}

        {/* 2. Google Mobile */}
        {activeTab === 'mobile' && (
          <div className="max-w-sm mx-auto bg-white dark:bg-[#202124] p-4 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-xl font-sans text-left">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-800 dark:text-white">
                {domain.charAt(0).toUpperCase()}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900 dark:text-slate-100 text-[12px] leading-none">{domain}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5 truncate max-w-[220px]">
                  https://{displayUrl}
                </p>
              </div>
            </div>

            <h4 className="text-[16px] leading-tight font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer mb-1.5">
              {title.length > 60 ? title.slice(0, 58) + '...' : title}
            </h4>

            <p className="text-[13px] leading-snug text-[#4d5156] dark:text-[#bdc1c6] line-clamp-3">
              {description}
            </p>
          </div>
        )}

        {/* 3. Facebook OpenGraph Card */}
        {activeTab === 'facebook' && (
          <div className="max-w-lg mx-auto bg-white dark:bg-[#242526] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md font-sans text-left">
            <div className="h-44 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 flex items-center justify-center text-white text-center p-6 relative">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-widest font-extrabold bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-md">
                  {domain}
                </span>
                <p className="text-sm font-extrabold line-clamp-2 drop-shadow-md pt-2">
                  {title}
                </p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-[#242526] border-t border-slate-100 dark:border-slate-800">
              <p className="text-[11px] uppercase font-semibold text-slate-500 dark:text-slate-400 tracking-wider">
                {domain}
              </p>
              <h5 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 mt-0.5">
                {title}
              </h5>
              <p className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-0.5">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* 4. Twitter / X Large Summary Card */}
        {activeTab === 'twitter' && (
          <div className="max-w-lg mx-auto bg-white dark:bg-black rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md font-sans text-left">
            <div className="h-44 bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center text-white text-center p-6 relative">
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-1">
                  <Twitter className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm font-extrabold line-clamp-2 drop-shadow-md">
                  {title}
                </p>
              </div>
            </div>
            <div className="p-3 bg-white dark:bg-black">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {domain}
              </p>
              <h5 className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug line-clamp-1 mt-0.5">
                {title}
              </h5>
              <p className="text-[12px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                {description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
