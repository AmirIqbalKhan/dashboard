'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layouts/Sidebar';
import { Header } from '@/components/layouts/Header';
import { ChevronRight } from 'lucide-react';

interface RoleBasedLayoutProps {
  children: React.ReactNode;
}

export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600">
      <div className="relative">
        <div className={`transition-all duration-300 ease-in-out transform ${
          isCollapsed ? '-translate-x-full' : 'translate-x-0'
        }`}>
          <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        </div>
        <div className={`transition-all duration-300 ease-in-out transform ${
          isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}>
          <Header isCollapsed={isCollapsed} />
        </div>
        {isCollapsed && (
          <button
            onClick={toggleSidebar}
            className="fixed top-20 left-0 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-r-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
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