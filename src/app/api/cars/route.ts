import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - ดึงรายการรถทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { plateNumber: { contains: search } },
      ]
    }

    const cars = await db.car.findMany({
      where,
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(cars)
  } catch (error) {
    console.error('Error fetching cars:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรถยนต์' },
      { status: 500 }
    )
  }
}

// POST - เพิ่มรถใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const car = await db.car.create({
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

    return NextResponse.json(car, { status: 201 })
  } catch (error) {
    console.error('Error creating car:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มรถยนต์' },
      { status: 500 }
    )
  }
}