import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/onboarding-steps
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const steps = await prisma.onboardingStep.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(steps);
  } catch (error) {
    console.error('Error fetching onboarding steps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/onboarding-steps
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      include: { role: true },
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, order } = await request.json();

    if (!title || typeof order !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const step = await prisma.onboardingStep.create({
      data: {
        title,
        description,
        order,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'create_onboarding_step',
        details: `Created onboarding step: ${title}`,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error('Error creating onboarding step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/onboarding-steps
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      include: { role: true },
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, title, description, order } = await request.json();

    if (!id || !title || typeof order !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const step = await prisma.onboardingStep.update({
      where: { id },
      data: {
        title,
        description,
        order,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'update_onboarding_step',
        details: `Updated onboarding step: ${title}`,
      },
    });

    return NextResponse.json(step);
  } catch (error) {
    console.error('Error updating onboarding step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/onboarding-steps
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
      include: { role: true },
    });

    if (!user || user.role.name !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Missing step ID' },
        { status: 400 }
      );
    }

    // Get step details for audit log
    const step = await prisma.onboardingStep.findUnique({
      where: { id },
    });

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    // Delete the step
    await prisma.onboardingStep.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'delete_onboarding_step',
        details: `Deleted onboarding step: ${step.title}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting onboarding step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 