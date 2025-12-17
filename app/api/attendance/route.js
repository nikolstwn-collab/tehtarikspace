export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

// === GET: Ambil semua absensi ===
export async function GET() {
  try {
    // ✅ lazy import prisma (AMAN DI VERCEL)
    const prisma = (await import('@/lib/prisma')).default;

    const data = await prisma.attendance.findMany({
      include: { employee: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

// === POST: Simpan absensi hari ini ===
export async function POST(req) {
  try {
    // ✅ lazy import prisma (AMAN DI VERCEL)
    const prisma = (await import('@/lib/prisma')).default;

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
    return NextResponse.json(
      { error: 'Failed to save attendance' },
      { status: 500 }
    );
  }
}