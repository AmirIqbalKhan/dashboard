import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Clear tables for development re-seeding (delete dependents first)
    await prisma.notification.deleteMany();
    await prisma.userOnboardingStep.deleteMany();
    await prisma.newsPost.deleteMany();
    await prisma.order.deleteMany();
    await prisma.ecommerceEvent.deleteMany();
    await prisma.userActivity.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.siteAnalytics.deleteMany();
    await prisma.site.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.permission.deleteMany();

    // Create permissions
    const permissions = await Promise.all([
      prisma.permission.create({
        data: {
          name: 'manage_users',
          description: 'Can manage users (create, update, delete)',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'view_users',
          description: 'Can view users',
        },
      }),
      prisma.permission.create({
        data: {
          name: 'manage_roles',
          description: 'Can manage roles and permissions',
        },
      }),
    ]);

    // Create roles
    const adminRole = await prisma.role.create({
      data: {
        name: 'admin',
        description: 'Administrator with full access',
        permissions: {
          connect: permissions.map(p => ({ id: p.id })),
        },
      },
    });

    await prisma.role.create({
      data: {
        name: 'manager',
        description: 'Manager with limited access',
        permissions: {
          connect: permissions.filter(p => p.name !== 'manage_roles').map(p => ({ id: p.id })),
        },
      },
    });

    await prisma.role.create({
      data: {
        name: 'user',
        description: 'Regular user with basic access',
        permissions: {
          connect: permissions.filter(p => p.name === 'view_users').map(p => ({ id: p.id })),
        },
      },
    });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        roleId: adminRole.id,
        isActive: true,
      },
    });

    // Create sample data
    await prisma.userActivity.createMany({
      data: [
        { userId: adminUser.id, type: 'login', page: null },
        { userId: adminUser.id, type: 'page_view', page: '/dashboard' },
        { userId: adminUser.id, type: 'page_view', page: '/dashboard/users' },
        { userId: adminUser.id, type: 'page_view', page: '/dashboard/roles' },
      ],
    });

    const site = await prisma.site.create({
      data: {
        name: 'Demo Site',
        url: 'https://demo.example.com',
      },
    });

    await prisma.siteAnalytics.createMany({
      data: [
        { siteId: site.id, date: new Date('2024-05-01'), pageViews: 120, uniqueUsers: 80, referrer: 'google.com' },
        { siteId: site.id, date: new Date('2024-05-02'), pageViews: 150, uniqueUsers: 100, referrer: 'twitter.com' },
        { siteId: site.id, date: new Date('2024-05-03'), pageViews: 90, uniqueUsers: 60, referrer: 'direct' },
      ],
    });

    await prisma.ecommerceEvent.createMany({
      data: [
        { userId: adminUser.id, type: 'purchase', amount: 49.99 },
        { userId: adminUser.id, type: 'cart_add', amount: 19.99 },
        { userId: adminUser.id, type: 'purchase', amount: 99.99 },
      ],
    });

    const pagePermissions = [
      { name: 'view_dashboard', description: 'Can view dashboard' },
      { name: 'view_users', description: 'Can view users' },
      { name: 'manage_users', description: 'Can manage users' },
      { name: 'view_roles', description: 'Can view roles' },
      { name: 'manage_roles', description: 'Can manage roles' },
      { name: 'view_analytics', description: 'Can view analytics' },
      { name: 'manage_analytics', description: 'Can manage analytics' },
      { name: 'view_news', description: 'Can view news' },
      { name: 'manage_news', description: 'Can manage news' },
      { name: 'view_settings', description: 'Can view settings' },
      { name: 'manage_settings', description: 'Can manage settings' },
      { name: 'view_calendar', description: 'Can view calendar' },
      { name: 'manage_calendar', description: 'Can manage calendar' },
      { name: 'view_audit_logs', description: 'Can view audit logs' },
      { name: 'manage_audit_logs', description: 'Can manage audit logs' },
      { name: 'view_products', description: 'Can view products' },
      { name: 'manage_products', description: 'Can manage products' },
      { name: 'view_onboarding', description: 'Can view onboarding' },
      { name: 'manage_onboarding', description: 'Can manage onboarding' },
    ];

    for (const perm of pagePermissions) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: {},
        create: perm,
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 