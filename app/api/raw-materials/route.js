// app/api/raw-materials/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// =========================================================
// ✅ GET semua bahan baku (Public, agar ProductModal bisa akses)
// =========================================================
export async function GET() {
  try {
    const materials = await prisma.rawMaterial.findMany({
      include: {
        recipes: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(materials);
  } catch (error) {
    console.error('GET /api/raw-materials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =========================================================
// ✅ POST: Tambah bahan baku (OWNER only)
// =========================================================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, category, stock, unit } = body;

    if (!name || !category || !stock || !unit) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const material = await prisma.rawMaterial.create({
      data: {
        name,
        category,
        stock: parseFloat(stock),
        unit,
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    console.error('POST /api/raw-materials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =========================================================
// ✅ PUT: Update bahan baku (OWNER only)
// =========================================================
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, category, stock, unit } = body;

    if (!id) {
      return NextResponse.json({ error: 'Material ID tidak ditemukan' }, { status: 400 });
    }

    const material = await prisma.rawMaterial.update({
      where: { id },
      data: {
        name,
        category,
        stock: parseFloat(stock),
        unit,
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error('PUT /api/raw-materials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// =========================================================
// ✅ DELETE: Hapus bahan baku (OWNER only)
// =========================================================
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Material ID diperlukan' }, { status: 400 });
    }

    await prisma.rawMaterial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/raw-materials error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
