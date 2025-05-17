'use client';

import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Users,
  Shield,
  Calendar,
  Settings,
  FileText,
  Menu,
  X,
  Newspaper,
  LogOut,
  ChevronRight,
  ChevronLeft,
  Package,
  BarChart2,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'News Feed', href: '/dashboard/news', icon: Newspaper },
  { name: 'Users', href: '/dashboard/users', icon: Users },
  { name: 'Roles', href: '/dashboard/roles', icon: Shield },
  { name: 'Products', href: '/dashboard/products', icon: Package },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  { name: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Onboarding', href: '/dashboard/onboarding', icon: UserPlus },
  { name: 'Audit Logs', href: '/dashboard/audit-logs', icon: FileText },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function NewSidebar({ isOpen, onToggle, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className={cn(
      'fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transition-transform duration-200 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    )}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between border-b border-gray-800 px-4">
        <div className="flex items-center gap-2 flex-1">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            className="transition-transform"
            onClick={onToggle}
            aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={onToggle}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="h-[calc(100vh-8rem)] overflow-y-auto">
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer with Sign Out */}
      <div className="h-16 border-t border-gray-800 px-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-white">
            {session?.user?.name || 'User'}
          </p>
          <p className="text-xs text-gray-400 truncate">
            {session?.user?.email}
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => signOut({ callbackUrl: '/auth/signin' })}
          className="ml-2"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
    </div>
  );
} 