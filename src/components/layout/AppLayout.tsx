import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '@/context/AuthContext';
import { Outlet } from 'react-router-dom';

export function AppLayout() {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-2">
            <SidebarTrigger className="lg:hidden" />
          </div>
          <div className="p-6">
            <Outlet />  {/* ⬅️ Tutaj wczytują się strony */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}