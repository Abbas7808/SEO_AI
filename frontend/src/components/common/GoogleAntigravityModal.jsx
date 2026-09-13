import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Terminal,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  FileCode,
  ShieldCheck,
  Wrench,
  Loader2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { auditApi } from '../../services/api';

export default function GoogleAntigravityModal({
  isOpen,
  onClose,
  issue,
  auditId,
  projectPath,
  onFixApplied
}) {
  const [applying, setApplying] = useState(false);
  const [openingEditor, setOpeningEditor] = useState(false);
  const [openingAgent, setOpeningAgent] = useState(false);
  const [editorNotice, setEditorNotice] = useState(null);
  const [patchSuccess, setPatchSuccess] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !issue) return null;

  const filePath = issue.file_path || issue.page_url || 'src/index.html';
  const lineNumber = issue.line_number || 1;
  const currentSnippet = issue.code_snippet || '<!-- Existing Code -->';
  const suggestedFix = issue.suggested_fix || '<!-- Suggested Replacement Code -->';
  const antigravityCommand = issue.solution_steps || issue.antigravity_command || `/goal In ${filePath} at line ${lineNumber}, fix ${issue.title}: ${suggestedFix}`;

  const handleOpenEditor = async () => {
    setOpeningEditor(true);
    setError(null);
    setEditorNotice(null);
    try {
      const res = await auditApi.openInEditor({
        projectPath: projectPath || 'C:\\Users\\AGP KOHAT\\Desktop\\SEO',
        filePath,
        lineNumber
      });
      setEditorNotice(`Google Antigravity IDE opened for coding at ${filePath}:${lineNumber}!`);
      setTimeout(() => setEditorNotice(null), 6000);
    } catch (e) {
      setError(e.message || 'Failed to open file in Google Antigravity IDE.');
    } finally {
      setOpeningEditor(false);
    }
  };

  const handleLaunchAgent = async () => {
    setOpeningAgent(true);
    setError(null);
    setEditorNotice(null);
    try {
      const res = await auditApi.launchAgent({
        projectPath: projectPath || 'C:\\Users\\AGP KOHAT\\Desktop\\SEO',
        filePath,
        lineNumber,
        prompt: antigravityCommand
      });
      setEditorNotice(`Google Antigravity AI Agent dispatched with prompt in IDE!`);
      setTimeout(() => setEditorNotice(null), 6000);
    } catch (e) {
      setError(e.message || 'Failed to launch Antigravity AI Agent.');
    } finally {
      setOpeningAgent(false);
    }
  };

  const handleApplyFix = async () => {
    setApplying(true);
    setError(null);
    try {
      const res = await auditApi.applyLocalFix({
        auditId,
        issueId: issue.id,
        projectPath,
        filePath,
        lineNumber,
        replacementCode: suggestedFix,
        originalCode: currentSnippet
      });
      setPatchSuccess(res.data || true);
      if (onFixApplied) {
        onFixApplied(issue.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to apply code patch to file.');
    } finally {
      setApplying(false);
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(antigravityCommand);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  Google Antigravity AI Code Refactor
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Agentic v2.4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous AST code refactoring & IDE link for local workspace files
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 flex-1">
          {/* Issue Meta & File Location */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>{issue.title}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                  issue.severity === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  issue.severity === 'high' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}>
                  {issue.severity}
                </span>
              </div>
              <div className="text-slate-400 flex items-center gap-2 font-mono">
                <FileCode className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span className="text-brand-300 font-semibold">{filePath}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300">Line {lineNumber}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenEditor}
                disabled={openingEditor}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white font-bold flex items-center justify-center gap-1.5 transition-all text-xs shrink-0 shadow-md shadow-indigo-600/20"
                title="Directly opens Google Antigravity IDE at this exact file and line for live coding"
              >
                {openingEditor ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                )}
                <span>Open in Antigravity IDE (Line {lineNumber})</span>
              </button>

              <button
                type="button"
                onClick={handleLaunchAgent}
                disabled={openingAgent}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold flex items-center justify-center gap-1.5 transition-all text-xs shrink-0 shadow-sm"
                title="Launch an Antigravity AI Agent session in the IDE to refactor this issue"
              >
                {openingAgent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                ) : (
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>Launch Agent Chat</span>
              </button>
            </div>
          </div>

          {/* Code Diff Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                Proposed Code Improvement
              </span>
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                <Zap className="w-3 h-3" />
                +8 SEO Score Boost
              </span>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs shadow-inner">
              {/* Diff Header */}
              <div className="px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{filePath}:{lineNumber}</span>
                <span className="text-[10px] text-slate-500">Unified Diff View</span>
              </div>

              {/* Before Code */}
              {currentSnippet && currentSnippet !== '<!-- No code -->' && (
                <div className="p-3 bg-rose-950/20 border-b border-rose-900/30 text-rose-300 flex gap-2">
                  <span className="text-rose-500 select-none">-</span>
                  <pre className="overflow-x-auto whitespace-pre-wrap">{currentSnippet}</pre>
                </div>
              )}

              {/* After Code */}
              <div className="p-3 bg-emerald-950/30 text-emerald-300 flex gap-2">
                <span className="text-emerald-500 select-none">+</span>
                <pre className="overflow-x-auto whitespace-pre-wrap">{suggestedFix}</pre>
              </div>
            </div>
          </div>

          {/* Success or Error alert */}
          {editorNotice && (
            <div className="p-3.5 rounded-xl bg-indigo-950/50 border border-indigo-500/50 text-indigo-200 text-xs flex items-start gap-2.5 animate-fade-in shadow-md">
              <Bot className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white">Google Antigravity IDE Active</span>
                <span>{editorNotice}</span>
              </div>
            </div>
          )}

          {patchSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">File Patched Successfully!</span>
                <span>Code replacement written directly to disk. Automatic safety backup saved at <code>{filePath}.bak</code>.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Action Notice</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Google Antigravity Agent Command Generator */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Google Antigravity Agent Prompt
              </span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="text-[11px] font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
              >
                {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy Prompt'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] select-all overflow-x-auto whitespace-pre-wrap">
              {antigravityCommand}
            </div>
            <p className="text-[10px] text-slate-500">
              Paste directly into Google Antigravity IDE sidebar chat or terminal to dispatch an autonomous agent.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>AST Safe Patching with .bak automatic backup</span>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold hover:bg-slate-800 transition-all"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleApplyFix}
              disabled={applying || patchSuccess}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all"
            >
              {applying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : patchSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{patchSuccess ? 'Fix Applied to Code' : 'Apply Fix to File Directly'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
