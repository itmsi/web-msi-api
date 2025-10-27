const { lang } = require('../lang')

const verifyToken = async (req, res, next) => {
  if (req?.headers?.authorization) {
    next()
  } else {
    res.status(201).send({
      status: false,
      message: lang.__('token.required'),
      data: []
    })
  }
}

const verifyTokenCustomer = async (req, res, next) => {
  const response = (message) => res.status(201).send({
    status: false,
    message,
    data: []
  })
  if (req?.headers?.authorization) {
    next()
  } else {
    response(lang.__('token.required'))
  }
}

const verifyTokenClient = async (req, res, next) => {
  const response = (message) => res.status(201).send({
    status: false,
    message,
    data: []
  })
  if (req?.headers?.authorization) {
    next()
  } else {
    response(lang.__('token.required'))
  }
}

const verifyTokenAuction = async (req, res, next) => {
  const response = (message) => res.status(201).send({
    status: false,
    message,
    data: []
  })
  if (req?.headers?.authorization) {
    next()
  } else {
    response(lang.__('token.required'))
  }
}

module.exports = {
  verifyToken,
  verifyTokenCustomer,
  verifyTokenClient,
  verifyTokenAuction
}
