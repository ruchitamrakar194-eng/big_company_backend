const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      costPrice: true,
      retailerId: true,
      wholesalerId: true
    }
  });

  console.log(`Total Products in DB: ${products.length}`);
  const zeroCostProducts = products.filter(p => !p.costPrice || p.costPrice === 0);
  console.log(`Products with zero/null costPrice: ${zeroCostProducts.length}`);
  
  if (zeroCostProducts.length > 0) {
    console.log('Sample zero/null cost products:');
    console.log(zeroCostProducts.slice(0, 10));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
