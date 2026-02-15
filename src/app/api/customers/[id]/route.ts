import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - ดึงข้อมูลลูกค้าตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const customer = await db.customer.findUnique({
      where: { id },
      include: {
        contacts: {
          orderBy: { createdAt: 'desc' },
        },
        sales: {
          include: { car: true },
          orderBy: { saleDate: 'desc' },
        },
      },
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'ไม่พบลูกค้า' },
        { status: 404 }
      )
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลลูกค้า' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตข้อมูลลูกค้า
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const customer = await db.customer.update({
      where: { id },
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email || null,
        address: body.address || null,
        idCard: body.idCard || null,
        note: body.note || null,
      },
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตลูกค้า' },
      { status: 500 }
    )
  }
}

// DELETE - ลบลูกค้า
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ตรวจสอบว่ามีการขายให้ลูกค้าคนนี้หรือไม่
    const existingSale = await db.sale.findFirst({
      where: { customerId: id },
    })

    if (existingSale) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบลูกค้าที่มีประวัติการซื้อได้' },
        { status: 400 }
      )
    }

    // ลบข้อมูลการติดต่อก่อน
    await db.contact.deleteMany({
      where: { customerId: id },
    })

    await db.customer.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'ลบลูกค้าสำเร็จ' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบลูกค้า' },
      { status: 500 }
    )
  }
}
