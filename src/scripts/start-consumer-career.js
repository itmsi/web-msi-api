require('dotenv').config();
const { startConsumer } = require('../modules/career_apply/consumer');

const start = async () => {
  try {
    console.log('Starting Career Apply Consumer...');
    await startConsumer();
  } catch (error) {
    console.error('Failed to start consumer:', error);
    process.exit(1);
  }
};

start();
