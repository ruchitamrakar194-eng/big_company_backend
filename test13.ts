const { PrismaClient } = require('@prisma/client');
const { calculateWholesalePrice, calculateRetailPrice } = require('./src/utils/pricingUtils');
const prisma = new PrismaClient();

async function createTest13() {
  const wholesalerId = 5;
  const retailerId = 24;
  
  const config = await prisma.systemConfig.findFirst();
  const wholesalerMarkupPct = config?.wholesalerMarkup || 21;
  const retailerMarkupPct = config?.retailerMarkup || 20;
  const exciseDutyRatePct = config?.exciseDutyRate || 10;
  
  // Wholesaler pipeline
  const wPricing = calculateWholesalePrice(1000, wholesalerMarkupPct, 'D', exciseDutyRatePct);
  
  const wProduct = await prisma.product.create({
    data: {
      name: 'test13',
      sku: 'BR-13',
      category: 'Electronics',
      price: wPricing.finalInvoicePrice,
      stock: 100,
      wholesalerId: wholesalerId,
      unit: 'units',
      taxType: 'D',
      supplierCost: 1000,
      barcode: '99013131313'
    }
  });

  // Retailer pipeline
  const supplierCost = wProduct.supplierCost || 0;
  const cleanBaseCost = supplierCost * (1 + wholesalerMarkupPct / 100);
  const rPricing = calculateRetailPrice(cleanBaseCost, retailerMarkupPct, 'D', exciseDutyRatePct);
  
  await prisma.product.create({
    data: {
      name: wProduct.name,
      sku: wProduct.sku,
      category: wProduct.category,
      price: rPricing.finalConsumerShelfPrice,
      costPrice: cleanBaseCost,
      stock: 5,
      retailerId: retailerId,
      unit: wProduct.unit,
      taxType: 'D',
      supplierCost: wProduct.price,
      barcode: wProduct.barcode
    }
  });
  
  console.log('Successfully created test13 for Wholesaler and inherited into Retailer!');
  console.log('Wholesaler Price:', wPricing.finalInvoicePrice);
  console.log('Retailer Inherited Cost Price:', cleanBaseCost);
  console.log('Retailer Final Shelf Price:', rPricing.finalConsumerShelfPrice);
}

createTest13().catch(console.error).finally(() => prisma.$disconnect());
