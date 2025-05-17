'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  BarChart2, 
  Newspaper, 
  Settings,
  Calendar,
  FileText,
  UserPlus,
  ShoppingBag,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAdmin = session?.user?.role === 'admin';
  const isManager = session?.user?.role === 'manager';

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'user'] },
    { name: 'Users', href: '/dashboard/users', icon: Users, roles: ['admin', 'manager'] },
    { name: 'Roles', href: '/dashboard/roles', icon: UserCog, roles: ['admin'] },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2, roles: ['admin', 'manager'] },
    { name: 'News', href: '/dashboard/news', icon: Newspaper, roles: ['admin', 'manager', 'user'] },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['admin', 'manager', 'user'] },
    { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar, roles: ['admin', 'manager'] },
    { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText, roles: ['admin'] },
    { name: 'Products', href: '/dashboard/products', icon: ShoppingBag, roles: ['admin', 'manager'] },
    { name: 'Onboarding', href: '/dashboard/onboarding', icon: UserPlus, roles: ['admin', 'manager'] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(session?.user?.role as string)
  );

  return (
    <div 
      className={`fixed top-0 left-0 min-h-screen flex flex-col bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
        <h1 className={`font-bold text-xl transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
          Dashboard
        </h1>
        <button
          onClick={onToggle}
          className="p-1 rounded-md hover:bg-white/10 transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
      <nav className="flex-1 mt-4 px-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                isActive 
                  ? 'bg-white text-purple-600' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className={`transition-all duration-300 ${isCollapsed ? 'hidden' : 'block'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 