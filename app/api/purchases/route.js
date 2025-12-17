export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'

/* ================================
   GET ALL PURCHASES
================================ */
export async function GET() {
  try {
    const purchases = await prisma.purchaseTransaction.findMany({
      include: {
        user: { include: { employee: true } }
      },
      orderBy: { transactionDate: 'desc' }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    console.error('GET /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* ================================
   CREATE PURCHASE (POST)
================================ */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { itemName, quantity, category, totalAmount, unit } =
      await request.json()

    if (!itemName || !quantity || !category || !totalAmount) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const purchase = await prisma.$transaction(async (tx) => {
      const dbUser = await tx.user.findFirst({
        where: { username: session.user.username }
      })

      if (!dbUser) {
        throw new Error('User tidak ditemukan')
      }

      const newPurchase = await tx.purchaseTransaction.create({
        data: {
          itemName,
          quantity: Number(quantity),
          category,
          totalAmount: Number(totalAmount),
          createdBy: dbUser.id
        }
      })

      const existingMaterial = await tx.rawMaterial.findFirst({
        where: { name: { equals: itemName, mode: 'insensitive' } }
      })

      if (existingMaterial) {
        await tx.rawMaterial.update({
          where: { id: existingMaterial.id },
          data: {
            stock: { increment: Number(quantity) },
            updatedAt: new Date()
          }
        })
      } else {
        await tx.rawMaterial.create({
          data: {
            name: itemName,
            category,
            stock: Number(quantity),
            unit: unit || 'pcs'
          }
        })
      }

      return newPurchase
    })

    return NextResponse.json(purchase, { status: 201 })
  } catch (error) {
    console.error('POST /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* ================================
   UPDATE PURCHASE (PUT)
================================ */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, itemName, quantity, category, totalAmount } =
      await request.json()

    if (!id || !itemName || !quantity || !category || !totalAmount) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const updated = await prisma.$transaction(async (tx) => {
      const oldPurchase = await tx.purchaseTransaction.findUnique({
        where: { id }
      })

      if (!oldPurchase) {
        throw new Error('Transaksi tidak ditemukan')
      }

      const diffQty = Number(quantity) - oldPurchase.quantity

      const material = await tx.rawMaterial.findFirst({
        where: { name: { equals: itemName, mode: 'insensitive' } }
      })

      if (material) {
        await tx.rawMaterial.update({
          where: { id: material.id },
          data: {
            stock: { increment: diffQty },
            updatedAt: new Date()
          }
        })
      }

      return await tx.purchaseTransaction.update({
        where: { id },
        data: {
          itemName,
          quantity: Number(quantity),
          category,
          totalAmount: Number(totalAmount)
        }
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('PUT /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/* ================================
   DELETE PURCHASE
================================ */
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'ID tidak ditemukan' },
        { status: 400 }
      )
    }

    await prisma.purchaseTransaction.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/purchases error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}