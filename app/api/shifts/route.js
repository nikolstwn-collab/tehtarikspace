export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

// ================================
// Helper: ambil user dari Bearer token
// ================================
function getUserFromRequest(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return null

    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET
    if (!secret) return null

    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

// ================================
// GET SHIFTS
// ================================
export async function GET(request) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (user.role === 'OWNER') {
      const shifts = await prisma.shift.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(shifts)
    }

    if (user.role === 'EMPLOYEE') {
      if (!employeeId) {
        return NextResponse.json(
          { error: 'Employee ID required' },
          { status: 400 }
        )
      }

      const shifts = await prisma.shift.findMany({
        where: { employeeId },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(shifts)
    }

    return NextResponse.json(
      { error: 'Unauthorized role' },
      { status: 403 }
    )
  } catch (error) {
    console.error('GET shifts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// POST SHIFT (OWNER)
// ================================
export async function POST(request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { employeeId, dayOfWeek, shiftTime, isActive } =
      await request.json()

    if (!employeeId || !dayOfWeek || !shiftTime) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      )
    }

    const shift = await prisma.shift.create({
      data: {
        employeeId,
        dayOfWeek,
        shiftTime,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(shift, { status: 201 })
  } catch (error) {
    console.error('POST shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// PUT SHIFT (OWNER)
// ================================
export async function PUT(request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id, dayOfWeek, shiftTime, isActive } =
      await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Shift ID required' },
        { status: 400 }
      )
    }

    const shift = await prisma.shift.update({
      where: { id },
      data: {
        dayOfWeek,
        shiftTime,
        isActive
      }
    })

    return NextResponse.json(shift)
  } catch (error) {
    console.error('PUT shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ================================
// DELETE SHIFT (OWNER)
// ================================
export async function DELETE(request) {
  try {
    const user = getUserFromRequest(request)
    if (!user || user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Shift ID required' },
        { status: 400 }
      )
    }

    await prisma.shift.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}