'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import NewSidebar from '@/components/NewSidebar';
import { Header } from '@/components/layouts/Header';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'News Feed', href: '/dashboard/news' },
  { name: 'Users', href: '/dashboard/users' },
  { name: 'Roles', href: '/dashboard/roles' },
  { name: 'Products', href: '/dashboard/products' },
  { name: 'Analytics', href: '/dashboard/analytics' },
  { name: 'Calendar', href: '/dashboard/calendar' },
  { name: 'Onboarding', href: '/dashboard/onboarding' },
  { name: 'Audit Logs', href: '/dashboard/audit-logs' },
  { name: 'Settings', href: '/dashboard/settings' },
];

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    setIsVisible(!isVisible);
  };

  // Improved robust page title matching: sort by href length descending
  const normalize = (str: string) => str.replace(/\/+$/, '').toLowerCase();
  const sortedNav = [...navigation].sort((a, b) => b.href.length - a.href.length);
  const normalizedPath = normalize(pathname || '');
  const currentNav = sortedNav.find((item) =>
    normalizedPath.startsWith(normalize(item.href))
  );
  const pageTitle = currentNav?.name || 'Dashboard';

  // Debug output
  console.log('DEBUG pathname:', pathname);
  console.log('DEBUG normalizedPath:', normalizedPath);
  console.log('DEBUG sortedNav:', sortedNav.map(item => ({...item, href: normalize(item.href)})));
  console.log('DEBUG matchedNav:', currentNav);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Set header left padding to match sidebar width
  const headerPadding = isCollapsed ? 'pl-20' : 'pl-64';

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="relative">
        <div className={`bg-white/10 backdrop-blur-lg border-b border-white/10 ${headerPadding}`}>
          <Header isCollapsed={isCollapsed} onSidebarOpen={() => setIsCollapsed(false)} />
        </div>
        <NewSidebar 
          isOpen={!isCollapsed} 
          onToggle={toggleSidebar} 
          onClose={() => setIsCollapsed(true)} 
        />
        <main 
          className={`transition-all duration-300 ease-in-out ${
            isCollapsed ? 'pl-20' : 'pl-64'
          } pt-16 min-h-screen`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-lg shadow-xl p-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 