const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { in: ['Rice', 'Gashumba', 'Cigarettes ', 'Diaper '] } }
  });
  console.log(JSON.stringify(products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    costPrice: p.costPrice,
    retailerPrice: p.retailerPrice,
    taxType: p.taxType,
    retailerId: p.retailerId,
    wholesalerId: p.wholesalerId
  })), null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
