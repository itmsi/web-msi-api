const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat,
  generatePassword,
  MODEL_PROPERTIES: { PRIMARY_KEY }
} = require('../../utils')
const { generateCustomerNo } = require('../../utils/customer')
const { lang } = require('../../lang')

const TABLE = 'mst_customer'
const COLUMN_ALL = [
  `${TABLE}.customer_id`, `${TABLE}.customer_no`, `${TABLE}.first_name`, `${TABLE}.last_name`,
  `${TABLE}.email`, `${TABLE}.password`, `${TABLE}.salt`, `${TABLE}.mobile_phone`, `${TABLE}.registration_date`,
  `${TABLE}.birthplace`, `${TABLE}.birthdate`, `${TABLE}.ktp_no`, `${TABLE}.address`,
  `${TABLE}.company_name`, `${TABLE}.company_address`, `${TABLE}.company_phone`, `${TABLE}.npwp`,
  `${TABLE}.status`, `${TABLE}.session`, `${TABLE}.otp_reset`, `${TABLE}.customer_point`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.customer_id`, `${TABLE}.customer_no`, `${TABLE}.first_name`, `${TABLE}.last_name`,
  `${TABLE}.email`, `${TABLE}.password`, `${TABLE}.salt`, `${TABLE}.mobile_phone`, `${TABLE}.registration_date`,
  `${TABLE}.birthplace`, `${TABLE}.birthdate`, `${TABLE}.ktp_no`, `${TABLE}.address`,
  `${TABLE}.company_name`, `${TABLE}.company_address`, `${TABLE}.company_phone`, `${TABLE}.npwp`,
  `${TABLE}.status`, `${TABLE}.session`, `${TABLE}.otp_reset`, `${TABLE}.customer_point`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.customer_id) {
    builder.where(`${TABLE}.customer_id`, where.customer_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.customer_no`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.first_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.last_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.email`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)

  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}
/**
 *
 *
 * @param {*} payload
 * @return {*}
 */
const create = async (payload) => {
  try {
    // Generate customer number
    const customerNo = await generateCustomerNo()

    // Prepare customer data with proper password handling
    const passwordPayload = { password: payload.password }
    const { password, salt } = generatePassword(passwordPayload)

    // Prepare customer data
    const customerData = {
      ...payload,
      password,
      salt,
      customer_no: customerNo,
      registration_date: new Date(),
      status: '1', // Active by default
      created_at: new Date()
    }

    // Insert into database
    const [result] = await pgCore(TABLE)
      .insert(customerData)
      .returning('*')

    return mappingSuccess(lang.__('create.success'), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} filter
 * @return {*}
 */
const get = async (where, filter, column = COLUMN) => {
  try {
    const result = await sql(where, filter.search).clone()
      .select(column)
      .orderBy(`${filter.direction}`, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await sql(where, filter.search).clone().count(column[0])

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} column
 * @return {*}
 */
const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select(column)
      .where(`${TABLE}.${PRIMARY_KEY.CUSTOMER}`, where?.[PRIMARY_KEY.CUSTOMER])
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.customer_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}
/**
 *
 *
 * @param {*} where
 * @param {*} payload
 * @return {*}
 */
const update = async (where, payload, name = '') => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.customer_id })
      if (payload.password) {
        const passwordPayload = { password: payload.password }
        const { password, salt } = generatePassword(passwordPayload)
        payload.password = password
        payload.salt = salt
      }
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.customer_id })
      const [rows] = await pgCore(TABLE).select(['first_name', 'last_name', 'email', 'mobile_phone', 'address', 'company_name', 'company_address', 'company_phone', 'npwp']).where(where)
      if (rows) {
        payload.first_name = `archived-${format}-${rows.first_name}`
        payload.last_name = `archived-${format}-${rows.last_name}`
        payload.email = `archived-${format}-${rows.email}`
        payload.mobile_phone = `archived-${format}-${rows.mobile_phone}`
        payload.address = `archived-${format}-${rows.address}`
        payload.company_name = `archived-${format}-${rows.company_name}`
        payload.company_address = `archived-${format}-${rows.company_address}`
        payload.company_phone = `archived-${format}-${rows.company_phone}`
        payload.npwp = `archived-${format}-${rows.npwp}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['customer_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.customer_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
