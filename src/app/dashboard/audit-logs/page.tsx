"use client";

import { useSession } from 'next-auth/react';
import { hasPermission } from '@/utils/roleAccess';
import { AuditLogsTable } from '@/components/audit-logs/AuditLogsTable';

export default function AuditLogsPage() {
  const { data: session } = useSession();
  const canViewAuditLogs = hasPermission(session, 'canViewAuditLogs');

  if (!canViewAuditLogs) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-8">Audit Logs</h1>
      <div className="flex flex-col gap-8">
        <div className="bg-white/40 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/30 p-8">
          <h2 className="text-xl font-semibold mb-4">System Activity Logs</h2>
          <AuditLogsTable />
        </div>
      </div>
    </div>
  );
} 