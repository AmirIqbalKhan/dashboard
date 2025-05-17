import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');
  const start = searchParams.get('start');
  const end = searchParams.get('end');
  if (!siteId) {
    return NextResponse.json({ error: 'Missing siteId' }, { status: 400 });
  }
  const where: any = { siteId };
  if (start) where.date = { gte: new Date(start) };
  if (end) {
    where.date = where.date || {};
    where.date.lte = new Date(end);
  }
  const analytics = await prisma.siteAnalytics.findMany({
    where,
    orderBy: { date: 'asc' },
  });
  return NextResponse.json(analytics);
} 