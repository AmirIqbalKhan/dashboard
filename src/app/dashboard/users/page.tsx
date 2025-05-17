'use client';

import { useSession } from 'next-auth/react';
import { UsersTable } from '@/components/users/UsersTable';
import { CreateUserForm } from '@/components/users/CreateUserForm';
import { hasPermission } from '@/utils/roleAccess';

export default function UsersPage() {
  const { data: session } = useSession();

  const canManageUsers = hasPermission(session, 'canManageUsers');

  if (!canManageUsers) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">User Management</h1>
      <div className="flex flex-col gap-8">
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <CreateUserForm />
        </div>
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">Existing Users</h2>
          <UsersTable />
        </div>
      </div>
    </div>
  );
} 