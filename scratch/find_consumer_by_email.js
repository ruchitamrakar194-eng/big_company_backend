const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: 'fresh.lynx9893@tembox.xyz' },
    include: {
      consumerProfile: {
        include: {
          wallets: true,
          gasMeters: true
        }
      }
    }
  });

  if (!user) {
    console.log("No user found with email fresh.lynx9893@tembox.xyz");
    return;
  }

  console.log("User:", {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone
  });

  if (user.consumerProfile) {
    console.log("Consumer Profile ID:", user.consumerProfile.id);
    console.log("Wallets:", user.consumerProfile.wallets);
    console.log("Gas Meters:", user.consumerProfile.gasMeters);
  } else {
    console.log("No consumer profile found for user!");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
