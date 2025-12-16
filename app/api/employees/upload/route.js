import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

/**
 * UPLOAD EXCEL → IMPORT PEGAWAI + SHIFT DEFAULT
 */
export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "File Excel tidak ditemukan" },
        { status: 400 }
      );
    }

    // Convert Excel → JSON
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    const days = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];

    for (const row of rows) {
      // Pastikan field utama ada
      if (!row.name || !row.birthDate || !row.gender) continue;

      // 1️⃣ Buat pegawai
      const employee = await prisma.employee.create({
        data: {
          name: row.name,
          birthDate: new Date(row.birthDate),
          address: row.address ?? "-",
          gender: row.gender,
          phone: row.phone ?? "-",
          position: row.position ?? "Pegawai",
          photoUrl: row.photoUrl ?? null,
        },
      });

      // 2️⃣ Shift default (pagi)
      await prisma.shift.createMany({
        data: days.map((day) => ({
          employeeId: employee.id,
          dayOfWeek: day,
          shiftTime: "07:00 - 17:00",
          isActive: true,
        })),
      });
    }

    return NextResponse.json(
      { success: true, message: "Import pegawai berhasil" },
      { status: 201 }
    );
  } catch (err) {
    console.error("Upload Employees Error:", err);
    return NextResponse.json(
      { error: "Gagal mengupload file Excel" },
      { status: 500 }
    );
  }
}
