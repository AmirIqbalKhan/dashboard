import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const events = await prisma.ecommerceEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  // Summary stats
  const totalSales = await prisma.ecommerceEvent.aggregate({
    _sum: { amount: true },
    where: { type: 'purchase' },
  });
  const totalPurchases = await prisma.ecommerceEvent.count({
    where: { type: 'purchase' },
  });
  const totalCartAdds = await prisma.ecommerceEvent.count({
    where: { type: 'cart_add' },
  });
  return NextResponse.json({
    events,
    summary: {
      totalSales: totalSales._sum.amount || 0,
      totalPurchases,
      totalCartAdds,
    },
  });
} 