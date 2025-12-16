// app/api/shifts/bulk-update/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// PUT /api/shifts/bulk-update
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, shifts } = body;

    if (!employeeId || !Array.isArray(shifts)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // We'll do a transaction:
    // - For each incoming shift:
    //   - if id provided -> update
    //   - else if isActive true -> create
    // - For existing shifts that are not present in incoming -> either delete or set inactive
    const result = await prisma.$transaction(async (tx) => {
      // fetch existing shifts
      const existing = await tx.shift.findMany({ where: { employeeId }});
      const existingByDay = existing.reduce((acc, s) => { acc[s.dayOfWeek] = s; return acc; }, {});

      // process incoming
      for (const s of shifts) {
        if (s.id) {
          // update existing by id
          await tx.shift.update({
            where: { id: s.id },
            data: {
              shiftTime: s.shiftTime,
              isActive: !!s.isActive,
            },
          });
        } else {
          // try to find by day
          const match = existingByDay[s.dayOfWeek];
          if (match) {
            await tx.shift.update({
              where: { id: match.id },
              data: { shiftTime: s.shiftTime, isActive: !!s.isActive },
            });
          } else if (s.isActive) {
            // create new shift only if active
            await tx.shift.create({
              data: {
                employeeId,
                dayOfWeek: s.dayOfWeek,
                shiftTime: s.shiftTime || '07:00 - 17:00',
                isActive: !!s.isActive,
              },
            });
          }
        }
      }

      // Optionally: set to inactive any existing shift not present among incoming days
      const incomingDays = shifts.map(s => s.dayOfWeek);
      const toDeactivate = existing.filter(s => !incomingDays.includes(s.dayOfWeek));
      for (const d of toDeactivate) {
        await tx.shift.update({
          where: { id: d.id },
          data: { isActive: false },
        });
      }

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('PUT /api/shifts/bulk-update error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
