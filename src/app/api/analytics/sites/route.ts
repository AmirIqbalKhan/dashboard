import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const sites = await prisma.site.findMany({
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(sites);
} 