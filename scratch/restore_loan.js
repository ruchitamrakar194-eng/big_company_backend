const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Loan #6 was the one we cleared — restore amount to 50000, keep remainingAmount = 0 (paid)
  const loan = await prisma.retailerLoan.findUnique({ where: { id: 6 } });
  console.log('Current state:', loan);

  await prisma.retailerLoan.update({
    where: { id: 6 },
    data: {
      amount: 50000,       // restore credit line to original 50,000
      remainingAmount: 0,  // outstanding stays 0 (repaid)
      status: 'paid'       // status stays paid
    }
  });

  console.log('✅ Loan #6 restored: amount=50000, remainingAmount=0, status=paid');
  console.log('→ Add Stock will show: Wholesaler Credit (50,000 RWF)');
  console.log('→ Wallet & Credit will show: Outstanding Loan Balance = 0 RWF');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
