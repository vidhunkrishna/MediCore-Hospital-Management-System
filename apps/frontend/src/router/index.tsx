import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from './AuthGuard';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { PatientsPage } from '@/pages/patients/PatientsPage';
import { AppointmentsPage } from '@/pages/appointments/AppointmentsPage';
import { ResourcesPage } from '@/pages/resources/ResourcesPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { AICommandPage } from '@/pages/ai-command/AICommandPage';
import { ReportsPage } from '@/pages/reports/ReportsPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    element: <AuthGuard><AppLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/patients', element: <PatientsPage /> },
      { path: '/appointments', element: <AppointmentsPage /> },
      { path: '/resources', element: <ResourcesPage /> },
      { path: '/analytics', element: <AnalyticsPage /> },
      { path: '/ai-command', element: <AICommandPage /> },
      { path: '/reports', element: <ReportsPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
