import {
  LayoutDashboard,
  Users,
  BarChart3,
  PhoneCall,
  Target,
  ShoppingCart,
  Settings,
  FileText,
  AlertCircle,
  Package,
  UserCheck,
  TrendingUp,
  Calendar,
  MessageSquare,
  History,
  PieChart,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: number;
  items?: SubMenuItem[];
}

export interface SubMenuItem {
  title: string;
  url: string;
}

// Menu dla Administratora
export const adminMenu: MenuItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Użytkownicy", url: "/users", icon: Users },
  { title: "Leadzy", url: "/leads", icon: Target },
  { title: "Raporty", url: "/reports", icon: BarChart3 },
  { title: "Reklamacje", url: "/complaints", icon: AlertCircle, badge: 3 },
  { title: "Ustawienia", url: "/settings", icon: Settings },
];

// Menu dla Call Center
export const callCenterMenu: MenuItem[] = [
  { title: "Kolejka leadów", url: "/dashboard", icon: PhoneCall, badge: 12 },
  { title: "Moje rozmowy", url: "/my-calls", icon: MessageSquare },
  { title: "Leadzy", url: "/leads", icon: Target, badge: 5 },
  { title: "Kalendarz", url: "/calendar", icon: Calendar },
  { title: "Raporty", url: "/reports", icon: PieChart },
];

// Menu dla Handlowca
export const salesMenu: MenuItem[] = [
  { title: "Pipeline", url: "/dashboard", icon: TrendingUp },
  { title: "Moi klienci", url: "/my-clients", icon: UserCheck },
  { title: "Leadzy", url: "/leads", icon: Target, badge: 8 },
  { title: "Spotkania", url: "/meetings", icon: Calendar },
  { title: "Oferty", url: "/offers", icon: FileText },
];

// Menu dla Kupującego
export const buyerMenu: MenuItem[] = [
  { title: "Dostępne leady", url: "/dashboard", icon: Package, badge: 7 },
  { title: "Moje leady", url: "/my-leads", icon: ShoppingCart },
  { title: "Reklamacje", url: "/complaints", icon: AlertCircle },
  { title: "Historia", url: "/history", icon: History },
];

// Mapowanie ról na menu
export const menuByRole = {
  admin: adminMenu,
  agent_cc: callCenterMenu,
  sales_direct: salesMenu,
  buyer: buyerMenu,
};