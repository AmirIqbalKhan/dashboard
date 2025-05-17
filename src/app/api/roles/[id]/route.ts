import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, description, permissionIds } = await request.json();
    if (!name || !permissionIds) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const role = await prisma.role.update({
      where: { id: params.id },
      data: {
        name,
        description,
        permissions: {
          set: [], // Remove all existing permissions
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.role.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 