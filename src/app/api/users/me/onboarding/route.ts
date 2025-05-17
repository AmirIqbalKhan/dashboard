import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/users/me/onboarding
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all steps and user's completion status
    const steps = await prisma.onboardingStep.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        userSteps: {
          where: {
            userId: user.id,
          },
        },
      },
    });

    // Transform the response to include completion status
    const stepsWithStatus = steps.map(step => ({
      ...step,
      completed: step.userSteps.length > 0,
      completedAt: step.userSteps[0]?.completedAt || null,
    }));

    return NextResponse.json(stepsWithStatus);
  } catch (error) {
    console.error('Error fetching user onboarding progress:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/users/me/onboarding/:stepId/complete
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user?.email as string },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { stepId } = await request.json();

    if (!stepId) {
      return NextResponse.json(
        { error: 'Missing step ID' },
        { status: 400 }
      );
    }

    // Check if step exists
    const step = await prisma.onboardingStep.findUnique({
      where: { id: stepId },
    });

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      );
    }

    // Mark step as complete
    const userStep = await prisma.userOnboardingStep.upsert({
      where: {
        userId_stepId: {
          userId: user.id,
          stepId: step.id,
        },
      },
      update: {
        completedAt: new Date(),
      },
      create: {
        userId: user.id,
        stepId: step.id,
        completedAt: new Date(),
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'complete_onboarding_step',
        details: `Completed onboarding step: ${step.title}`,
      },
    });

    return NextResponse.json(userStep);
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 