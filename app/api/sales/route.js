export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req) {
  try {
    const { paymentMethod, items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada produk dalam transaksi.' },
        { status: 400 }
      )
    }

    const totalAmount = items.reduce(
      (sum, p) => sum + Number(p.price) * Number(p.quantity),
      0
    )

    // ⚠️ sementara: ambil user pertama
    const user = await prisma.user.findFirst()
    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan di database.' },
        { status: 404 }
      )
    }

    // ✅ CEK STOK BAHAN BAKU
    for (const item of items) {
      const recipes = await prisma.productRecipe.findMany({
        where: { productId: item.productId },
        include: { rawMaterial: true }
      })

      for (const recipe of recipes) {
        const needed =
          Number(recipe.quantityNeeded) * Number(item.quantity)
        const available = Number(recipe.rawMaterial.stock)

        if (available < needed) {
          return NextResponse.json(
            {
              error: `Stok bahan "${recipe.rawMaterial.name}" tidak cukup.
Dibutuhkan ${needed} ${recipe.rawMaterial.unit}, tersedia ${available} ${recipe.rawMaterial.unit}.`
            },
            { status: 400 }
          )
        }
      }
    }

    // 🧾 TRANSAKSI ATOMIK
    const sale = await prisma.$transaction(async (tx) => {
      const saleTx = await tx.salesTransaction.create({
        data: {
          paymentMethod,
          totalAmount,
          createdBy: user.id,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              productName: item.productName,
              quantity: Number(item.quantity),
              price: Number(item.price),
              subtotal:
                Number(item.price) * Number(item.quantity)
            }))
          }
        },
        include: { items: true }
      })

      for (const item of items) {
        // Kurangi stok produk
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: Number(item.quantity) } }
        })

        // Kurangi stok bahan baku
        const recipes = await tx.productRecipe.findMany({
          where: { productId: item.productId }
        })

        for (const recipe of recipes) {
          const used =
            Number(recipe.quantityNeeded) * Number(item.quantity)

          await tx.rawMaterial.update({
            where: { id: recipe.rawMaterialId },
            data: { stock: { decrement: used } }
          })
        }
      }

      return saleTx
    })

    return NextResponse.json(sale, { status: 201 })
  } catch (err) {
    console.error('❌ Error creating sales transaction:', err)
    return NextResponse.json(
      { error: 'Gagal menyimpan transaksi' },
      { status: 500 }
    )
  }
}