import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const keys = ['apiKey', 'webhookUrl', 'orgName', 'logo', 'theme', 'brandColor'];

export async function GET() {
  const settings = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = settings.find(s => s.key === key)?.value || '';
  }
  return NextResponse.json(result);
}

export async function POST(request: Request) {
  const data = await request.json();
  for (const key of keys) {
    if (key in data) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: data[key] },
        create: { key, value: data[key] },
      });
    }
  }
  return NextResponse.json({ success: true });
} 