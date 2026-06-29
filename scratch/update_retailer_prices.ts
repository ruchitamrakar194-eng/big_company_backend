import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Fetching all retailer products...');
  const products = await prisma.product.findMany({
    where: {
      retailerId: { not: null }
    }
  });

  console.log(`📦 Found ${products.length} retailer products. Recalculating prices...`);
  
  let updatedCount = 0;
  for (const product of products) {
    if (product.costPrice) {
      const taxType = (product as any).taxType || 'B';
      const markupPrice = product.costPrice * 1.2;
      const vatMultiplier = taxType === 'B' ? 1.18 : 1;
      const calculatedPrice = Math.ceil(markupPrice * vatMultiplier);
      
      if (product.price !== calculatedPrice) {
        console.log(`   Updating [${product.name}]: Old Price = ${product.price} RWF -> New Price = ${calculatedPrice} RWF`);
        await prisma.product.update({
          where: { id: product.id },
          data: { price: calculatedPrice }
        });
        updatedCount++;
      }
    }
  }

  console.log(`✅ Completed. Updated ${updatedCount} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
