export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/employees
 * - Owner: lihat semua pegawai + shift
 * - Karyawan: lihat daftar pegawai & shift tanpa bisa edit
 */
export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      include: {
        shifts: true,
      },
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
 * - Owner menambah pegawai baru
 * - Otomatis membuat shift default (Senin–Sabtu)
 */
export async function POST(request) {
  try {
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

    // 1️⃣ Buat pegawai baru
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

    // 2️⃣ Buat shift default (Senin–Sabtu)
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/employees
 * - Owner dapat update pegawai + shift
 * - Body bisa berisi { id, name, ..., shifts: [{dayOfWeek, shiftTime, isActive}] }
 */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      birthDate,
      address,
      gender,
      phone,
      position,
      photoUrl,
      shifts,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });
    }

    // 1️⃣ Update data pegawai
    const updated = await prisma.employee.update({
      where: { id },
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

    // 2️⃣ Jika ada shift di body, update juga
    if (Array.isArray(shifts) && shifts.length > 0) {
      await prisma.$transaction(async (tx) => {
        for (const s of shifts) {
          if (s.id) {
            // Jika ada ID shift → update
            await tx.shift.update({
              where: { id: s.id },
              data: {
                shiftTime: s.shiftTime,
                isActive: !!s.isActive,
              },
            });
          } else {
            // Jika tidak ada ID shift → create baru
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/employees?id=xyz
 * - Owner hapus pegawai (otomatis hapus shift-nya juga)
 */
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "OWNER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id)
      return NextResponse.json({ error: "Employee ID required" }, { status: 400 });

    // Hapus semua shift + pegawai
    await prisma.$transaction([
      prisma.shift.deleteMany({ where: { employeeId: id } }),
      prisma.employee.delete({ where: { id } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/employees error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
