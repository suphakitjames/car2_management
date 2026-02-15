import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 12)
  
  const user = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {
      password: hashedPassword,
      role: "admin",
    },
    create: {
      name: "Admin",
      email: "admin@test.com",
      password: hashedPassword,
      role: "admin",
    },
  })

  console.log("Created user:", user)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())