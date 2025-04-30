const { connectRabbitMQ } = require('../../config/rabbitmq');
const { lang } = require('../../lang');

const CONTACT_US_QUEUE = 'contact_us_queue';
const CONTACT_US_EXCHANGE = 'contact_us_exchange';

const startConsumer = async () => {
  try {
    const { connection, channel } = await connectRabbitMQ();

    // Assert exchange and queue
    await channel.assertExchange(CONTACT_US_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(CONTACT_US_QUEUE, { durable: true });
    await channel.bindQueue(CONTACT_US_QUEUE, CONTACT_US_EXCHANGE, '');

    console.log('Contact Us Consumer started...');

    // Consume messages
    channel.consume(CONTACT_US_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Received contact us message:', content);

          // Process the message here
          // You can add your business logic here
          // For example, sending email notifications, etc.

          // Acknowledge the message
          channel.ack(msg);
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and requeue
          channel.nack(msg, false, true);
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      // Attempt to reconnect
      setTimeout(startConsumer, 5000);
    });
  } catch (error) {
    console.error('Error starting consumer:', error);
    // Attempt to reconnect
    setTimeout(startConsumer, 5000);
  }
};

module.exports = {
  startConsumer,
  CONTACT_US_QUEUE,
  CONTACT_US_EXCHANGE
};
