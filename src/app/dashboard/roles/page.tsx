'use client';

import { useSession } from 'next-auth/react';
import { RolesManager } from '@/components/roles/RolesManager';
import { hasPermission } from '@/utils/roleAccess';

export default function RolesPage() {
  const { data: session } = useSession();

  const canManageRoles = hasPermission(session, 'canManageRoles');

  if (!canManageRoles) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Role & Permission Management</h1>
      <div className="flex flex-col gap-8">
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <RolesManager />
        </div>
      </div>
    </div>
  );
} 