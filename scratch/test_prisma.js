const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URI,
    },
  },
});

async function main() {
  console.log('--- DB Connectivity Test ---');
  console.log('DATABASE_URI is:', process.env.DATABASE_URI ? 'Defined' : 'NOT Defined');
  console.log('Connecting to Prisma...');
  await prisma.$connect();
  console.log('✅ Connected successfully!');
  
  console.log('Querying first user...');
  const user = await prisma.user.findFirst();
  console.log('User found:', user);
  
  await prisma.$disconnect();
  console.log('Disconnected.');
}

main().catch(err => {
  console.error('❌ Error occurred:', err);
});
