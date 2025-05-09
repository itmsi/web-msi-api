const { connectRabbitMQ } = require('../../config/rabbitmq');
const { sendEmail } = require('../../config/email');
const { getMemberEmailTemplate } = require('../../templates/member-email');

const MEMBER_QUEUE = 'member_queue';
const MEMBER_EXCHANGE = 'member_exchange';

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getLatestAdminEmail = () => process.env.ADMIN_EMAIL;

const processMemberMessage = async (data) => {
  try {
    // Validate email before processing
    if (!isValidEmail(data.member_email)) {
      console.log('Invalid email address, skipping message processing');
      return false;
    }

    // Get admin email from database
    const adminEmail = await getLatestAdminEmail();
    if (!adminEmail) {
      console.log('No admin email found in database, skipping message processing');
      return false;
    }

    // Send email to admin
    await sendEmail({
      to: adminEmail,
      subject: `New Member Registration: ${data.member_name}`,
      html: getMemberEmailTemplate(data)
    });

    // Send welcome email to member
    await sendEmail({
      to: data.member_email,
      subject: 'Welcome to Our Platform',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Welcome to Our Platform!</h2>
            <p>Dear ${data.member_name},</p>
            <p>Thank you for joining our platform. We're excited to have you as a member!</p>
            <p>Best regards,<br>Your Team</p>
          </div>
        </body>
        </html>
      `
    });

    return true;
  } catch (error) {
    console.error('Error processing member message:', error);
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
    await channel.assertExchange(MEMBER_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(MEMBER_QUEUE, { durable: true });
    await channel.bindQueue(MEMBER_QUEUE, MEMBER_EXCHANGE, '');

    console.log('Member Consumer started...');

    // Set prefetch to 1 to ensure one message at a time
    await channel.prefetch(1);

    // Consume messages
    channel.consume(MEMBER_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Processing member message:', content);

          const result = await processMemberMessage(content.data);

          if (result) {
            // Acknowledge the message after successful processing
            channel.ack(msg);
            console.log('Message processed and acknowledged successfully');
          } else {
            // Reject the message and don't requeue if email is invalid
            channel.nack(msg, false, false);
            console.log('Message rejected due to invalid email or no admin email found');
          }
        } catch (error) {
          console.error('Error processing message:', error);
          // Reject the message and don't requeue
          channel.nack(msg, false, false);
          console.log('Message rejected and not requeued due to error');
        }
      }
    });

    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      process.exit(1); // Exit on connection error
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
      process.exit(1); // Exit on connection close
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
  MEMBER_QUEUE,
  MEMBER_EXCHANGE
};
