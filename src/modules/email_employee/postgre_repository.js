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

const TABLE = 'mst_email_employee'

const COLUMN_ALL = [
  `${TABLE}.email_employee_id`, `${TABLE}.email_employee_name`, `${TABLE}.email_employee_email`, `${TABLE}.email_employee_alias`, `${TABLE}.email_employee_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const COLUMN = [
  `${TABLE}.email_employee_id`, `${TABLE}.email_employee_name`, `${TABLE}.email_employee_email`, `${TABLE}.email_employee_alias`, `${TABLE}.email_employee_description`,
  `${TABLE}.created_at`, `${TABLE}.created_by`, `${TABLE}.updated_at`, `${TABLE}.updated_by`,
  `${TABLE}.deleted_at`, `${TABLE}.deleted_by`
]

const DEFAULT_SORT = [COLUMN[0], 'DESC']

const condition = (builder, where, search = null) => {
  builder.where(`${TABLE}.deleted_at`, null)

  if (where.email_employee_id) {
    builder.where(`${TABLE}.email_employee_id`, where.email_employee_id)
  }

  if (search) {
    builder.whereILike(`${TABLE}.email_employee_name`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.email_employee_email`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
    builder.orWhereILike(`${TABLE}.email_employee_alias`, `%${search}%`).andWhere(`${TABLE}.deleted_at`, null)
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
 * Create new email employee
 * @param {*} payload
 * @return {*}
 */
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

/**
 * Import email employee from Excel
 * @param {*} payload
 * @return {*}
 */
const importFromExcel = async (payload) => {
  const transaction = await pgCore.transaction();

  try {
    const { data, created_by } = payload;
    const results = [];
    const errors = [];

    // Process all rows
    const promises = data.map(async (row, index) => {
      const rowNumber = index + 2; // Excel row number (starting from 2 because row 1 is header)

      try {
        // Check if at least one field is filled (to avoid empty rows)
        if (!row.email_employee_name && !row.email_employee_email && !row.email_employee_alias) {
          // Skip empty rows
          return {
            type: 'skip',
            row: rowNumber,
            message: 'Baris kosong, dilewati'
          };
        }

        // Check if email already exists (only if email is provided)
        if (row.email_employee_email) {
          const existingEmail = await pgCore(TABLE)
            .select(['email_employee_id'])
            .where({
              email_employee_email: row.email_employee_email,
              deleted_at: null
            })
            .first();

          if (existingEmail) {
            return {
              type: 'error',
              row: rowNumber,
              message: `Email ${row.email_employee_email} sudah terdaftar`
            };
          }
        }

        // Insert new record (all fields are optional)
        const insertPayload = {
          email_employee_name: row.email_employee_name || null,
          email_employee_email: row.email_employee_email || null,
          email_employee_alias: row.email_employee_alias || null,
          email_employee_description: row.email_employee_description || null,
          created_at: new Date().toISOString(),
          created_by
        };

        const result = await Repo.insert(TABLE, insertPayload, COLUMN[0]);

        if (result) {
          return {
            type: 'success',
            row: rowNumber,
            data: result,
            status: 'success'
          };
        }
        return {
          type: 'error',
          row: rowNumber,
          message: 'Gagal menyimpan data'
        };
      } catch (error) {
        return {
          type: 'error',
          row: rowNumber,
          message: error.message
        };
      }
    });

    const processedResults = await Promise.all(promises);

    // Separate results and errors
    processedResults.forEach((result) => {
      if (result.type === 'success') {
        results.push(result);
      } else if (result.type === 'error') {
        errors.push(result);
      }
      // Skip results with type 'skip' (empty rows)
    });

    if (errors.length > 0) {
      await transaction.rollback();
      return mappingSuccess('Import selesai dengan beberapa error', {
        success: results.length,
        errors: errors.length,
        details: {
          success: results,
          errors
        }
      }, 200, false);
    }

    await transaction.commit();
    return mappingSuccess(`Berhasil mengimport ${results.length} data email employee`, {
      success: results.length,
      errors: 0,
      details: {
        success: results,
        errors: []
      }
    });
  } catch (error) {
    await transaction.rollback();
    error.path = __filename;
    return mappingError(error);
  }
}

/**
 * Get email employee with pagination
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
 * Get email employee by ID
 * @param {*} where
 * @param {*} column
 * @return {*}
 */
const getByParam = async (where, column = COLUMN_ALL) => {
  try {
    const [rows] = await sql(null).clone()
      .select(column)
      .where(`${TABLE}.email_employee_id`, where?.email_employee_id)
    if (rows) {
      return mappingSuccess(lang.__('get.success'), rows)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.email_employee_id }), rows)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

/**
 * Update email employee
 * @param {*} where
 * @param {*} payload
 * @return {*}
 */
const update = async (where, payload, name = '') => {
  try {
    let { message, result } = ['', '']
    where[`${TABLE}.deleted_at`] = null
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.email_employee_id })
      result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    } else {
      const format = todayFormat('YYYYMMDDhmmss')
      message = lang.__('archive.success', { id: where?.email_employee_id })
      const [rows] = await pgCore(TABLE).select(['email_employee_id', 'email_employee_name', 'email_employee_email', 'email_employee_alias']).where(where)
      if (rows) {
        payload.email_employee_description = `archived-${format}-${rows.email_employee_description}`
      }
    }
    delete payload?.type_method
    result = await pgCore(TABLE).where(where).update(payload).returning(['email_employee_id'])
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.email_employee_id }), result)
  } catch (error) {
    error.path = __filename
    return mappingError(error)
  }
}

module.exports = {
  create,
  importFromExcel,
  get,
  update,
  getByParam,
  COLUMN,
  DEFAULT_SORT,
  TABLE
}
