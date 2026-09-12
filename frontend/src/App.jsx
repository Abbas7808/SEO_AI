import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import PageLoadingFallback from './components/common/PageLoadingFallback';
import ScrollProgressBar from './components/common/ScrollProgressBar';
import ScrollToTop from './components/common/ScrollToTop';
import { autoPruneStaleCache } from './utils/cacheManager';

// Dynamic Code-Splitting: Lazy load pages to drastically reduce initial bundle size
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const DashboardOverview = lazy(() => import('./pages/DashboardOverview'));
const StartAuditPage = lazy(() => import('./pages/StartAuditPage'));
const IssuesPage = lazy(() => import('./pages/IssuesPage'));
const PageAnalysisPage = lazy(() => import('./pages/PageAnalysisPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const BacklitWordsPage = lazy(() => import('./pages/BacklitWordsPage'));
const AntigravityFixerPage = lazy(() => import('./pages/AntigravityFixerPage'));
const SiteInspectorPage = lazy(() => import('./pages/SiteInspectorPage'));
const CompetitorComparePage = lazy(() => import('./pages/CompetitorComparePage'));
const AIConsultantPage = lazy(() => import('./pages/AIConsultantPage'));
const ContentOptimizerPage = lazy(() => import('./pages/ContentOptimizerPage'));
const AuditHistoryPage = lazy(() => import('./pages/AuditHistoryPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UpgradePage = lazy(() => import('./pages/UpgradePage'));
const AdminBillingPage = lazy(() => import('./pages/AdminBillingPage'));

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

          {/* Public Marketing & Auth Views */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          {/* Dashboard & Workspace Views */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
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
