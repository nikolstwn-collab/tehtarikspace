export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined')
}

// 🔐 Helper: ambil session atau bearer token
async function getSessionOrToken(request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user) return session

    const authHeader = request.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, JWT_SECRET)
      return { user: decoded }
    }

    return null
  } catch (error) {
    console.error('❌ Token/session verification failed:', error)
    return null
  }
}

// ================================
// GET SHIFTS
// ================================
export async function GET(request) {
  try {
    const session = await getSessionOrToken(request)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const employeeId = searchParams.get('employeeId')

    if (session.user.role === 'OWNER') {
      const shifts = await prisma.shift.findMany({
        include: { employee: true },
        orderBy: { createdAt: 'desc' }
      })
      return NextResponse.json(shifts)
    }

    if (session.user.role === 'EMPLOYEE') {
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
    console.error('❌ GET shifts error:', error)
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
    const session = await getSessionOrToken(request)
    if (!session || session.user.role !== 'OWNER') {
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
    console.error('❌ POST shift error:', error)
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
    const session = await getSessionOrToken(request)
    if (!session || session.user.role !== 'OWNER') {
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
    console.error('❌ PUT shift error:', error)
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
    const session = await getSessionOrToken(request)
    if (!session || session.user.role !== 'OWNER') {
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
    console.error('❌ DELETE shift error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}