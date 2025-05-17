'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight, Bell } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

interface HeaderProps {
  isCollapsed: boolean;
  onSidebarOpen?: () => void;
}

export function Header({ isCollapsed, onSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const username = session?.user?.name || 'User';
  const [showNotifications, setShowNotifications] = useState(false);

  // Notification dropdown portal
  const notificationDropdown = showNotifications && typeof window !== 'undefined'
    ? createPortal(
        <div className="fixed right-8 top-20 w-64 bg-white text-gray-900 rounded shadow-2xl z-[9999] border border-gray-200 p-4">
          <div className="font-semibold mb-2">Notifications</div>
          <div className="text-sm text-gray-600">No new notifications.</div>
        </div>,
        document.body
      )
    : null;

  return (
    <header className="fixed top-0 right-0 left-0 z-30 bg-white/10 backdrop-blur-lg border-b border-white/10">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 min-w-0">
          {isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={onSidebarOpen}
              aria-label="Open sidebar"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-semibold text-white truncate">
            {`Hello, ${username}!`}
          </h1>
        </div>
        <div className="flex items-center gap-4 min-w-0 relative">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Show notifications"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {notificationDropdown}
    </header>
  );
} 