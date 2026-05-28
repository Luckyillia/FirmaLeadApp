import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/LoginPage';
import RegisterPage from '@/RegisterPage';
import { AppLayout } from '@/components/layout/AppLayout';
import HeroSection from '@/components/HeroSection';
import { RequireRole } from '@/components/require-role';

// ✅ NOWE dashboardy (z wykresami)
import DashboardAdmin from '@/pages/DashboardAdmin';
import DashboardCallCenter from '@/pages/DashboardCallCenter';
import DashboardSales from '@/pages/DashboardSales';
import PortalBuyer from '@/pages/PortalBuyer';

// Pozostałe strony
import UsersPage from '@/pages/UsersPage';
import LeadsPage from '@/pages/LeadsPage';
import ReportsPage from '@/pages/ReportsPage';
import ComplaintsPage from '@/pages/ComplaintsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import MyCallsPage from '@/pages/MyCallsPage';
import MyClientsPage from '@/pages/MyClientsPage';
import MyLeadsPage from '@/pages/MyLeadsPage';
import MeetingsPage from '@/pages/MeetingsPage';
import OffersPage from '@/pages/OffersPage';
import HistoryPage from '@/pages/HistoryPage';
import CalendarPage from '@/pages/CalendarPage';
import ContactForm from './components/contact-form';

// ✅ Funkcja wybierająca odpowiedni dashboard (NOWY)
function RoleBasedDashboard() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'admin':
      return <DashboardAdmin />;
    case 'agent_cc':
      return <DashboardCallCenter />;
    case 'sales_direct':
      return <DashboardSales />;
    case 'buyer':
      return <PortalBuyer />;
    default:
      return <DashboardAdmin />;
  }
}

function AuthGate() {
  const { user } = useAuth();


  return (
    <Routes>
      {/* Publiczne */}
      <Route path="/" element={!user ? <HeroSection /> : <Navigate to="/dashboard" />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
      <Route path="/contact" element={!user ? <ContactForm /> : <Navigate to="/contact" />} />

      {/* Chronione */}
      <Route element={user ? <AppLayout /> : <Navigate to="/login" />}>
        {/* ✅ DASHBOARD - nowy, zależny od roli */}
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        
        {/* Admin */}
        <Route
          path="/users"
          element={
            <RequireRole roles={['admin']}>
              <UsersPage />
            </RequireRole>
          }
        />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/complaints" element={<ComplaintsPage />} />
        
        {/* Call Center */}
        <Route path="/my-calls" element={<MyCallsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        
        {/* Sales */}
        <Route path="/my-clients" element={<MyClientsPage />} />
        <Route path="/meetings" element={<MeetingsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        
        {/* Buyer */}
        <Route path="/my-leads" element={<MyLeadsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        
        {/* Ogólne */}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default function MainPage() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}