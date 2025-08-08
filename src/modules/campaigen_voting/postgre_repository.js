const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const {
  mappingSuccess,
  mappingError,
  manipulateDate,
  mappingSuccessPagination,
  todayFormat
} = require('../../utils')
const { lang } = require('../../lang')

const TABLE = 'mst_campaigen_voting'
const EMAIL_TABLE = 'mst_email_employee'

const COLUMN_ALL = [
  `${TABLE}.campaigen_voting_id`, `${TABLE}.email_employee_id`, `${TABLE}.campaigen_voting_email`, `${TABLE}.campaign_participant_id`, `${TABLE}.campaigen_voting_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.campaigen_voting_id`, `${TABLE}.email_employee_id`, `${TABLE}.campaigen_voting_email`, `${TABLE}.campaign_participant_id`, `${TABLE}.campaigen_voting_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.campaigen_voting_id) {
    builder.where(`${TABLE}.campaigen_voting_id`, where.campaigen_voting_id)
  }
  if (where.campaign_participant_id) {
    builder.where(`${TABLE}.campaign_participant_id`, where.campaign_participant_id)
  }
  if (where.campaigen_voting_email) {
    builder.where(`${TABLE}.campaigen_voting_email`, where.campaigen_voting_email)
  }

  if (search) {
    builder.whereILike(`${TABLE}.campaigen_voting_email`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
  }

  return builder
}

const sql = (where, search = false) => {
  let query = pgCore(TABLE)
    .leftJoin(EMAIL_TABLE, `${TABLE}.email_employee_id`, `${EMAIL_TABLE}.email_employee_id`)
  if (where != null) {
    query = query.where((builder) => {
      condition(builder, where, search)
    })
  }

  return query
}

const create = async (payload) => {
  const transaction = await pgCore.transaction();

  try {
    const result = await Repo.insert(TABLE, payload, COLUMN[0])

    if (!result) {
      transaction.rollback();
      return mappingSuccess(lang.__('created.failed'), null, 200, false)
    }

    transaction.commit();
    return mappingSuccess(lang.__('created.success'), result)
  } catch (error) {
    transaction.rollback();
    error.path = __filename
    return mappingError(error)
  }
}

const get = async (where, filter, column = COLUMN) => {
  try {
    // Base query + window function untuk ambil record terbaru per email
    const baseQuery = sql(where, filter.search).clone()
      .select([...column, `${EMAIL_TABLE}.email_employee_email as email_employee`])
      .select(pgCore.raw(
        'ROW_NUMBER() OVER (PARTITION BY COALESCE(??, ??) ORDER BY ?? DESC) as rn',
        [
          `${TABLE}.campaigen_voting_email`,
          `${EMAIL_TABLE}.email_employee_email`,
          `${TABLE}.created_at`,
        ]
      ))

    // Ambil hanya baris rn = 1 (terbaru per email)
    const result = await pgCore.from(baseQuery.as('t'))
      .where('t.rn', 1)
      .orderBy((typeof filter.direction === 'string' ? filter.direction.split('.').pop() : filter.direction), filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    // Hitung jumlah grup (distinct email)
    const [rows] = await pgCore.from(baseQuery.as('t')).where('t.rn', 1).count('*')

    return mappingSuccessPagination(lang.__('get.success'), {
      result: manipulateDate(result),
      count: rows?.count
    })
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select([...column, `${EMAIL_TABLE}.email_employee_email as email_employee`])
      .where(`${TABLE}.campaigen_voting_id`, where?.campaigen_voting_id)
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.campaigen_voting_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const update = async (where, payload, name = '') => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.campaigen_voting_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.campaigen_voting_id })
      const [rows] = await pgCore(TABLE).select(['campaigen_voting_id', 'campaigen_voting_email']).where(where)
      if (rows) {
        payload.campaigen_voting_description = `archived-${format}-${rows.campaigen_voting_description || ''}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['campaigen_voting_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.campaigen_voting_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

const findEmailEmployeeByEmail = async (email) => {
  if (!email) return null
  const rows = await pgCore(EMAIL_TABLE)
    .select(['email_employee_id'])
    .where({ email_employee_email: email, deleted_at: null })
    .first()
  return rows
}

module.exports = {
  create,
  get,
  update,
  getByParam,
  findEmailEmployeeByEmail,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
