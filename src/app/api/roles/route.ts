import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const roles = await prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(roles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description, permissionIds } = await request.json();
    if (!name || !permissionIds) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: {
          connect: permissionIds.map((id: string) => ({ id })),
        },
      },
      include: { permissions: true },
    });
    return NextResponse.json(role);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 