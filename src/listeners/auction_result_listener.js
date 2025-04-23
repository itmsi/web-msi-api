const { rabbitmq } = require('../config')
const {
  ENUM, EXCHANGES, logger, todayFormat, ACTION_TRX
} = require('../utils')
const {
  notSoldJob, soldJob, auctionLog, auctionLogReport
} = require('../job')

const methodExecution = async (payload, channel, msg) => {
  if (payload?.is_sold === ENUM.N) {
    await notSoldJob(payload, channel, msg)
  } else if (payload?.is_sold === ENUM.Y) {
    await soldJob(payload, channel, msg)
  } else if (payload?.service_type === ACTION_TRX.LOG) {
    await auctionLog(payload, channel, msg)
  } else if (payload?.service_type === ACTION_TRX.LOG_REPORT) {
    await auctionLogReport(payload, channel, msg)
  }
}

const initAuctionTrx = async () => {
  const queueName = EXCHANGES.AUCTION
  const { channel, connection } = await rabbitmq()
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
          await methodExecution(parseData, channel, msg)
          logger('auction-api.txt', 'auction').write(`Success consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(parseData)}}\n`)
        } catch (error) {
          console.info('error job', error)
          logger('auction-api.txt', 'auction').write(`Failed consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(error)}}\n`)
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
    logger('auction-api.txt', 'auction').write(`Error consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${error} - ${error.toString()}\n`)
  }
}

module.exports = {
  initAuctionTrx
}
