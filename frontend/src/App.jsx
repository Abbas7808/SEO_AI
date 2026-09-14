import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PageLoadingFallback from './components/common/PageLoadingFallback';
import ScrollProgressBar from './components/common/ScrollProgressBar';
import ScrollToTop from './components/common/ScrollToTop';
import { autoPruneStaleCache } from './utils/cacheManager';

// Safe Dynamic Code-Splitting with auto-recovery for new deployments
function lazyWithRetry(componentImport) {
  return lazy(async () => {
    try {
      const component = await componentImport();
      sessionStorage.removeItem('chunk_retry_attempt');
      return component;
    } catch (error) {
      const msg = error?.message || '';
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('error loading dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        const alreadyRetried = sessionStorage.getItem('chunk_retry_attempt');
        if (!alreadyRetried) {
          sessionStorage.setItem('chunk_retry_attempt', 'true');
          window.location.reload();
          return new Promise(() => {}); // hold promise until reload triggers
        }
      }
      throw error;
    }
  });
}

const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/RegisterPage'));

const DashboardOverview = lazyWithRetry(() => import('./pages/DashboardOverview'));
const StartAuditPage = lazyWithRetry(() => import('./pages/StartAuditPage'));
const IssuesPage = lazyWithRetry(() => import('./pages/IssuesPage'));
const PageAnalysisPage = lazyWithRetry(() => import('./pages/PageAnalysisPage'));
const RoadmapPage = lazyWithRetry(() => import('./pages/RoadmapPage'));
const BacklitWordsPage = lazyWithRetry(() => import('./pages/BacklitWordsPage'));
const AntigravityFixerPage = lazyWithRetry(() => import('./pages/AntigravityFixerPage'));
const SiteInspectorPage = lazyWithRetry(() => import('./pages/SiteInspectorPage'));
const CompetitorComparePage = lazyWithRetry(() => import('./pages/CompetitorComparePage'));
const AIConsultantPage = lazyWithRetry(() => import('./pages/AIConsultantPage'));
const ContentOptimizerPage = lazyWithRetry(() => import('./pages/ContentOptimizerPage'));
const AuditHistoryPage = lazyWithRetry(() => import('./pages/AuditHistoryPage'));
const ReportsPage = lazyWithRetry(() => import('./pages/ReportsPage'));
const UpgradePage = lazyWithRetry(() => import('./pages/UpgradePage'));
const AdminBillingPage = lazyWithRetry(() => import('./pages/AdminBillingPage'));
const ClientsHubPage = lazyWithRetry(() => import('./pages/ClientsHubPage'));
const KeywordTrackerPage = lazyWithRetry(() => import('./pages/KeywordTrackerPage'));
const ProposalsPage = lazyWithRetry(() => import('./pages/ProposalsPage'));
const InvoicesPage = lazyWithRetry(() => import('./pages/InvoicesPage'));
const SEOToolboxPage = lazyWithRetry(() => import('./pages/SEOToolboxPage'));
const TrafficAnalyticsPage = lazyWithRetry(() => import('./pages/TrafficAnalyticsPage'));
const ClientPortalPage = lazyWithRetry(() => import('./pages/ClientPortalPage'));

export default function App() {
  const navigate = useNavigate();

  // Prune old storage garbage on initial mount & register Ctrl+Shift+A shortcut for Admin
  useEffect(() => {
    autoPruneStaleCache();

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        navigate('/dashboard/admin-billing');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      {/* 60fps Hardware-Accelerated Scroll Progress Bar */}
      <ScrollProgressBar />

      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          {/* Quick-Access Admin Short Route */}
          <Route path="/admin" element={<Navigate to="/dashboard/admin-billing" replace />} />

          {/* Public Client White-Label Portal Route (No login required) */}
          <Route path="/portal/:token" element={<ClientPortalPage />} />

          {/* Public Marketing & Auth Views */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard & Workspace Views */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="clients" element={<ClientsHubPage />} />
            <Route path="keywords" element={<KeywordTrackerPage />} />
            <Route path="proposals" element={<ProposalsPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="toolbox" element={<SEOToolboxPage />} />
            <Route path="traffic" element={<TrafficAnalyticsPage />} />
            <Route path="new" element={<StartAuditPage />} />
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="antigravity" element={<AntigravityFixerPage />} />
            <Route path="backlit-words" element={<BacklitWordsPage />} />
            <Route path="issues" element={<IssuesPage />} />
            <Route path="pages" element={<PageAnalysisPage />} />
            <Route path="inspector" element={<SiteInspectorPage />} />
            <Route path="compare" element={<CompetitorComparePage />} />
            <Route path="consultant" element={<AIConsultantPage />} />
            <Route path="optimizer" element={<ContentOptimizerPage />} />
            <Route path="history" element={<AuditHistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="billing" element={<UpgradePage />} />
            <Route path="admin-billing" element={<AdminBillingPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Floating Smooth Scroll to Top */}
      <ScrollToTop />
    </>
  );
}
