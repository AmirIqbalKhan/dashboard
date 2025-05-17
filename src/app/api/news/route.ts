import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '../auth/[...nextauth]/route';

const prisma = new PrismaClient();

// GET /api/news
export async function GET() {
  try {
    const posts = await prisma.newsPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching news posts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/news
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
    const { title, content } = await request.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const post = await prisma.newsPost.create({
      data: {
        title,
        content,
        authorId: user.id,
      },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating news post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/news
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
    const { id, title, content } = await request.json();
    if (!id || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const post = await prisma.newsPost.update({
      where: { id },
      data: { title, content },
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error('Error updating news post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/news
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
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 });
    }
    await prisma.newsPost.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting news post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 