const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({ where: { name: 'test12' } });
  console.log(products);
}

run().finally(() => prisma.$disconnect());
