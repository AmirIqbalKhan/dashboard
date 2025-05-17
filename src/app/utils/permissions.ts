import { Session } from 'next-auth';

export function hasPermission(session: Session | null, permission: string): boolean {
  if (!session || !session.user || !(session.user as any).role) return false;
  const role = (session.user as any).role;
  if (!role || !role.permissions) return false;
  return role.permissions.includes(permission);
}

// For backend (API route) usage, you can pass in the user object directly
export function userHasPermission(user: any, permission: string): boolean {
  if (!user || !user.role || !user.role.permissions) return false;
  return user.role.permissions.some((p: any) => p.name === permission);
} 