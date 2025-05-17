import { Session } from 'next-auth';

export const ROLE_PERMISSIONS = {
  admin: {
    canManageUsers: true,
    canManageRoles: true,
    canViewAnalytics: true,
    canManageNews: true,
    canViewNews: true,
    canManageSettings: true,
    canViewCalendar: true,
    canManageCalendar: true,
    canViewAuditLogs: true,
    canManageAuditLogs: true,
    canViewProducts: true,
    canManageProducts: true,
    canManageOnboarding: true,
  },
  manager: {
    canManageUsers: true,
    canManageRoles: false,
    canViewAnalytics: true,
    canManageNews: true,
    canViewNews: true,
    canManageSettings: true,
    canViewCalendar: true,
    canManageCalendar: true,
    canViewAuditLogs: true,
    canManageAuditLogs: false,
    canViewProducts: true,
    canManageProducts: true,
    canManageOnboarding: true,
  },
  user: {
    canManageUsers: false,
    canManageRoles: false,
    canViewAnalytics: false,
    canManageNews: false,
    canViewNews: true,
    canManageSettings: false,
    canViewCalendar: true,
    canManageCalendar: false,
    canViewAuditLogs: false,
    canManageAuditLogs: false,
    canViewProducts: true,
    canManageProducts: false,
    canManageOnboarding: false,
  },
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS.admin;

export function hasPermission(session: Session | null, permission: Permission): boolean {
  if (!session?.user?.role) return false;
  const role = session.user.role as keyof typeof ROLE_PERMISSIONS;
  return ROLE_PERMISSIONS[role]?.[permission] || false;
}

export function requirePermission(session: Session | null, permission: Permission): boolean {
  return hasPermission(session, permission);
} 