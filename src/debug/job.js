const { rabbitmq, publishToRabbitMqQueueSingle } = require('../config')
const { EXCHANGES } = require('../utils')
const mail = require('../utils/mail')

const debugJob = async (rows, url, APP_INFO) => {
  try {
    const { status } = await rabbitmq()
    const email = rows?.email
    const subject = 'Reset Password Seller'
    const template = 'mail/client_reset_password'
    const data = {
      ...rows, url, ...APP_INFO
    }
    console.log(status);
    if (status === 'connected') {
      const payload = {
        data,
        email,
        subject,
        template
      }
      return await publishToRabbitMqQueueSingle(EXCHANGES.EMAIL, EXCHANGES.EMAIL, payload)
    }
    return await mail.init()
      .to(email)
      .subject(subject)
      .html(template, data)
      .send();
  } catch (error) {
    return error
  }
}

debugJob({ email: 'hello@hello.com', first_name: 'indra' }, 'testing', { a: 'a' })
