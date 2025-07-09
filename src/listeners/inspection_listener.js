const { connectRabbitMQ } = require('../config/rabbitmq')
const {
  EXCHANGES, logger, todayFormat
} = require('../utils')
const {
  inspectionJob,
} = require('../job')

const methodExecution = async (payload, channel, msg) => {
  await inspectionJob(payload, channel, msg)
}

const initInspectionTrx = async () => {
  const queueName = EXCHANGES.INSPECTION
  const { channel, connection } = await connectRabbitMQ()
  process.once('SIGINT', async () => {
    console.info('got sigint, closing connection')
    await channel.close()
    await connection.close()
    process.exit(0)
  })

  try {
    await channel.assertQueue(queueName, { durable: true })
    await channel.prefetch(10);
    await channel.consume(
      queueName,
      async (msg) => {
        console.info(`Processing data ${msg?.fields?.consumerTag}`)
        const parseData = JSON.parse(msg.content.toString())
        try {
          await methodExecution(parseData)
          logger('inspection.txt', 'inspection').write(`Success consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(parseData)}}\n`)
        } catch (error) {
          console.info('error job', error)
          logger('inspection.txt', 'inspection').write(`Failed consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(error)}}\n`)
        }
        channel.ack(msg);
      },
      {
        noAck: false,
        consumerTag: `consumer_${queueName}`
      }
    )
  } catch (error) {
    console.info(error)
    logger('inspection.txt', 'inspection').write(`Error consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${error} - ${error.toString()}\n`)
  }
}

module.exports = {
  initInspectionTrx
}
