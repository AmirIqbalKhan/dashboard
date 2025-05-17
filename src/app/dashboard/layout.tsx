import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleBasedLayout>
      {children}
    </RoleBasedLayout>
  );
} 