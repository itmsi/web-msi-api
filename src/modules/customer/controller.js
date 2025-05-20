const { validationResult } = require('express-validator')
const { create } = require('./postgre_repository')
const { lang } = require('../../lang')
const { mappingError } = require('../../utils')

const createCustomer = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        message: lang.__('validator.error'),
        errors: errors.array()
      })
    }

    // Create customer
    const result = await create(req.body)

    // Return response
    return res.status(result.status === false ? 400 : 201).json(result)
  } catch (error) {
    error.path = __filename
    return res.status(500).json(mappingError(error))
  }
}

module.exports = {
  createCustomer
}
