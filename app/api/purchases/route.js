export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

/* ================================
   GET ALL PURCHASES
================================ */
export async function GET() {
  try {
    const purchases = await prisma.purchaseTransaction.findMany({
      include: { user: { include: { employee: true } } },
      orderBy: { transactionDate: "desc" },
    });
    return NextResponse.json(purchases);
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ================================
   CREATE PURCHASE (POST)
================================ */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { itemName, quantity, category, totalAmount, unit } = body;

    if (!itemName || !quantity || !category || !totalAmount) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const purchase = await prisma.$transaction(async (tx) => {
      // Ambil user dari session
      const dbUser = await tx.user.findFirst({
        where: { username: session.user.username },
      });

      if (!dbUser) {
        return NextResponse.json(
          { error: "User tidak ditemukan" },
          { status: 400 }
        );
      }

      // 1. Create purchase
      const newPurchase = await tx.purchaseTransaction.create({
        data: {
          itemName,
          quantity: parseInt(quantity, 10),
          category,
          totalAmount: parseFloat(totalAmount),
          createdBy: dbUser.id,
        },
      });

      // 2. Update or create raw material
      const existingMaterial = await tx.rawMaterial.findFirst({
        where: { name: { equals: itemName, mode: "insensitive" } },
      });

      if (existingMaterial) {
        await tx.rawMaterial.update({
          where: { id: existingMaterial.id },
          data: {
            stock: { increment: parseInt(quantity, 10) },
            updatedAt: new Date(),
          },
        });
      } else {
        await tx.rawMaterial.create({
          data: {
            name: itemName,
            category,
            stock: parseInt(quantity, 10),
            unit: unit || "pcs",
          },
        });
      }

      return newPurchase;
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("POST /api/purchases error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* ================================
   UPDATE PURCHASE (PUT)
================================ */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, itemName, quantity, category, totalAmount } = body;

    if (!id || !itemName || !quantity || !category || !totalAmount) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Ambil record lama
      const oldPurchase = await tx.purchaseTransaction.findUnique({
        where: { id },
      });

      if (!oldPurchase) {
        return NextResponse.json(
          { error: "Transaksi tidak ditemukan" },
          { status: 404 }
        );
      }

      // 2. Hitung selisih quantity
      const diffQty = parseInt(quantity) - oldPurchase.quantity;

      // 3. Update raw material berdasarkan selisih
      const material = await tx.rawMaterial.findFirst({
        where: { name: { equals: itemName, mode: "insensitive" } },
      });

      if (material) {
        await tx.rawMaterial.update({
          where: { id: material.id },
          data: {
            stock: { increment: diffQty },
            updatedAt: new Date(),
          },
        });
      }

      // 4. Update purchase
      return await tx.purchaseTransaction.update({
        where: { id },
        data: {
          itemName,
          quantity: parseInt(quantity, 10),
          category,
          totalAmount: parseFloat(totalAmount),
        },
      });
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/purchases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/* ================================
   DELETE PURCHASE
================================ */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });
    }

    await prisma.purchaseTransaction.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/purchases error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
