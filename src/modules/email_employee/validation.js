const Joi = require('joi')

const postValidation = (req, res, next) => {
  const schema = Joi.object({
    email_employee_name: Joi.string().max(200).required().messages({
      'string.empty': 'Nama email employee tidak boleh kosong',
      'string.max': 'Nama email employee maksimal 200 karakter',
      'any.required': 'Nama email employee harus diisi'
    }),
    email_employee_email: Joi.string().email().max(200).required().messages({
      'string.empty': 'Email tidak boleh kosong',
      'string.email': 'Format email tidak valid',
      'string.max': 'Email maksimal 200 karakter',
      'any.required': 'Email harus diisi'
    }),
    email_employee_alias: Joi.string().max(200).required().messages({
      'string.empty': 'Alias tidak boleh kosong',
      'string.max': 'Alias maksimal 200 karakter',
      'any.required': 'Alias harus diisi'
    }),
    email_employee_description: Joi.string().allow(null, '').optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(200).json({
      status: false,
      message: error.details[0].message,
      data: []
    })
  }
  next()
}

const putValidation = (req, res, next) => {
  const schema = Joi.object({
    email_employee_name: Joi.string().max(200).optional().messages({
      'string.max': 'Nama email employee maksimal 200 karakter'
    }),
    email_employee_email: Joi.string().email().max(200).optional().messages({
      'string.email': 'Format email tidak valid',
      'string.max': 'Email maksimal 200 karakter'
    }),
    email_employee_alias: Joi.string().max(200).optional().messages({
      'string.max': 'Alias maksimal 200 karakter'
    }),
    email_employee_description: Joi.string().allow(null, '').optional()
  })

  const { error } = schema.validate(req.body)
  if (error) {
    return res.status(200).json({
      status: false,
      message: error.details[0].message,
      data: []
    })
  }
  next()
}

const paramValidation = (req, res, next) => {
  const schema = Joi.object({
    email_employee_id: Joi.string().uuid().required().messages({
      'string.guid': 'ID email employee tidak valid',
      'any.required': 'ID email employee harus diisi'
    })
  })

  const { error } = schema.validate(req.params)
  if (error) {
    return res.status(200).json({
      status: false,
      message: error.details[0].message,
      data: []
    })
  }
  next()
}

module.exports = {
  postValidation,
  putValidation,
  paramValidation
} 