/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
const { pgCore } = require('../../config/database')
const Repo = require('../../repository/postgres/core_postgres')
const Users = require('../users/postgre_repository')
const {
  mappingSuccess, mappingError, manipulateDate, mappingSuccessPagination, ROLE, ucword
} = require('../../utils')
const { lang } = require('../../lang')

const COLUMN = ['role_id', 'role_name', 'created_at', 'created_by', 'updated_at', 'updated_by', 'deleted_at', 'deleted_by',
  pgCore.raw(`
  (CASE WHEN (SELECT count(users_id) FROM mst_users WHERE role_id = mst_role.role_id
    AND deleted_at IS NULL) = '0' THEN true ELSE false END) as can_deleted`)
]
const TABLE = 'mst_role'
const TABLE_ASSIGN = 'mst_role_has_permissions'
const DEFAULT_SORT = [COLUMN[0], 'DESC']
const condition = (builder, where, search) => {
  if (search) {
    builder.whereNotIn('role_name', [ROLE.ADMIN])
    builder.where(where).whereILike('role_name', `%${search}%`).andWhere('deleted_at', null)
  } else {
    builder.where(where)
    builder.whereNotIn('role_name', [ROLE.ADMIN])
    builder.andWhere('deleted_at', null)
  }
  return builder
}
/**
 *
 *
 * @param {*} payload
 * @return {*}
 */
const create = async (payload) => {
  try {
    payload.role_name = ucword(payload?.role_name)
    const result = await Repo.insert(TABLE, payload, COLUMN[0])
    return mappingSuccess(lang.__('created.success'), result)
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
    const result = await pgCore(TABLE).select(column)
      .where((builder) => {
        condition(builder, where, filter.search)
      })
      .orderBy(filter.direction, filter.order)
      .limit(filter.limit)
      .offset(((filter.page - 1) * filter.limit))

    const [rows] = await pgCore(TABLE)
      .where((builder) => {
        condition(builder, where, filter.search)
      })
      .count(column[0])

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
const getByParam = async (where, column = COLUMN) => {
  try {
    where.deleted_at = null
    const result = await Repo.fetchByParam(TABLE, where, column)
    if (result) {
      return mappingSuccess(lang.__('get.success'), result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.role_id }), result)
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
    let message = ''
    if (payload.type_method === 'update') {
      message = lang.__('updated.success', { id: where?.role_id })
    } else {
      const conditionCheck = {
        'mst_users.role_id': where?.role_id
      }
      const rows = await Users.getByParam(conditionCheck)
      if (rows?.data?.data?.role_id) {
        return mappingSuccess(lang.__('validator.can.deleted'), [], 201, false)
      }
      message = lang.__('archive.success', { id: where?.role_id })
      payload.role_name = ucword(payload?.role_name)
    }
    const result = await Repo.updated(TABLE, where, payload, COLUMN[0], name)
    if (result) {
      return mappingSuccess(message, result)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.role_id }), result)
  } catch (error) {
    error.path = __filename
return mappingError(error)
  }
}

/**
 * @param {*} where
 * @param {*} column
 * @return {*}
*/
const assignPermission = async (where, payload, column = COLUMN) => {
  try {
    const result = await Repo.fetchByParam(TABLE, where, column)
    if (result) {
      payload.permissions.map(async (r) => {
        if (r.checked === true) {
          delete r.checked
          await pgCore(TABLE_ASSIGN).insert(r)
        } else {
          delete r.checked
          await pgCore(TABLE_ASSIGN).where(r).del()
        }
      })
      return mappingSuccess(lang.__('get.success'), payload)
    }
    return mappingSuccess(lang.__('not.found.id', { id: where?.role_id }), result)
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
  assignPermission,
  DEFAULT_SORT
}
