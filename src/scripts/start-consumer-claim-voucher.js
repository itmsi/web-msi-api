require('dotenv').config();
const { startConsumer } = require('../modules/public_member_voucher/consumer');

const start = async () => {
  try {
    console.log('Starting Claim Voucher Consumer...');
    await startConsumer();
  } catch (error) {
    console.error('Failed to start consumer:', error);
    process.exit(1);
  }
};

start();
