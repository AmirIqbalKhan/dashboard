"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/users', label: 'Users' },
  { href: '/dashboard/roles', label: 'Roles' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
          <>
            <span>{session.user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
            >
              Sign Out
            </button>
          </>
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