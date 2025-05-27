const { connectRabbitMQ } = require('../../config/rabbitmq');
const { sendEmail } = require('../../config/email');

const VOUCHER_QUEUE = 'voucher_queue';
const VOUCHER_EXCHANGE = 'voucher_exchange';

const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const processApproveVoucherMessage = async (data) => {
  try {
    // Validate email before processing
    if (!isValidEmail(data.email)) {
      console.log('Invalid email address, skipping message processing');
      return false;
    }

    // Get admin email from database
    const adminEmail = data.email;
    if (!adminEmail) {
      console.log('No admin email found in database, skipping message processing');
      return false;
    }

    // Send confirmation email to user
    await sendEmail({
      to: data.email,
      subject: '🎉 Congratulations! You\'ve Won a Voucher!',
      html: `
        <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Congratulations!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          line-height: 1.6;
          background-color: #f5f7fa;
          padding: 20px;
          margin: 0;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          max-width: 150px;
          margin-bottom: 20px;
        }
        h2 {
          color: #1a56db;
          font-size: 28px;
          margin: 0;
          font-weight: 600;
        }
        .subtitle {
          color: #666666;
          font-size: 16px;
          margin-top: 10px;
        }
        .qr-container {
          background: linear-gradient(145deg, #f8f9fa, #ffffff);
          border-radius: 12px;
          padding: 25px;
          margin: 30px 0;
          text-align: center;
          border: 1px solid #e9ecef;
          box-shadow: 0 2px 10px rgba(0,0,0,0.03);
        }
        .qr-code {
          display: inline-block;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .qr-code img {
          display: block;
          margin: 0 auto;
        }
        .voucher-code {
          text-align: center;
          font-size: 18px;
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border: 2px dashed #1a56db;
          color: #1a56db;
          font-weight: 500;
        }
        .instructions {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 25px 0;
        }
        .instructions h3 {
          color: #1a56db;
          margin-top: 0;
          font-size: 18px;
        }
        .instructions ul {
          margin: 0;
          padding-left: 20px;
        }
        .instructions li {
          margin-bottom: 10px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #666666;
          text-align: center;
        }
        .highlight {
          color: #1a56db;
          font-weight: 500;
        }
        .button {
          display: inline-block;
          background-color: #1a56db;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: 500;
        }
        .button:hover {
          background-color: #1e429f;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Congratulations!</h2>
          <p class="subtitle">You've been selected as a winner!</p>
        </div>

        <p>Dear <span class="highlight">${data.first_name} ${data.last_name}</span>,</p>

        <p>We are thrilled to inform you that you have been selected as one of the winners of our exclusive voucher giveaway! Your prize is ready to be claimed.</p>

        <div class="customer-info" style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Customer Information:</strong></p>
          <p style="margin: 5px 0;"><strong>Customer Number:</strong> ${data.customer_no || 'N/A'}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
        </div>

        <div class="qr-container">
          <div class="voucher-code">
            <strong>Voucher Code:</strong> ${data.voucher_code}
          </div>
        </div>

        <div class="instructions">
          <h3>How to Redeem Your Voucher</h3>
          <ul>
            <li>📧 <strong>Show Email:</strong> you can show this email with the voucher code</li>
            <li>⏰ <strong>Valid Until:</strong> Please use your voucher before the expiration date</li>
          </ul>
        </div>

        <p>If you have any questions or need assistance, our support team is here to help. Simply reply to this email or contact our customer service.</p>

        <div class="footer">
          <p>This is an automated message. Please do not reply directly to this email.</p>
          <p>For security reasons, please do not share your voucher code with others.</p>
          <p>© ${new Date().getFullYear()} Motor Sights International. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>`
    });

    return true;
  } catch (error) {
    console.error('Error processing voucher message:', error);
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
    await channel.assertExchange(VOUCHER_EXCHANGE, 'fanout', { durable: true });
    await channel.assertQueue(VOUCHER_QUEUE, { durable: true });
    await channel.bindQueue(VOUCHER_QUEUE, VOUCHER_EXCHANGE, '');

    console.log('Voucher Consumer started...');

    // Set prefetch to 1 to ensure one message at a time
    await channel.prefetch(1);

    // Consume messages
    channel.consume(VOUCHER_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          console.log('Processing voucher message:', content);

          const result = await processApproveVoucherMessage(content.data);

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
  VOUCHER_QUEUE,
  VOUCHER_EXCHANGE
};
