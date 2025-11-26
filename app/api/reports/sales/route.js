import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ GET /api/reports/sales
export async function GET() {
  try {
    const transactions = await prisma.salesTransaction.findMany({
      include: { items: true },
      orderBy: { transactionDate: 'asc' },
    });

    // 🧠 Flatten agar setiap item = 1 baris laporan
    const sales = transactions.flatMap((t) =>
      t.items.map((item) => ({
        id: item.id,
        tanggal: t.transactionDate
          ? t.transactionDate.toISOString().split('T')[0]
          : '-',
        produk: item.productName || '-',
        jumlah: item.quantity || 0,
        total: item.subtotal || 0,
      }))
    );

    return NextResponse.json(sales);
  } catch (error) {
    console.error('❌ GET /api/reports/sales error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
