const amqplib = require('amqplib')
const { lang } = require('../lang')

const amqpUrl = process.env.RABBITMQ_URL

const rabbitmq = async () => {
  try {
    const connection = await amqplib.connect(amqpUrl, 'heartbeat=60')
    const channel = await connection.createChannel()
    return {
      status: 'connected',
      connection,
      channel,
      exception: null
    }
  } catch (error) {
    console.info('error in connection rabbitmq', error)
    return {
      status: 'disconected',
      exception: error
    }
  }
}

const publishToRabbitMqQueueSingle = async (exchangeName, queueName, data) => {
  const config = await rabbitmq()

  try {
    if (config?.status === 'connected') {
      await config?.channel.assertExchange(exchangeName, 'fanout', { durable: true })
      await config?.channel.assertQueue(queueName, { durable: true })
      await config?.channel.bindQueue(queueName, exchangeName)

      config?.channel.publish(exchangeName, '', Buffer.from(JSON.stringify(data)))
      console.info(lang.__('rabbitmq.publish'))
    } else {
      console.info(`failed to publish ${exchangeName} - ${queueName}`, config?.exception)
    }
  } catch (e) {
    console.error(lang.__('rabbitmq.error'), e)
  } finally {
    console.info(lang.__('rabbitmq.closing'))
    await config?.channel.close()
    await config?.connection.close()
    console.info(lang.__('rabbitmq.closed'))
  }
}

module.exports = {
  rabbitmq,
  publishToRabbitMqQueueSingle
}
