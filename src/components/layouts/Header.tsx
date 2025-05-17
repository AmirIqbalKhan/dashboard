'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Menu, ChevronRight } from 'lucide-react';

interface HeaderProps {
  isCollapsed: boolean;
  onSidebarOpen?: () => void;
}

export function Header({ isCollapsed, onSidebarOpen }: HeaderProps) {
  const { data: session } = useSession();
  const username = session?.user?.name || 'User';

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
        <div className="flex items-center gap-4 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
} 