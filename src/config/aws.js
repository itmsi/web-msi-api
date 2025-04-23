const AWS = require('aws-sdk')
require('dotenv').config();
// Initializing S3 Interface
const awsBucket = new AWS.S3({
  accessKeyId: process.env.AWS_BUCKET_KEY_ID,
  secretAccessKey: process.env.AWS_BUCKET_KEY,
  region: process.env.BUCKET_REGION
})

const awsBucketPrivate = new AWS.S3({
  accessKeyId: process.env.AWS_BUCKET_KEY_ID_PRIVATE,
  secretAccessKey: process.env.AWS_BUCKET_KEY_PRIVATE,
  region: process.env.BUCKET_REGION
})

const getSingedUrl = async (isPrivate, Key) => {
  let { Bucket, method } = ['', '']
  if (isPrivate) {
    Bucket = process.env.AWS_BUCKET_PRIVATE
    method = awsBucket
  } else {
    Bucket = process.env.AWS_BUCKET
    method = awsBucketPrivate
  }
  const params = { Bucket, Key }
  try {
    const url = await new Promise((resolve, reject) => {
      method.getSignedUrl('getObject', params, (err, row) => (err ? reject(err) : resolve(row)))
    })
    return url
  } catch (err) {
    console.log(err)
    return ''
  }
}

module.exports = {
  awsBucket,
  getSingedUrl,
  awsBucketPrivate,
}
