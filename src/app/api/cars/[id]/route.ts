import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - ดึงข้อมูลรถตาม ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const car = await db.car.findUnique({
      where: { id },
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
    })

    if (!car) {
      return NextResponse.json(
        { error: 'ไม่พบรถยนต์' },
        { status: 404 }
      )
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error('Error fetching car:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถยนต์' },
      { status: 500 }
    )
  }
}

// PUT - อัปเดตข้อมูลรถ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const car = await db.car.update({
      where: { id },
      data: {
        brand: body.brand,
        model: body.model,
        year: parseInt(body.year),
        color: body.color,
        mileage: parseInt(body.mileage),
        engineSize: body.engineSize ? parseFloat(body.engineSize) : null,
        fuelType: body.fuelType || null,
        transmission: body.transmission || null,
        plateNumber: body.plateNumber || null,
        vin: body.vin || null,
        costPrice: parseFloat(body.costPrice),
        sellingPrice: parseFloat(body.sellingPrice),
        description: body.description || null,
        images: body.images || null,
        condition: body.condition || null,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
        status: body.status || 'AVAILABLE',
      },
    })

    return NextResponse.json(car)
  } catch (error) {
    console.error('Error updating car:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตรถยนต์' },
      { status: 500 }
    )
  }
}

// DELETE - ลบรถ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // ตรวจสอบว่ามีการขายรถคันนี้หรือไม่
    const existingSale = await db.sale.findFirst({
      where: { carId: id },
    })

    if (existingSale) {
      return NextResponse.json(
        { error: 'ไม่สามารถลบรถที่มีการขายแล้วได้' },
        { status: 400 }
      )
    }

    await db.car.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'ลบรถยนต์สำเร็จ' })
  } catch (error) {
    console.error('Error deleting car:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการลบรถยนต์' },
      { status: 500 }
    )
  }
}
