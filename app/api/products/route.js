import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// ============================
// GET /api/products
// ============================
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        recipes: {
          include: {
            rawMaterial: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET products error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================
// POST /api/products (OWNER only)
// Tambah produk + resep bahan baku
// ============================
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, price, stock, category, photoUrl, recipes } = body;

    // Validasi minimal
    if (!name || !price || !stock || !category) {
      return NextResponse.json({ error: 'Data produk tidak lengkap' }, { status: 400 });
    }

    // Simpan produk + resep sekaligus
    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        photoUrl: photoUrl || null,
        recipes: {
          create: recipes
            ?.filter((r) => r.rawMaterialId && r.quantityNeeded > 0)
            .map((r) => ({
              rawMaterialId: r.rawMaterialId,
              quantityNeeded: parseFloat(r.quantityNeeded),
            })),
        },
      },
      include: { recipes: { include: { rawMaterial: true } } },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('POST product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================
// PUT /api/products (OWNER only)
// Update produk dan resep bahan
// ============================
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, price, stock, category, photoUrl, recipes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID diperlukan' }, { status: 400 });
    }

    // Hapus resep lama & buat ulang (paling aman)
    await prisma.productRecipe.deleteMany({
      where: { productId: id },
    });

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        stock: parseInt(stock),
        category,
        photoUrl: photoUrl || null,
        recipes: {
          create: recipes
            ?.filter((r) => r.rawMaterialId && r.quantityNeeded > 0)
            .map((r) => ({
              rawMaterialId: r.rawMaterialId,
              quantityNeeded: parseFloat(r.quantityNeeded),
            })),
        },
      },
      include: { recipes: { include: { rawMaterial: true } } },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PUT product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ============================
// DELETE /api/products?id=123 (OWNER only)
// ============================
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    await prisma.productRecipe.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
