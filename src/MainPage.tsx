import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import LoginPage from '@/LoginPage';
import RegisterPage from '@/RegisterPage';
import DashboardPage from '@/DashbordPage';
import HeroSection from '@/components/HeroSection';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AuthGate() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* <Route path="/" element={<HeroSection />} /> */}
      <Route path="/login"    element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/*" element={user ? <DashboardPage /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function MainPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}