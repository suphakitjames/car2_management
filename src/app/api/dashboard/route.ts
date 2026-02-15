import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - ดึงข้อมูล Dashboard
export async function GET() {
  try {
    const totalCars = await db.car.count()
    const availableCars = await db.car.count({
      where: { status: 'AVAILABLE' },
    })
    const reservedCars = await db.car.count({
      where: { status: 'RESERVED' },
    })
    const soldCars = await db.car.count({
      where: { status: 'SOLD' },
    })
    const totalCustomers = await db.customer.count()

    const salesStats = await db.sale.aggregate({
      _sum: {
        salePrice: true,
        profit: true,
      },
      _count: true,
    })

    const inventoryValue = await db.car.aggregate({
      where: {
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      _sum: {
        costPrice: true,
        sellingPrice: true,  // ชื่อ field ใน database
      },
    })

    const latestSales = await db.sale.findMany({
      take: 5,
      include: {
        car: true,
        customer: true,
      },
      orderBy: { saleDate: 'desc' },
    })

    const latestCars = await db.car.findMany({
      take: 5,
      where: {
        status: { in: ['AVAILABLE', 'RESERVED'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      summary: {
        totalCars,
        availableCars,
        reservedCars,
        soldCars,
        totalCustomers,
        totalSales: salesStats._sum.salePrice || 0,
        totalProfit: salesStats._sum.profit || 0,
        salesCount: salesStats._count,
        inventoryCostValue: inventoryValue._sum.costPrice || 0,
        inventorySellingValue: inventoryValue._sum.sellingPrice || 0,  // แก้เป็น sellingPrice
      },
      monthlySales: {},
      topBrands: [],
      latestSales,
      latestCars,
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล Dashboard' },
      { status: 500 }
    )
  }
}