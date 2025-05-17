'use client';

import { useSession } from 'next-auth/react';
import { Bell, Plus } from 'lucide-react';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationDrawer } from '@/components/notifications/NotificationDrawer';
import { useState } from 'react';

interface HeaderProps {
  isCollapsed: boolean;
}

export function Header({ isCollapsed }: HeaderProps) {
  const { data: session } = useSession();
  const [notificationKey, setNotificationKey] = useState(0);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const isAdmin = session?.user?.role === 'admin';

  const handleNotificationCreated = () => {
    setNotificationKey((prev) => prev + 1);
  };

  return (
    <div 
      className={`fixed top-0 right-0 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg z-50 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="h-full px-4 flex items-center justify-end space-x-4">
        {isAdmin && (
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm font-medium">New Notification</span>
          </button>
        )}
        <div className="relative">
          <NotificationList key={notificationKey} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">
            {session?.user?.name}
          </span>
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center text-white font-medium">
            {session?.user?.name?.charAt(0)}
          </div>
        </div>
        <NotificationDrawer 
          isOpen={isNotificationDrawerOpen}
          onClose={() => setIsNotificationDrawerOpen(false)}
          onNotificationCreated={handleNotificationCreated}
        />
      </div>
    </div>
  );
} 