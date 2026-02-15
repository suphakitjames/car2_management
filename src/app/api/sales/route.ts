import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sales = await db.sale.findMany({
      include: {
        car: true,
        customer: true,
      },
      orderBy: { saleDate: 'desc' },
    })
    return NextResponse.json(sales)
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching sales' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const car = await db.car.findUnique({ where: { id: body.carId } })
    if (!car) return NextResponse.json({ error: 'ไม่พบรถยนต์' }, { status: 404 })
    if (car.status === 'SOLD') {
      return NextResponse.json({ error: 'รถยนต์คันนี้ถูกขายไปแล้ว' }, { status: 400 })
    }

    const salePrice = parseFloat(body.salePrice)
    const profit = salePrice - car.costPrice

    const [sale] = await db.$transaction([
      db.sale.create({
        data: {
          carId: body.carId,
          customerId: body.customerId,
          salePrice,
          profit,
          paymentType: body.paymentType || null,
          note: body.note || null,
        },
        include: { car: true, customer: true },
      }),
      db.car.update({
        where: { id: body.carId },
        data: { status: 'SOLD' },
      }),
    ])

    return NextResponse.json(sale, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating sale' }, { status: 500 })
  }
}