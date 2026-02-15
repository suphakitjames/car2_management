import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')

    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const customers = await db.customer.findMany({
      where,
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        sales: {
          include: { car: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(customers)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const customer = await db.customer.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        idCard: body.idCard || null,
        note: body.note || null,
      },
    })

    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating customer' }, { status: 500 })
  }
}