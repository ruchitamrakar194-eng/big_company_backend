const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cards = await prisma.nfcCard.findMany({
    take: 5,
    include: {
      consumer: {
        include: {
          user: true
        }
      }
    }
  });
  console.log("NFC CARDS:");
  console.log(JSON.stringify(cards, null, 2));

  const wallets = await prisma.wallet.findMany({
    take: 10,
    include: {
      consumer: {
        include: {
          user: true
        }
      }
    }
  });
  console.log("WALLETS:");
  console.log(JSON.stringify(wallets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
