import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleCars = [
  {
    brand: "Toyota",
    model: "Camry 2.5 Hybrid",
    year: 2022,
    color: "ขาวมุก",
    mileage: 35000,
    engineSize: 2.5,
    fuelType: "ไฮบริด",
    transmission: "อัตโนมัติ",
    plateNumber: "กข-1234",
    vin: "JTDKN3DU5A0012345",
    costPrice: 1350000,
    sellingPrice: 1590000,
    description: "สภาพเหมือนใหม่ ไม่เคยอุบ ผู้หญิงขับ ดูแลเป็นอย่างดี",
    status: "AVAILABLE",
    condition: "ดีเยี่ยม",
    purchaseDate: new Date("2024-10-15"),
  },
  {
    brand: "Honda",
    model: "Civic RS Turbo",
    year: 2023,
    color: "ดำ",
    mileage: 18000,
    engineSize: 1.5,
    fuelType: "เบนซิน",
    transmission: "CVT",
    plateNumber: "กค-5678",
    vin: "MRHFK1640NP123456",
    costPrice: 1050000,
    sellingPrice: 1250000,
    description: "รถใหม่ปี 2023 เลขไมล์น้อย สภาพสุดยอด มือเดียว",
    status: "AVAILABLE",
    condition: "ดีเยี่ยม",
    purchaseDate: new Date("2024-11-20"),
  },
  {
    brand: "Mazda",
    model: "CX-5 2.0 Crossover",
    year: 2021,
    color: "เทา",
    mileage: 52000,
    engineSize: 2.0,
    fuelType: "เบนซิน",
    transmission: "อัตโนมัติ",
    plateNumber: "มท-9012",
    vin: "JMZKF2WLA0123456",
    costPrice: 850000,
    sellingPrice: 999000,
    description: "SUV ขนาดกลาง นั่งสบาย เหมาะสำหรับครอบครัว",
    status: "AVAILABLE",
    condition: "ดี",
    purchaseDate: new Date("2024-09-05"),
  },
  {
    brand: "Toyota",
    model: "Fortuner 2.8V 4WD",
    year: 2022,
    color: "ขาว",
    mileage: 45000,
    engineSize: 2.8,
    fuelType: "ดีเซล",
    transmission: "อัตโนมัติ",
    plateNumber: "กก-3456",
    vin: "JTEBX9FJ50K123456",
    costPrice: 1550000,
    sellingPrice: 1790000,
    description: "7 ที่นั่ง วิ่งทุกสภาพถนน แอร์เย็นสบาย",
    status: "AVAILABLE",
    condition: "ดี",
    purchaseDate: new Date("2024-08-20"),
  },
  {
    brand: "Honda",
    model: "HR-V RS",
    year: 2023,
    color: "น้ำเงิน",
    mileage: 12000,
    engineSize: 1.5,
    fuelType: "เบนซิน",
    transmission: "CVT",
    plateNumber: "นจ-7890",
    vin: "MRHXR1651NP234567",
    costPrice: 920000,
    sellingPrice: 1090000,
    description: "Compact SUV ประหยัดน้ำมัน เหมาะกับการใช้งานในเมือง",
    status: "AVAILABLE",
    condition: "ดีเยี่ยม",
    purchaseDate: new Date("2024-12-01"),
  },
  {
    brand: "Nissan",
    model: "Navara 2.3 Pro-4X",
    year: 2021,
    color: "ส้ม",
    mileage: 68000,
    engineSize: 2.3,
    fuelType: "ดีเซล",
    transmission: "อัตโนมัติ",
    plateNumber: "บน-2345",
    vin: "MNTCBUL21M012345",
    costPrice: 780000,
    sellingPrice: 920000,
    description: "กระบะ 4 ปี 4 ล้อ บรรทุกได้มาก",
    status: "AVAILABLE",
    condition: "ดี",
    purchaseDate: new Date("2024-07-15"),
  },
  {
    brand: "Mitsubishi",
    model: "Pajero Sport 3.2V",
    year: 2020,
    color: "ดำ",
    mileage: 85000,
    engineSize: 3.2,
    fuelType: "ดีเซล",
    transmission: "อัตโนมัติ",
    plateNumber: "จบ-6789",
    vin: "MMBJNKJL5LH123456",
    costPrice: 950000,
    sellingPrice: 1150000,
    description: "7 ที่นั่ง ขุมพลังแรง เหมาะกับการวิ่งทางไกล",
    status: "AVAILABLE",
    condition: "ดี",
    purchaseDate: new Date("2024-06-10"),
  },
  {
    brand: "Toyota",
    model: "Yaris Cross Hybrid",
    year: 2024,
    color: "เขียว",
    mileage: 5000,
    engineSize: 1.5,
    fuelType: "ไฮบริด",
    transmission: "CVT",
    plateNumber: "กส-1111",
    vin: "MR0JX3DZ4N012345",
    costPrice: 950000,
    sellingPrice: 1099000,
    description: "รถใหม่ปี 2024 Hybrid ประหยัดน้ำมันมาก",
    status: "AVAILABLE",
    condition: "ดีเยี่ยม",
    purchaseDate: new Date("2024-12-20"),
  },
  {
    brand: "Isuzu",
    model: "D-Max 3.0RZ4E",
    year: 2022,
    color: "ขาว",
    mileage: 42000,
    engineSize: 3.0,
    fuelType: "ดีเซล",
    transmission: "อัตโนมัติ",
    plateNumber: "อส-4567",
    vin: "MPATFS95JNB123456",
    costPrice: 820000,
    sellingPrice: 980000,
    description: "กระบะคุ้มค่า เครื่องยนต์แข็งแรง ประหยัดน้ำมัน",
    status: "AVAILABLE",
    condition: "ดี",
    purchaseDate: new Date("2024-05-25"),
  },
  {
    brand: "Ford",
    model: "Ranger Wildtrak 2.0",
    year: 2023,
    color: "น้ำตาล",
    mileage: 25000,
    engineSize: 2.0,
    fuelType: "ดีเซล",
    transmission: "อัตโนมัติ",
    plateNumber: "ฟว-8901",
    vin: "MPATFS96JNC234567",
    costPrice: 1250000,
    sellingPrice: 1480000,
    description: "กระบะหรู Wildtrak ตกแต่งสวยงาม เทคโนโลยีครบครัน",
    status: "AVAILABLE",
    condition: "ดีเยี่ยม",
    purchaseDate: new Date("2024-11-05"),
  },
]

async function main() {
  console.log("🌱 Starting seed...")

  // Clear existing data
  await prisma.sale.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.car.deleteMany()
  await prisma.customer.deleteMany()
  await prisma.expense.deleteMany()

  console.log("🗑️ Cleared existing data")

  // Create sample cars
  for (const car of sampleCars) {
    await prisma.car.create({ data: car })
  }

  console.log(`✅ Created ${sampleCars.length} sample cars`)

  // Create sample customer
  await prisma.customer.create({
    data: {
      name: "สมชาย ใจดี",
      phone: "081-234-5678",
      email: "somchai@email.com",
      address: "123 ถ.สุขุมวิท กรุงเทพฯ 10110",
      note: "ลูกค้าประจำ สนใจรถ SUV",
    },
  })

  console.log("✅ Created sample customer")
  console.log("🎉 Seed completed!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })