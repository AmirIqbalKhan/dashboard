"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useRef, useState, useEffect } from 'react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/roles', label: 'Roles' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center gap-6 shadow">
      <span className="font-bold text-lg mr-8">Admin Dashboard</span>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`hover:underline px-2 py-1 rounded transition-colors ${pathname === link.href ? 'bg-gray-700' : ''}`}
        >
          {link.label}
        </Link>
      ))}
      <div className="ml-auto flex items-center gap-4">
        {status === "loading" ? null : session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="flex items-center gap-2 px-3 py-1 rounded hover:bg-gray-800 focus:outline-none"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold text-lg">
                {session.user.name ? session.user.name.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="font-medium">{session.user.name || 'No Name'}</span>
              <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-lg z-50 border border-gray-200">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold">{session.user.name || 'No Name'}</div>
                  <div className="text-xs text-gray-600">{session.user.email}</div>
                  {session.user.role && (
                    <div className="text-xs text-gray-500 mt-1">Role: {session.user.role}</div>
                  )}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/auth/signin"
            className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}; 