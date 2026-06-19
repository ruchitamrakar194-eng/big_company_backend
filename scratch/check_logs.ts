import prisma from '../src/utils/prisma';

async function main() {
  try {
    const logs = await prisma.systemEmailLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20
    });
    console.log('--- RECENT LOGS ---');
    for (const log of logs) {
      console.log(`[${log.timestamp.toISOString()}] ID: ${log.id} | Channel: ${log.channel} | Type: ${log.templateType} | To: ${log.recipientEmail || log.recipientPhone} | Status: ${log.status} | Err: ${log.errorMessage || 'None'}`);
    }
  } catch (err: any) {
    console.error('Error fetching logs:', err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
