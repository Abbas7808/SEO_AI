import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Dashboard Pages
import DashboardOverview from './pages/DashboardOverview';
import StartAuditPage from './pages/StartAuditPage';
import IssuesPage from './pages/IssuesPage';
import PageAnalysisPage from './pages/PageAnalysisPage';
import RoadmapPage from './pages/RoadmapPage';
import BacklitWordsPage from './pages/BacklitWordsPage';
import AntigravityFixerPage from './pages/AntigravityFixerPage';
import SiteInspectorPage from './pages/SiteInspectorPage';
import CompetitorComparePage from './pages/CompetitorComparePage';
import AIConsultantPage from './pages/AIConsultantPage';
import ContentOptimizerPage from './pages/ContentOptimizerPage';
import AuditHistoryPage from './pages/AuditHistoryPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <Routes>
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
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
