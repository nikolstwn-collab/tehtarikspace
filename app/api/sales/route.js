export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { paymentMethod, items } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada produk dalam transaksi.' },
        { status: 400 }
      );
    }

    // Hitung total transaksi
    const totalAmount = items.reduce(
      (sum, p) => sum + Number(p.price) * Number(p.quantity),
      0
    );

    const user = await prisma.user.findFirst(); // sementara pakai user pertama
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan di database.' },
        { status: 404 }
      );
    }

    // ✅ CEK STOK BAHAN BAKU SEBELUM TRANSAKSI
    for (const item of items) {
      const recipes = await prisma.productRecipe.findMany({
        where: { productId: item.productId },
        include: { rawMaterial: true },
      });

      for (const recipe of recipes) {
        const jumlahDibutuhkan = Number(recipe.quantityNeeded) * Number(item.quantity);
        const stokTersedia = Number(recipe.rawMaterial.stock);

        if (stokTersedia < jumlahDibutuhkan) {
          return NextResponse.json(
            {
              error: `Stok bahan "${recipe.rawMaterial.name}" tidak cukup.\nDibutuhkan ${jumlahDibutuhkan} ${recipe.rawMaterial.unit}, tapi hanya tersedia ${stokTersedia} ${recipe.rawMaterial.unit}.`,
            },
            { status: 400 }
          );
        }
      }
    }

    // 🧾 SIMPAN TRANSAKSI + ITEM
    const sale = await prisma.salesTransaction.create({
      data: {
        paymentMethod,
        totalAmount,
        createdBy: user.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            subtotal: Number(item.price) * Number(item.quantity),
          })),
        },
      },
      include: { items: true },
    });

    // 🔁 UPDATE STOK PRODUK DAN BAHAN BAKU
    for (const item of items) {
      // Kurangi stok produk
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });

      // Kurangi stok bahan baku berdasarkan resep
      const recipes = await prisma.productRecipe.findMany({
        where: { productId: item.productId },
      });

      for (const recipe of recipes) {
        const totalPakai = Number(recipe.quantityNeeded) * Number(item.quantity);
        await prisma.rawMaterial.update({
          where: { id: recipe.rawMaterialId },
          data: { stock: { decrement: totalPakai } },
        });
      }
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (err) {
    console.error('❌ Error creating sales transaction:', err);
    return NextResponse.json(
      { error: 'Gagal menyimpan transaksi', detail: err.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
