export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// === GET: Ambil semua absensi ===
export async function GET() {
  try {
    const data = await prisma.attendance.findMany({
      include: { employee: true }, // ⬅️ penting agar nama pegawai muncul
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// === POST: Simpan absensi hari ini ===
export async function POST(req) {
  try {
    const { employeeId, status } = await req.json();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: { gte: startOfDay, lt: endOfDay },
      },
    });

    if (existing) {
      return NextResponse.json(
        { message: 'Pegawai sudah absen hari ini' },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        status: status || 'HADIR',
        date: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Absensi berhasil disimpan!',
      attendance,
    });
  } catch (error) {
    console.error('POST /attendance error:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
