const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const retailerId = 24;
  const retailer = await prisma.retailerProfile.findUnique({
    where: { id: retailerId },
    include: {
      credit: true,
      retailerLoans: true
    }
  });

  console.log('Retailer:', JSON.stringify(retailer, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
