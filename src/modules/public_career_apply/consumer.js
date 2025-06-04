const { connectRabbitMQ } = require('../../config/rabbitmq');
const { sendEmail } = require('../../config/email');
const { getCareerApplyEmailTemplate } = require('../../templates/career-apply-email');

const CAREER_APPLY_QUEUE = 'career_apply_queue';
const CAREER_APPLY_EXCHANGE = 'career_apply_exchange';

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getAdminEmail = () => process.env.ADMIN_EMAIL;

const processCareerApplyMessage = async (data) => {
  try {
    // Validate email before processing
    if (!isValidEmail(data.career_apply_email)) {
      console.log('Invalid email address, skipping message processing');
      return false;
    }

    // Get admin email from environment variables
    const adminEmail = getAdminEmail();
    if (!adminEmail) {
      console.log('No admin email found in environment variables, skipping message processing');
      return false;
    }

    // Send email to admin
    await sendEmail({
      to: adminEmail,
      subject: `New Career Application: ${data.career_apply_position}`,
      html: getCareerApplyEmailTemplate(data)
    });

    // Send confirmation email to user
    await sendEmail({
      to: data.career_apply_email,
      subject: 'Thank you for your application',
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
            <h2>Thank you for your application!</h2>
            <p>Dear ${data.career_apply_name},</p>
            <p>We have received your application for the position of ${data.job_career_name}. Our team will review your application and get back to you soon.</p>
            <p>Best regards,<br>Your Team</p>
          </div>
        </body>
        </html>
      `
    });

    return true;
  } catch (error) {
    console.error('Error processing career apply message:', error);
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
    await channel.assertExchange(CAREER_APPLY_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(CAREER_APPLY_QUEUE, { durable: true });
    await channel.bindQueue(CAREER_APPLY_QUEUE, CAREER_APPLY_EXCHANGE, '');

    console.log('Career Apply Consumer started...');

    // Set prefetch to 1 to ensure one message at a time
    await channel.prefetch(1);

    // Consume messages
    channel.consume(CAREER_APPLY_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Processing career apply message:', content);

          const result = await processCareerApplyMessage(content.data);

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
  CAREER_APPLY_QUEUE,
  CAREER_APPLY_EXCHANGE
};
