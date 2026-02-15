import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const car = await db.car.findUnique({ where: { id: body.carId } })
    if (!car) return NextResponse.json({ error: 'ไม่พบรถยนต์' }, { status: 404 })
    if (car.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'รถยนต์คันนี้ไม่พร้อมจอง' }, { status: 400 })
    }

    let customer = await db.customer.findFirst({
      where: { phone: body.phone },
    })

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email || null,
          note: `สนใจรถ ${car.brand} ${car.model}`,
        },
      })
    }

    await db.contact.create({
      data: {
        customerId: customer.id,
        contactType: 'จองรถ',
        note: `จองรถ ${car.brand} ${car.model} (${car.year}) - ${body.message || 'สนใจซื้อรถ'}`,
      },
    })

    await db.car.update({
      where: { id: body.carId },
      data: { status: 'RESERVED' },
    })

    return NextResponse.json({
      success: true,
      message: 'จองรถสำเร็จ! เราจะติดต่อกลับไปเร็วที่สุด',
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error creating reservation' }, { status: 500 })
  }
}