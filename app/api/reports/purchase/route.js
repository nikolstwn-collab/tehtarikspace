import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ✅ GET /api/reports/purchase
export async function GET() {
  try {
    const purchases = await prisma.purchaseTransaction.findMany({
      orderBy: { transactionDate: 'asc' },
    });

    // 🧠 Ubah data sesuai struktur yang dipakai di UI
    const data = purchases.map((p) => ({
      id: p.id,
      tanggal: p.transactionDate
        ? p.transactionDate.toISOString().split('T')[0]
        : '-',
      supplier: p.createdBy ? `User ${p.createdBy}` : 'Supplier Lokal',
      item: p.itemName || '-',
      jumlah: p.quantity || 0,
      total: p.totalAmount || 0,
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ GET /api/reports/purchase error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase data' },
      { status: 500 }
    );
  }
}
