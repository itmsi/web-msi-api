const database = require('./database')
const aws = require('./aws')
const rabbitmq = require('./rabbitmq')
const recaptcha = require('./recaptcha')

module.exports = {
  ...database,
  ...aws,
  ...rabbitmq,
  ...recaptcha
}
