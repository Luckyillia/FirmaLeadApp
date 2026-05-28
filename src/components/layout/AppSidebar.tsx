import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '@/assets/svg/logo.svg';
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  BarChart3, 
  AlertCircle, 
  Settings, 
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  Bell,
  PhoneCall,
  MessageSquare,
  Calendar,
  PieChart,
  TrendingUp,
  UserCheck,
  FileText,
  Package,
  ShoppingCart,
  History
} from 'lucide-react';

export function AppSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ MENU zależne od roli - DASHBOARD przekierowuje do /dashboard (nowy dashboard)
  const getMenuItems = () => {
    const role = user.role;
    
    if (role === 'admin') {
      return [
        { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { title: "Użytkownicy", path: "/users", icon: Users },
        { title: "Leady", path: "/leads", icon: Target },
        { title: "Raporty", path: "/reports", icon: BarChart3 },
        { title: "Reklamacje", path: "/complaints", icon: AlertCircle },
      ];
    }
    
    if (role === 'agent_cc') {
      return [
        { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { title: "Kolejka leadów", path: "/leads", icon: PhoneCall },
        { title: "Moje rozmowy", path: "/my-calls", icon: MessageSquare },
        { title: "Kalendarz", path: "/calendar", icon: Calendar },
        { title: "Raporty", path: "/reports", icon: PieChart },
      ];
    }
    
    if (role === 'sales_direct') {
      return [
        { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { title: "Moi klienci", path: "/my-clients", icon: UserCheck },
        { title: "Leady", path: "/leads", icon: Target },
        { title: "Oferty", path: "/offers", icon: FileText },
        { title: "Spotkania", path: "/meetings", icon: Calendar },
      ];
    }
    
    if (role === 'buyer') {
      return [
        { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { title: "Dostępne leady", path: "/leads", icon: Package },
        { title: "Moje leady", path: "/my-leads", icon: ShoppingCart },
        { title: "Reklamacje", path: "/complaints", icon: AlertCircle },
        { title: "Historia", path: "/history", icon: History },
      ];
    }
    
    return [];
  };

  const menuItems = getMenuItems();

  const roleColors = {
    admin: 'bg-purple-600',
    agent_cc: 'bg-blue-600',
    sales_direct: 'bg-green-600',
    buyer: 'bg-orange-600',
  };

  const roleColor = roleColors[user.role as keyof typeof roleColors] || 'bg-gray-600';

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800 p-4">
          <div className={"rounded-lg flex items-center justify-center"}>
            <img src={logo} alt="Logo" className="w-full h-full" />
          </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="flex-1 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = isActive(item.path);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <button
                        onClick={() => handleNavigation(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer
                          ${active 
                            ? 'bg-purple-100 text-purple-700 font-medium' 
                            : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'
                          }
                        `}
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.title}</span>
                      </button>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className={`${roleColor} text-white text-sm`}>
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1">
                <span className="text-sm font-medium">{user.fullName}</span>
                <span className="text-xs text-muted-foreground capitalize">
                  {user.role === 'admin' ? 'Admin' : 
                   user.role === 'agent_cc' ? 'Call Center' :
                   user.role === 'sales_direct' ? 'Handlowiec' : 'Kupujący'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleNavigation('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Profil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleNavigation('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Ustawienia
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Wyloguj
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}