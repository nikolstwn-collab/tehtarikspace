import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 🔹 GET semua resep
export async function GET() {
  try {
    const recipes = await prisma.productRecipe.findMany({
      include: {
        product: true,
        rawMaterial: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(recipes);
  } catch (error) {
    console.error("GET /api/recipes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 POST buat resep baru (jika mau isi manual)
export async function POST(request) {
  try {
    const { productId, rawMaterialId, quantityNeeded } = await request.json();

    if (!productId || !rawMaterialId || !quantityNeeded) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const recipe = await prisma.productRecipe.create({
      data: {
        productId,
        rawMaterialId,
        quantityNeeded: parseFloat(quantityNeeded),
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    console.error("POST /api/recipes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 🔹 DELETE resep (opsional)
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id)
      return NextResponse.json({ error: "ID tidak ditemukan" }, { status: 400 });

    await prisma.productRecipe.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/recipes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
