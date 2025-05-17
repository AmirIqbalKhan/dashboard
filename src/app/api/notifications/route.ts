import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'admin') {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { title, message } = await req.json();

    if (!title || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
      },
      select: { id: true },
    });

    if (users.length === 0) {
      return new NextResponse('No active users found', { status: 404 });
    }

    // Get the admin user for audit log
    const adminUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { id: true },
    });

    if (!adminUser) {
      return new NextResponse('Admin user not found', { status: 404 });
    }

    // Create notifications for all users in a transaction
    const notifications = await prisma.$transaction(async (tx) => {
      const createdNotifications = await Promise.all(
        users.map((user) =>
          tx.notification.create({
            data: {
              title,
              message,
              userId: user.id,
              type: 'system',
            },
          })
        )
      );

      // Log the notification creation
      await tx.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'CREATE_NOTIFICATION',
          details: `Created notification "${title}" for ${createdNotifications.length} users`,
        },
      });

      return createdNotifications;
    });

    return NextResponse.json({ 
      success: true, 
      count: notifications.length,
      message: `Notification sent to ${notifications.length} users`
    });
  } catch (error) {
    console.error('Error creating notifications:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Get notifications for the current user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
} 