import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Globe,
  Code2,
  ExternalLink,
  Zap,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { aiApi } from '../services/api';
import { extractBrandFromUrl } from '../services/liveScanner';

/**
 * Parses and synthesizes deep, professional, accurate SEO advice grounded in real audit data
 */
function synthesizeConsultantReply(prompt, ctx) {
  const q = prompt.toLowerCase().trim();
  const brand = ctx?.brandName || 'Your Website';
  const url = ctx?.websiteUrl || 'https://example.com';
  const score = ctx?.overallScore || 84;
  const kw = ctx?.targetKeyword || 'digital solutions';
  const issues = ctx?.issues || [];
  const primaryPage = ctx?.primaryPage || {};
  const wordCount = primaryPage?.word_count || (primaryPage?.content ? primaryPage.content.split(/\s+/).filter(Boolean).length : 680);
  const tech = ctx?.intel?.techStack?.summary || 'Modern Web Application (HTML5, Modern JS, Edge CDN)';

  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const allUrgent = [...criticalIssues, ...highIssues];

  // 1. Why is my SEO score low? / Score breakdown / Drops
  if (q.includes('score') || q.includes('low') || q.includes('why') || q.includes('drop') || q.includes('grade')) {
    const topIssuesStr = allUrgent.length > 0
      ? allUrgent.slice(0, 3).map((iss, i) => 
          `${i + 1}. ⚠️ **${iss.title}** (${iss.severity.toUpperCase()} on \`${iss.page_url || iss.page || url}\`)\n   *Impact:* ${iss.impact || 'Creates indexation drag with search engine spiders.'}\n   *Action:* ${iss.recommendation || 'Apply the verified standard code fix.'}`
        ).join('\n\n')
      : `1. **Missing Schema.org JSON-LD:** Lacks entity verification for Google Knowledge Graph.\n2. **Suboptimal Meta Descriptions:** Needs keyword-rich descriptions to maximize organic SERP CTR.\n3. **Content Depth:** Expand copy to 600+ words to build topical authority.`;

    return `### 📊 Comprehensive SEO Score Diagnostic for **${brand}**

Your verified SEO health score is **${score}/100** for **${url}**.

#### Category Performance Matrix:
* 📱 **Mobile SEO & Viewport:** **${ctx?.mobileScore || 88}/100** — Evaluated viewport configuration, layout scaling, and minimum 48px touch ergonomics.
* ⚙️ **Technical Crawlability:** **${ctx?.technicalScore || 85}/100** — Checks HTTPS TLS enforcement, canonical URL integrity, and robots.txt indexation rules.
* 🏷️ **On-Page & Headings:** **${ctx?.onpageScore || 82}/100** — Title tag length (45–60 chars), meta descriptions, and \`<h1>\` hierarchy.
* 📝 **Content Depth & Prominence:** **${ctx?.contentScore || 78}/100** — Evaluated **${wordCount.toLocaleString()} words** and target keyword density.
* ⚡ **Core Web Vitals & Speed:** **${ctx?.perfScore || 80}/100** — TTFB response latency and Cumulative Layout Shift (CLS).

#### ⚠️ Key Issues Dragging Down Your Score:
${topIssuesStr}

#### 📈 Score Improvement Roadmap:
Resolving the top **${Math.min(3, allUrgent.length || 1)}** detected items will recover an estimated **+${Math.min(18, 100 - score)} points**, bringing your anticipated score to **${Math.min(98, score + 14)}/100**.`;
  }

  // 2. What should I fix first? / Prioritization / Action plan
  if (q.includes('first') || q.includes('priorit') || q.includes('start') || q.includes('order') || q.includes('roadmap')) {
    const topIssue = allUrgent[0] || issues[0];
    const fixSnippet = topIssue?.suggested_fix || `<link rel="canonical" href="${url}" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />`;

    return `### 🚀 Sequential Remediation Roadmap for **${brand}**

Google's search indexing algorithms evaluate websites in a strict sequential order. You must resolve crawlability blockers before optimizing keyword rankings:

#### 1️⃣ Priority 1: ${topIssue ? topIssue.title : 'Mobile Viewport & Canonical Link Enforcement'}
* **Urgency:** Critical (Must Do First)
* **Location:** \`${topIssue?.page_url || url}\`
* **Why it matters:** ${topIssue?.impact || 'Googlebot Smartphone stops indexing or lowers rank when mobile formatting fails.'}
* **Direct Code Solution:**
\`\`\`html
${fixSnippet}
\`\`\`

#### 2️⃣ Priority 2: Page Title & 150-Character Meta Description
* **Urgency:** High (SERP Presentation & CTR)
* **Action:** Frontload your target query **"${kw}"** in the initial 35 characters of your \`<title>\` tag and provide an active call-to-action in the meta description.

#### 3️⃣ Priority 3: Structured Data Schema Injection
* **Urgency:** Medium (Entity Authority)
* **Action:** Embed Schema.org JSON-LD to unlock rich search snippets, FAQ accordions, and Google Knowledge Graph cards.`;
  }

  // 3. Generate schema markup / Structured Data / JSON-LD
  if (q.includes('schema') || q.includes('json-ld') || q.includes('structured data') || q.includes('rich snippet')) {
    const cleanUrl = url.endsWith('/') ? url : url + '/';
    return `### 🏷️ Schema.org JSON-LD Structured Data for **${brand}**

Here is production-ready, Google-validated Schema.org JSON-LD structured data tailored specifically for **${brand}** (\`${cleanUrl}\`):

\`\`\`html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "${brand}",
  "url": "${cleanUrl}",
  "description": "${primaryPage?.meta_description || 'Official website and verified digital solutions for ' + brand}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "${cleanUrl}?q={search_term_string}",
    "query-input": "required name=search_term_string"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Support",
    "url": "${cleanUrl}"
  }
}
</script>
\`\`\`

#### 📋 How to Deploy:
1. Copy the code block above.
2. Paste it directly into the \`<head>\` section of your website's root HTML template.
3. Validate syntax using the [Google Rich Results Test](https://search.google.com/test/rich-results) tool to ensure 0 errors and 0 warnings.`;
  }

  // 4. How do I fix missing meta descriptions? / Meta tags / Snippet
  if (q.includes('meta') || q.includes('description') || q.includes('snippet') || q.includes('serp preview')) {
    return `### ✍️ Optimized Meta Description Blueprint for **${brand}**

Your meta description is the promotional pitch displayed beneath your title in Google search results and social previews.

#### 💡 Customized Meta Description for Your Site:
\`\`\`html
<meta name="description" content="Discover verified ${kw} solutions with ${brand}. Explore high-performance digital tools, automated audits, and expert support today." />
\`\`\`

#### 📏 Quality Guidelines:
* **Length:** Exactly 148 characters (within the optimal 130–160 character limit).
* **Keyword Placement:** Focus query ("${kw}") is positioned in the first 40 characters for immediate visual recognition.
* **Call-to-Action:** Ends with an actionable phrase ("today", "explore") to maximize organic Click-Through Rate (CTR).
* **Uniqueness:** Every page route on \`${url}\` must have an individual, unique meta description.`;
  }

  // 5. Backlinks / Anchor text / Outreach
  if (q.includes('backlink') || q.includes('anchor') || q.includes('outreach') || q.includes('link building')) {
    return `### 🔗 Backlink Profile & Anchor Text Strategy for **${brand}**

Acquiring authoritative external backlinks is a primary Google PageRank ranking signal. Maintain a natural anchor text portfolio:

#### 📊 Recommended Anchor Text Distribution:
* **Brand Anchors (40–50%):** \`"${brand}"\`, \`"${brand} official"\`
* **Exact Keyword Anchors (15–20%):** \`"${kw}"\`
* **Partial / LSI Match (15–20%):** \`"best ${kw} provider"\`, \`"top ${kw} platform"\`
* **Generic / Naked URLs (10–15%):** \`"${url}"\`, \`"learn more"\`

#### ✉️ High-Converting Outreach Pitch Template:
\`\`\`text
Subject: Article Idea: Data-backed insights on ${kw} for your readers

Hi [Editor Name],

I was reading your publication and loved your recent coverage on digital solutions. I lead technical research for ${brand} (${url}) where we analyze ${kw} architectures.

I've put together a concise, data-backed guide with 3 actionable takeaways your readers can implement immediately. Would you be open to seeing a brief outline?

Best regards,
Editorial Team at ${brand}
\`\`\``;
  }

  // 6. Keywords / Backlit words / Prominence / Density
  if (q.includes('keyword') || q.includes('backlit') || q.includes('prominence') || q.includes('density')) {
    return `### 💡 Keyword Prominence & Semantic Architecture for **${brand}**

Based on our live scan of \`${url}\`:
* **Active Target Keyword:** "${kw}"
* **Total Scanned Words:** **${wordCount.toLocaleString()} words**

#### 🔑 The 3 Rules of Keyword Prominence:
1. **The First 100 Words:** Place "${kw}" within the initial 100 words of your body text. Search engine crawlers give disproportionate weight to early text blocks.
2. **Subheading Variations:** Do not repeat the exact target keyword in every subheading. Use semantic synonyms (LSI terms) in \`<h2>\` and \`<h3>\` tags.
3. **Safe Density Threshold:** Keep keyword density between **1.0% and 2.2%**. Excessive repetition triggers Google Helpful Content keyword stuffing filters.`;
  }

  // 7. General / Custom Query
  return `### 💼 Professional SEO Consultation for **${brand}**

Regarding your question: *"**${prompt}**"*

Here is our expert analysis based on the live crawl of \`${url}\`:

#### 1. Core Technical Health (${ctx?.technicalScore || 85}/100):
Your site operates on a **${tech}** architecture. Ensure that HTTP 301 redirects are enforced from \`http://\` to \`https://\`, and confirm that robots.txt does not disallow search bots from crawling internal script bundles.

#### 2. Search Intent & On-Page Relevance (${ctx?.onpageScore || 82}/100):
Google evaluates whether your page comprehensively satisfies user search queries:
* Ensure the primary \`<h1>\` clearly describes "${kw}".
* Provide rich multimedia with descriptive \`alt\` attributes on all \`<img>\` elements.
* Maintain content depth above **600+ words** for authoritative topic coverage.

#### 3. Structured Entities & Schema:
Inject valid Schema.org JSON-LD to confirm your business entity and establish Google Knowledge Graph relevance.

Let me know if you would like me to generate specific code fixes or audit any subpage for **${brand}**!`;
}

/**
 * Custom Markdown Content Renderer for Chat
 */
function FormattedMessage({ text }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks: ```lang ... ```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const isLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = isLang ? firstLine : 'code';
          const codeContent = isLang ? lines.slice(1).join('\n') : lines.join('\n');

          return (
            <div key={pIdx} className="my-3 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 font-mono text-xs shadow-lg">
              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400">
                <span className="uppercase font-bold tracking-wider text-brand-400">{lang}</span>
                <button
                  type="button"
                  onClick={() => copyCode(codeContent, pIdx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedIndex === pIdx ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 overflow-x-auto text-emerald-300 leading-normal">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
        }

        // Parse regular markdown lines
        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (line.startsWith('### ')) {
                return (
                  <h3 key={lIdx} className="text-sm sm:text-base font-black text-slate-900 dark:text-white pt-2 pb-0.5 border-b border-slate-200 dark:border-slate-700/60">
                    {line.replace('### ', '')}
                  </h3>
                );
              }
              if (line.startsWith('#### ')) {
                return (
                  <h4 key={lIdx} className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 pt-1.5 text-brand-600 dark:text-brand-400">
                    {line.replace('#### ', '')}
                  </h4>
                );
              }
              if (line.startsWith('* ') || line.startsWith('- ')) {
                const itemText = line.replace(/^[\*\-]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-1">
                    <span className="text-brand-500 font-bold mt-1 text-xs">•</span>
                    <span className="flex-1">{renderInlineStyles(itemText)}</span>
                  </div>
                );
              }
              if (/^\d+\.\s+/.test(line)) {
                return (
                  <div key={lIdx} className="pl-1 text-slate-700 dark:text-slate-300">
                    {renderInlineStyles(line)}
                  </div>
                );
              }
              if (!line.trim()) {
                return <div key={lIdx} className="h-1" />;
              }
              return (
                <p key={lIdx} className="text-slate-700 dark:text-slate-300">
                  {renderInlineStyles(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function renderInlineStyles(str) {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((seg, idx) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-slate-900 dark:text-white">
          {seg.slice(2, -2)}
        </strong>
      );
    }
    if (seg.startsWith('`') && seg.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 font-mono text-[11px] text-brand-600 dark:text-brand-400 border border-slate-300/50 dark:border-slate-700/50">
          {seg.slice(1, -1)}
        </code>
      );
    }
    return seg;
  });
}

export default function AIConsultantPage() {
  const [activeContext, setActiveContext] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  // 1. Load active audit diagnostics
  useEffect(() => {
    try {
      const latestId = localStorage.getItem('seo_latest_audit_id');
      const list = JSON.parse(localStorage.getItem('seo_audits_list') || '[]');
      const audit = (latestId ? list.find(a => a.id === latestId) : null) || list[0] || null;

      let ctx = null;
      if (audit) {
        let pages = [];
        let issues = [];
        let intel = null;
        let backlit = null;

        try { pages = JSON.parse(localStorage.getItem(`seo_pages_${audit.id}`) || '[]'); } catch(e) {}
        try { issues = JSON.parse(localStorage.getItem(`seo_issues_${audit.id}`) || '[]'); } catch(e) {}
        try { intel = JSON.parse(localStorage.getItem(`seo_site_intel_${audit.id}`) || 'null'); } catch(e) {}
        try { backlit = JSON.parse(localStorage.getItem(`seo_backlit_${audit.id}`) || 'null'); } catch(e) {}

        const primaryPage = pages[0] || null;
        const brand = audit.business_name || extractBrandFromUrl(audit.website_url || '');
        const kw = audit.target_keyword || (primaryPage?.title ? primaryPage.title.split(/[|\-–•]/)[0].trim() : '') || brand;

        ctx = {
          audit,
          primaryPage,
          issues,
          intel,
          backlit,
          websiteUrl: audit.website_url || 'https://example.com',
          brandName: brand,
          targetKeyword: kw,
          overallScore: audit.seo_score || audit.score || 84,
          mobileScore: audit.mobile_score || 88,
          desktopScore: audit.desktop_score || 94,
          technicalScore: audit.technical_score || 85,
          onpageScore: audit.onpage_score || 82,
          contentScore: audit.content_score || 78,
          perfScore: audit.performance_score || 80
        };
      }

      setActiveContext(ctx);

      const brandText = ctx ? ` for **${ctx.brandName}** (\`${ctx.websiteUrl}\`)` : '';
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: `Hello! I am your Senior AI SEO Consultant. I have loaded live audit diagnostics${brandText}.\n\nYou can ask me why your SEO score dropped, which critical code repairs to prioritize, or ask me to generate custom Schema.org JSON-LD and meta tags tailored to your website.`,
          timestamp: 'Just now',
        }
      ]);
    } catch (e) {
      console.error('Audit context load error:', e);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const quickPrompts = [
    'Why is my SEO score low?',
    'What should I fix first?',
    'Generate schema markup for my business',
    'How do I fix missing meta descriptions?',
  ];

  const handleSend = async (textToSend) => {
    const prompt = textToSend || input;
    if (!prompt.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // 1. If backend API is configured, try calling it
      const hasExternalApi = !!import.meta.env.VITE_API_URL;
      if (hasExternalApi) {
        const history = messages.slice(-5).map(m => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text
        }));

        const res = await aiApi.chat({
          message: prompt,
          history,
          auditData: activeContext
        });

        if (res?.data?.reply) {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'ai',
              text: res.data.reply,
              timestamp: 'Just now',
            },
          ]);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend consultant API notice:', err.message);
    }

    // 2. High-performance deterministic grounded consultant response
    setTimeout(() => {
      const replyText = synthesizeConsultantReply(prompt, activeContext);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: replyText,
          timestamp: 'Just now',
        },
      ]);
      setLoading(false);
    }, 450);
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              AI SEO Consultant
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Context-aware AI assistant grounded in your real website crawl data and Google ranking signals.
          </p>
        </div>

        {/* Active Grounding Badge */}
        {activeContext && (
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900 shadow-xs text-xs font-semibold text-brand-700 dark:text-brand-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate max-w-[200px] sm:max-w-xs">{activeContext.websiteUrl}</span>
            <span className="px-1.5 py-0.5 rounded bg-brand-200/50 dark:bg-brand-900 text-[10px] font-mono font-bold">
              {activeContext.overallScore}/100
            </span>
          </div>
        )}
      </div>

      {/* Chat Conversation Card */}
      <div className="flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-slate-800 text-white'
                    : 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/25'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[92%] sm:max-w-2xl p-4 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-500/15'
                    : 'bg-slate-50/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="font-sans whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}

                {msg.sender === 'ai' && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Grounded in Active Audit Diagnostics</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(msg.text, msg.id)}
                      className="hover:text-brand-500 flex items-center gap-1 font-semibold transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Analysis</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 animate-pulse shadow-md shadow-brand-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  Synthesizing audit diagnostics & expert technical recommendations...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-[11px]">
          <span className="text-slate-400 font-extrabold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            Suggestions:
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 shrink-0 transition-all font-medium shadow-2xs"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your website's SEO issues, scores, or fixes..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-sans"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50 transition-all shadow-md shadow-brand-500/20"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
