const { rabbitmq } = require('../config')
const {
  EXCHANGES, logger, todayFormat,
  QUEUE,
  generateUpload,
  MODEL_PROPERTIES,
} = require('../utils')

const repo = require('../repository/postgres/core_postgres')

const methodExecution = async (rows) => {
  const data = {}
  rows.payload.files.map((r) => {
    r.buffer = Buffer.from(r.buffer, 'utf8');

    return r
  })
  const { pathForDatabase, fileNames } = await generateUpload(rows.payload, 0, 'images/customers', 'customers', '', { isPrivate: true, isContentType: true, compressImage: true })
  data.ktp_photo = pathForDatabase ? `${pathForDatabase}` : ''
  const pathForDatabaseWatermark = (await generateUpload(rows.payload, 0, 'images/customers', 'customers', '', {
    isWatermark: true, isPrivate: true, isContentType: true, fileNames, compressImage: true
  })).pathForDatabase
  data.ktp_photo_watermark = pathForDatabaseWatermark ? `${pathForDatabaseWatermark}` : ''
  await repo.updated(MODEL_PROPERTIES.TABLES.CUSTOMER, { customer_id: rows?.id }, data, ['customer_id'])
}

const initKtpProcessing = async () => {
  const { channel, connection } = await rabbitmq()
  process.once('SIGINT', async () => {
    console.info('got sigint, closing connection')
    await channel.close()
    await connection.close()
    process.exit(0)
  })

  try {
    await channel.assertExchange(EXCHANGES.IMAGE_KTP, 'fanout', { durable: true });
    await channel.assertQueue(QUEUE.IMAGE_KTP, { durable: true })
    await channel.prefetch(10);
    await channel.consume(
      QUEUE.IMAGE_KTP,
      async (msg) => {
        console.info(`Processing data ${msg?.fields?.consumerTag}`)
        const parseData = JSON.parse(msg.content.toString())
        try {
          await methodExecution(parseData)
          logger('ktp-processing.txt', 'image-ktp').write(`Success consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(parseData.id)}\n`)
        } catch (error) {
          console.info('error job', error)
          logger('ktp-processing.txt', 'image-ktp').write(`Failed consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${JSON.stringify(error)}\n`)
        }
        channel.ack(msg);
      },
      {
        noAck: false,
        consumerTag: `consumer_${QUEUE.IMAGE_KTP}`
      }
    )
  } catch (error) {
    console.info(error)
    logger('ktp-processing.txt', 'image-ktp').write(`Error consume-${todayFormat('YYYY-MM-DD hh:mm:ss')}: ${error} - ${error.toString()}\n`)
  }
}

module.exports = {
  initKtpProcessing
}
