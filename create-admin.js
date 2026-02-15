const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const user = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@cardealer.com',
      password: hashedPassword,
      role: 'admin'
    }
  });
  
  console.log('Created admin user:', user.email);
}

main().finally(() => prisma.$disconnect());