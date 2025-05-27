const { connectRabbitMQ } = require('../../config/rabbitmq');
const { pgCore } = require('../../config/database');
const { lang } = require('../../lang');

const MEMBER_VOUCHER_QUEUE = 'claim_member_voucher_queue';
const MEMBER_VOUCHER_EXCHANGE = 'claim_member_voucher_exchange';

const TABLE = 'member_vouchers';

const processMemberVoucherMessage = async (data) => {
  const transaction = await pgCore.transaction();

  try {
    if (!data || !data.member_id || !data.voucher_id) {
      throw new Error('Invalid message data: missing required fields');
    }

    // Insert member voucher into database using transaction
    const [result] = await transaction(TABLE)
      .insert({
        member_id: data.member_id,
        voucher_id: data.voucher_id,
        expired_date: data.expired_date,
        status_approve: 0,
        description: data.description,
        created_at: new Date(),
        created_by: data.created_by,
        updated_at: new Date(),
        updated_by: data.updated_by
      })
      .returning(['member_voucher_id', 'member_id', 'voucher_id', 'status_approve']);

    if (!result) {
      throw new Error(lang.__('created.failed'));
    }

    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    console.error('Error processing member voucher message:', error);
    throw error;
  }
};

const startConsumer = async () => {
  let connection;
  let channel;

  try {
    // Connect to RabbitMQ
    const rabbitMQ = await connectRabbitMQ();
    connection = rabbitMQ.connection;
    channel = rabbitMQ.channel;

    // Assert exchange and queue
    await channel.assertExchange(MEMBER_VOUCHER_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(MEMBER_VOUCHER_QUEUE, { durable: true });
    await channel.bindQueue(MEMBER_VOUCHER_QUEUE, MEMBER_VOUCHER_EXCHANGE, '');

    console.log('Member Voucher Consumer started...');

    // Set prefetch to 1 to ensure one message at a time
    await channel.prefetch(1);

    // Consume messages
    channel.consume(MEMBER_VOUCHER_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Processing member voucher message:', content);

          if (content.action?.type === 'CREATE' && content.action?.process === 'MEMBER_VOUCHER') {
            const result = await processMemberVoucherMessage(content.data);

            if (result) {
              // Acknowledge the message after successful processing
              channel.ack(msg);
              console.log('Member voucher created successfully:', result);
            } else {
              // Reject the message and don't requeue if processing failed
              channel.nack(msg, false, false);
              console.log('Member voucher creation failed');
            }
          } else {
            console.log('Invalid message action type or process');
            channel.nack(msg, false, false);
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and don't requeue
          channel.nack(msg, false, false);
          console.log('Message rejected and not requeued due to error:', error.message);
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      process.exit(1);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      process.exit(1);
    });
  } catch (error) {
    console.error('Error starting consumer:', error);
    if (channel) await channel.close();
    if (connection) await connection.close();
    process.exit(1);
  }
};

module.exports = {
  startConsumer,
  MEMBER_VOUCHER_QUEUE,
  MEMBER_VOUCHER_EXCHANGE
};
