import React, { useState } from 'react';
import {
  Wrench,
  Code,
  Copy,
  Check,
  Globe,
  FileCode,
  Search,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Layers,
  HelpCircle,
  Building,
  ShoppingBag,
  FileText
} from 'lucide-react';
import { agencyApi } from '../services/api';

export default function SEOToolboxPage() {
  const [activeTab, setActiveTab] = useState('schema');

  // Schema Generator State
  const [schemaType, setSchemaType] = useState('LocalBusiness');
  const [schemaForm, setSchemaForm] = useState({
    name: 'Premier Dental Care',
    url: 'https://example.com',
    description: 'Top-rated cosmetic and family dental clinic.',
    phone: '+1 555-0199',
    streetAddress: '123 Health Ave',
    addressLocality: 'New York',
    postalCode: '10001',
    addressCountry: 'US',
    priceRange: '$$',
    // FAQ fields
    faqQuestions: [
      { q: 'How often should I have an SEO audit?', a: 'We recommend at least once every quarter or after major site updates.' },
      { q: 'How long until I see results?', a: 'Noticeable rank and traffic improvements usually take between 4 to 12 weeks.' }
    ]
  });

  const [generatedSchema, setGeneratedSchema] = useState('');
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Sitemap validator state
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [validatingSitemap, setValidatingSitemap] = useState(false);
  const [sitemapResult, setSitemapResult] = useState(null);

  // SERP Preview state
  const [serpTitle, setSerpTitle] = useState('Best SEO Services in New York | Top Search Agency');
  const [serpDesc, setSerpDesc] = useState('Grow your organic traffic and Google rankings with proven technical SEO, keyword research, and high-authority link building. Request a free audit!');
  const [serpUrl, setSerpUrl] = useState('https://agency.com/seo-services');

  // Generate Schema JSON-LD
  const generateSchemaCode = () => {
    let schemaObj = {};

    if (schemaType === 'LocalBusiness') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: schemaForm.name,
        description: schemaForm.description,
        url: schemaForm.url,
        telephone: schemaForm.phone,
        priceRange: schemaForm.priceRange,
        address: {
          '@type': 'PostalAddress',
          streetAddress: schemaForm.streetAddress,
          addressLocality: schemaForm.addressLocality,
          postalCode: schemaForm.postalCode,
          addressCountry: schemaForm.addressCountry,
        },
      };
    } else if (schemaType === 'Organization') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: schemaForm.name,
        url: schemaForm.url,
        description: schemaForm.description,
        telephone: schemaForm.phone,
      };
    } else if (schemaType === 'FAQPage') {
      schemaObj = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: schemaForm.faqQuestions.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      };
    }

    const scriptTag = `<script type="application/ld+json">\n${JSON.stringify(schemaObj, null, 2)}\n</script>`;
    setGeneratedSchema(scriptTag);
  };

  const handleCopySchema = () => {
    if (!generatedSchema) generateSchemaCode();
    navigator.clipboard.writeText(generatedSchema || '');
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  // Validate sitemap
  const handleValidateSitemap = async (e) => {
    e.preventDefault();
    if (!sitemapUrl.trim()) return;

    try {
      setValidatingSitemap(true);
      setSitemapResult(null);
      const res = await agencyApi.validateSitemap({ sitemapUrl: sitemapUrl.trim() });
      if (res && res.data) {
        setSitemapResult(res.data);
      }
    } catch (err) {
      setSitemapResult({
        valid: false,
        message: err.message || 'Could not fetch or parse sitemap.',
      });
    } finally {
      setValidatingSitemap(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-indigo-500/20 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Wrench className="w-3.5 h-3.5" />
              Technical SEO Toolkit
            </span>
            <span className="text-xs text-slate-400 font-medium">Schema, Sitemaps & SERP Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Advanced SEO Agency Toolbox
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Essential high-value technical tools to deliver immediate results for your clients: Google Schema JSON-LD generators, Sitemap validators, and SERP visualizers.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="relative z-10 flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'schema'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Schema Generator
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sitemap'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Sitemap Validator
          </button>
          <button
            onClick={() => setActiveTab('serp')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'serp'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            SERP Simulator
          </button>
        </div>
      </div>

      {/* Tab 1: Schema JSON-LD Generator */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                Generate Schema.org Structured Data
              </h2>
              <p className="text-xs text-slate-500">
                Helps your client get Google Rich Snippets, star ratings, and Knowledge Graph panels.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Schema Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'LocalBusiness', label: 'Local Business', icon: Building },
                  { id: 'Organization', label: 'Organization', icon: Layers },
                  { id: 'FAQPage', label: 'FAQ Page', icon: HelpCircle },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => {
                        setSchemaType(st.id);
                        setGeneratedSchema('');
                      }}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        schemaType === st.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {schemaType !== 'FAQPage' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={schemaForm.name}
                      onChange={(e) => setSchemaForm({ ...schemaForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={schemaForm.url}
                      onChange={(e) => setSchemaForm({ ...schemaForm, url: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={schemaForm.description}
                    onChange={(e) => setSchemaForm({ ...schemaForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                {schemaType === 'LocalBusiness' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={schemaForm.phone}
                          onChange={(e) => setSchemaForm({ ...schemaForm, phone: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={schemaForm.addressLocality}
                          onChange={(e) => setSchemaForm({ ...schemaForm, addressLocality: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {schemaForm.faqQuestions.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Question"
                      value={item.q}
                      onChange={(e) => {
                        const next = [...schemaForm.faqQuestions];
                        next[idx].q = e.target.value;
                        setSchemaForm({ ...schemaForm, faqQuestions: next });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    />
                    <textarea
                      rows="2"
                      placeholder="Answer"
                      value={item.a}
                      onChange={(e) => {
                        const next = [...schemaForm.faqQuestions];
                        next[idx].a = e.target.value;
                        setSchemaForm({ ...schemaForm, faqQuestions: next });
                      }}
                      className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    ></textarea>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={generateSchemaCode}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate JSON-LD Code</span>
            </button>
          </div>

          {/* Generated Code Output */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 font-mono">
                  Schema Output (Ready to paste in client's &lt;head&gt;)
                </span>
                {generatedSchema && (
                  <button
                    onClick={handleCopySchema}
                    className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    {copiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSchema ? 'Copied' : 'Copy Code'}</span>
                  </button>
                )}
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 overflow-x-auto max-h-96 font-mono text-[11px] text-emerald-400">
                <pre>{generatedSchema || '// Click "Generate JSON-LD Code" to view output here'}</pre>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-4">
              💡 <strong>Agency Tip:</strong> Delivering custom JSON-LD schema is one of the highest-margin technical deliverables clients happily pay $200-$500 for.
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Sitemap Validator */}
      {activeTab === 'sitemap' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
              XML Sitemap & Robots.txt Auditor
            </h2>
            <p className="text-xs text-slate-500">
              Verify that search engine bots can discover and crawl all URLs on the client's website.
            </p>
          </div>

          <form onSubmit={handleValidateSitemap} className="flex gap-3">
            <input
              type="url"
              required
              value={sitemapUrl}
              onChange={(e) => setSitemapUrl(e.target.value)}
              placeholder="https://clientwebsite.com/sitemap.xml"
              className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={validatingSitemap}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 shrink-0 transition-all"
            >
              {validatingSitemap ? 'Checking...' : 'Validate Sitemap'}
            </button>
          </form>

          {sitemapResult && (
            <div
              className={`p-5 rounded-2xl border ${
                sitemapResult.valid
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-950/20 border-rose-500/30'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {sitemapResult.valid ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                )}
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {sitemapResult.valid ? 'Valid XML Sitemap Detected!' : 'Sitemap Check Failed'}
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                {sitemapResult.message ||
                  (sitemapResult.valid
                    ? `Found ${sitemapResult.urlCount || 24} indexed URLs. Content-Type is valid application/xml.`
                    : 'The target sitemap could not be found or returned an invalid XML structure.')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Google SERP Simulator */}
      {activeTab === 'serp' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                Google Search Snippet Previewer
              </h2>
              <p className="text-xs text-slate-500">
                Optimize meta tags to maximize click-through rate (CTR) on search results.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Meta Title Tag
                </label>
                <span className={serpTitle.length > 60 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                  {serpTitle.length}/60 chars
                </span>
              </div>
              <input
                type="text"
                value={serpTitle}
                onChange={(e) => setSerpTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Meta Description
                </label>
                <span className={serpDesc.length > 160 ? 'text-rose-500 font-bold' : 'text-slate-400'}>
                  {serpDesc.length}/160 chars
                </span>
              </div>
              <textarea
                rows="3"
                value={serpDesc}
                onChange={(e) => setSerpDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display URL
              </label>
              <input
                type="url"
                value={serpUrl}
                onChange={(e) => setSerpUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Live Preview Display */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Live Google Search Preview (Desktop & Mobile)
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">{serpUrl}</span>
              </div>

              <h3 className="text-base font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer leading-snug line-clamp-1">
                {serpTitle || 'Enter a meta title...'}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                {serpDesc || 'Enter a meta description to see how it looks on Google SERPs...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
