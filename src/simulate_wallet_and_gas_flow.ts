import dotenv from 'dotenv';
dotenv.config();
import prisma from './utils/prisma';
import { emailQueue } from './queues/email.queue';

async function main() {
  const email = 'fresh.lynx9893@tembox.xyz';
  console.log(`🤖 Starting simulation flow for: ${email}`);

  // 1. Resolve User and Profile
  const user = await prisma.user.findFirst({
    where: { email },
    include: { consumerProfile: { include: { wallets: true, gasMeters: true } } }
  });

  if (!user || !user.consumerProfile) {
    console.error("❌ Consumer user not found!");
    process.exit(1);
  }

  const profile = user.consumerProfile;
  let wallet = profile.wallets.find(w => w.type === 'dashboard_wallet');
  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        consumerId: profile.id,
        type: 'dashboard_wallet',
        balance: 0,
        currency: 'RWF'
      }
    });
  }

  // --- PART 1: WALLET TOPUP (CUS-EMAIL-003) ---
  const topupAmount = 10000;
  const newBalance = wallet.balance + topupAmount;
  console.log(`💰 Simulating wallet top-up of ${topupAmount} RWF...`);

  // Update DB balance
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: newBalance }
  });

  // Create Transaction
  const topupTx = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: 'topup',
      amount: topupAmount,
      description: 'Simulated Wallet Topup via API Script',
      status: 'completed',
      reference: `TOPUP-SIM-${Date.now()}`
    }
  });

  // Enqueue CUS-EMAIL-003 Email Trigger
  await emailQueue.add('customer-wallet-topup-email', {
    to: user.email,
    templateType: 'customer-wallet-topup-email',
    data: {
      customer_name: profile.fullName || user.name || 'Customer',
      amount: topupAmount.toLocaleString(),
      new_balance: newBalance.toLocaleString(),
      transaction_id: topupTx.reference || 'N/A'
    },
    relatedEntity: { type: 'WALLET_TRANSACTION', id: topupTx.id.toString() }
  });
  console.log('✅ CUS-EMAIL-003 (Wallet Top-Up) Triggered!');

  // --- PART 2: GAS METER RECHARGE (CUS-EMAIL-004) ---
  // Ensure a meter exists
  let meter = profile.gasMeters[0];
  if (!meter) {
    console.log('🔧 Creating a mock gas meter for the customer...');
    meter = await prisma.gasMeter.create({
      data: {
        consumerProfileId: profile.id,
        meterNumber: `MTR-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
        aliasName: 'Kitchen Smart Meter',
        status: 'active',
        balance: 0
      }
    });
  }

  const rechargeAmount = 5000;
  const finalWalletBalance = newBalance - rechargeAmount;
  console.log(`🔥 Simulating Gas Meter Recharge of ${rechargeAmount} RWF for Meter ${meter.meterNumber}...`);

  // Deduct Wallet Balance
  await prisma.wallet.update({
    where: { id: wallet.id },
    data: { balance: finalWalletBalance }
  });

  // Create Gas Order & Topup
  const order = await prisma.customerOrder.create({
    data: {
      consumerId: profile.id,
      retailerId: profile.linkedRetailerId || 24, // Fallback to retailer 24
      totalAmount: rechargeAmount,
      status: 'completed',
      paymentMethod: 'wallet',
      metadata: `GAS-SIM-${Date.now()}`
    }
  });

  const token = Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join('-');

  const gasTopupObj = await prisma.gasTopup.create({
    data: {
      consumerId: profile.id,
      meterId: meter.id,
      orderId: order.id.toString(),
      amount: rechargeAmount,
      token: token,
      status: 'completed'
    }
  });

  // Enqueue CUS-EMAIL-004 Email Trigger
  await emailQueue.add('customer-gas-recharge-email', {
    to: user.email,
    templateType: 'customer-gas-recharge-email',
    data: {
      customer_name: profile.fullName || user.name || 'Valued Customer',
      meter_name: meter.aliasName || 'Meter',
      meter_id: meter.meterNumber,
      amount: rechargeAmount.toLocaleString(),
      token: token,
      transaction_id: order.id.toString()
    },
    relatedEntity: { type: 'GAS_ORDER', id: order.id.toString() }
  });
  console.log('✅ CUS-EMAIL-004 (Gas Meter Recharge) Triggered!');

  await prisma.$disconnect();
  console.log('🎉 Simulation Completed successfully!');
  process.exit(0);
}

main().catch(console.error);
