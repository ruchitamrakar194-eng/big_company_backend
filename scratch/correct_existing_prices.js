const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Fetching all retailer products...');
  const retailerProducts = await prisma.product.findMany({
    where: {
      retailerId: { not: null }
    }
  });

  console.log(`Found ${retailerProducts.length} retailer products. Checking tax types...`);

  for (const product of retailerProducts) {
    // Find the corresponding wholesaler product (usually has the same name or SKU, and retailerId is null)
    const wholesalerProduct = await prisma.product.findFirst({
      where: {
        name: product.name,
        retailerId: null,
        wholesalerId: { not: null }
      }
    });

    if (wholesalerProduct) {
      const correctTaxType = wholesalerProduct.taxType || 'B';
      
      // If the retailer's product has a different tax type than the wholesaler's
      if (product.taxType !== correctTaxType) {
        console.log(`Correcting ${product.name}:`);
        console.log(`  - Tax Type: ${product.taxType} -> ${correctTaxType}`);
        
        // Recalculate the selling price based on the correct tax type
        const config = await prisma.systemConfig.findFirst();
        const retailerMarkup = config?.retailerMarkup || 20;
        
        // Use clean costPrice if available, otherwise reverse it first
        let cleanCost = product.costPrice || product.price;
        if (!product.costPrice) {
          const { reverseVATCalculation } = require('../src/utils/pricingReversalUtils');
          const reversed = reverseVATCalculation(product.price, product.taxType);
          cleanCost = reversed.cleanBaseCost;
        }

        const markupPrice = cleanCost * (1 + retailerMarkup / 100);
        const vatMultiplier = correctTaxType === 'B' ? 1.18 : 1;
        const newPrice = wholesalerProduct.retailerPrice || Math.ceil(markupPrice * vatMultiplier);

        console.log(`  - Cost Price: ${cleanCost} RWF`);
        console.log(`  - Selling Price: ${product.price} -> ${newPrice} RWF`);

        await prisma.product.update({
          where: { id: product.id },
          data: {
            taxType: correctTaxType,
            price: newPrice,
            costPrice: cleanCost
          }
        });
      }
    }
  }
  console.log('Correction complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
