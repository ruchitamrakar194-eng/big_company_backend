const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all active retailer loans
  const activeLoans = await prisma.retailerLoan.findMany({
    where: { status: 'active' }
  });

  console.log(`Found ${activeLoans.length} active loan(s):`);
  activeLoans.forEach(l => {
    console.log(`  Loan #${l.id} | retailerId: ${l.retailerId} | amount: ${l.amount} | remainingAmount: ${l.remainingAmount}`);
  });

  if (activeLoans.length === 0) {
    console.log('No active loans to clear.');
    return;
  }

  // Clear remaining amount → set to 0 and mark as paid
  for (const loan of activeLoans) {
    await prisma.retailerLoan.update({
      where: { id: loan.id },
      data: {
        remainingAmount: 0,
        status: 'paid'
      }
    });
    console.log(`✅ Loan #${loan.id} cleared — remainingAmount set to 0, status = paid`);
  }

  console.log('\nDone. Outstanding Loan Balance should now show 0 RWF.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
