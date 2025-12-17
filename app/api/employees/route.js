export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * GET /api/employees
 */
export async function GET() {
  try {
    const { prisma } = await import('@/lib/prisma');

    const employees = await prisma.employee.findMany({
      include: { shifts: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error("GET /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees
 */
export async function POST(request) {
  try {
    const { prisma } = await import('@/lib/prisma');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      birthDate,
      address,
      gender,
      phone,
      position,
      photoUrl,
      shiftType,
    } = body;

    const employee = await prisma.employee.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        address,
        gender,
        phone,
        position,
        photoUrl: photoUrl || null,
      },
    });

    const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
    const shiftTime =
      shiftType === "MALAM" ? "17:00 - 23:00" : "07:00 - 17:00";

    await prisma.shift.createMany({
      data: days.map((day) => ({
        employeeId: employee.id,
        dayOfWeek: day,
        shiftTime,
        isActive: true,
      })),
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("POST /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to create employee" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/employees
 */
export async function PUT(request) {
  try {
    const { prisma } = await import('@/lib/prisma');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { id, shifts, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID required" },
        { status: 400 }
      );
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        birthDate: new Date(data.birthDate),
        photoUrl: data.photoUrl || null,
      },
    });

    if (Array.isArray(shifts)) {
      await prisma.$transaction(async (tx) => {
        for (const s of shifts) {
          if (s.id) {
            await tx.shift.update({
              where: { id: s.id },
              data: {
                shiftTime: s.shiftTime,
                isActive: !!s.isActive,
              },
            });
          } else {
            await tx.shift.create({
              data: {
                employeeId: id,
                dayOfWeek: s.dayOfWeek,
                shiftTime: s.shiftTime || "07:00 - 17:00",
                isActive: !!s.isActive,
              },
            });
          }
        }
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/employees error:", error);
    return NextResponse.json(
      { error: "Failed to update employee" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/employees
 */
export async function DELETE(request) {
  try {
    const { prisma } = await import('@/lib/prisma');

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Employee ID required" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.shift.deleteMany({ where: { employeeId: id } }),
      prisma.employee.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/employees error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}