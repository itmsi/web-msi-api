const { connectRabbitMQ } = require('../../config/rabbitmq');
const { sendEmail } = require('../../config/email');
const { getContactUsEmailTemplate } = require('../../templates/contact-us-email');
const { pgCore } = require('../../config/database');

const CONTACT_US_QUEUE = 'contact_us_queue';
const CONTACT_US_EXCHANGE = 'contact_us_exchange';

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getLatestAdminEmail = async () => {
  try {
    const [admin] = await pgCore('mst_contact_us_admin')
      .select('contact_us_admin_email')
      .where('deleted_at', null)
      .orderBy('created_at', 'desc')
      .limit(1);

    return admin?.contact_us_admin_email;
  } catch (error) {
    console.error('Error fetching admin email:', error);
    return null;
  }
};

const processContactUsMessage = async (data) => {
  try {
    // Validate email before processing
    if (!isValidEmail(data.contact_us_user_email)) {
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
      subject: `New Contact Us Message: ${data.contact_us_user_subject}`,
      html: getContactUsEmailTemplate(data)
    });

    // Send confirmation email to user
    await sendEmail({
      to: data.contact_us_user_email,
      subject: 'Thank you for contacting us',
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
            <h2>Thank you for contacting us!</h2>
            <p>Dear ${data.contact_us_user_name_first} ${data.contact_us_user_name_last},</p>
            <p>We have received your message and will get back to you as soon as possible.</p>
            <p>Best regards,<br>Your Team</p>
          </div>
        </body>
        </html>
      `
    });

    return true;
  } catch (error) {
    console.error('Error processing contact us message:', error);
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
    await channel.assertExchange(CONTACT_US_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(CONTACT_US_QUEUE, { durable: true });
    await channel.bindQueue(CONTACT_US_QUEUE, CONTACT_US_EXCHANGE, '');

    console.log('Contact Us Consumer started...');

    // Set prefetch to 1 to ensure one message at a time
    await channel.prefetch(1);

    // Consume messages
    channel.consume(CONTACT_US_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Processing contact us message:', content);

          const result = await processContactUsMessage(content.data);

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
  CONTACT_US_QUEUE,
  CONTACT_US_EXCHANGE
};
