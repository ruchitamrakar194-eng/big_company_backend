const { PrismaClient } = require('@prisma/client');
const { calculateWholesalePrice } = require('./src/utils/pricingUtils');
const prisma = new PrismaClient();

async function createTestProducts() {
  const wholesaler = await prisma.wholesalerProfile.findFirst();
  if (!wholesaler) return console.log('No wholesaler found');
  
  const config = await prisma.systemConfig.findFirst();
  const wholesalerMarkupPct = config?.wholesalerMarkup || 21;
  const exciseDutyRatePct = config?.exciseDutyRate || 10;
  
  // Test Case 1: 2500
  const result1 = calculateWholesalePrice(2500, wholesalerMarkupPct, 'B', exciseDutyRatePct);
  await prisma.product.create({
    data: {
      name: 'Bankers Rounding Test 1 (UP)',
      sku: 'BR-01',
      category: 'Grains',
      price: result1.finalInvoicePrice,
      stock: 10,
      wholesalerId: wholesaler.id,
      unit: 'units',
      taxType: 'B',
      supplierCost: 2500,
      barcode: '990480969501'
    }
  });

  // Test Case 2: 7500
  const result2 = calculateWholesalePrice(7500, wholesalerMarkupPct, 'B', exciseDutyRatePct);
  await prisma.product.create({
    data: {
      name: 'Bankers Rounding Test 2 (DOWN)',
      sku: 'BR-02',
      category: 'Oils',
      price: result2.finalInvoicePrice,
      stock: 10,
      wholesalerId: wholesaler.id,
      unit: 'units',
      taxType: 'B',
      supplierCost: 7500,
      barcode: '990480969502'
    }
  });
  console.log('Products created successfully! Prices:', result1.finalInvoicePrice, 'and', result2.finalInvoicePrice);
}

createTestProducts()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
